package com.wellwipes.paymentservice.service;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.wellwipes.common.event.PaymentFailedEvent;
import com.wellwipes.common.event.PaymentSucceededEvent;
import com.wellwipes.paymentservice.domain.Payment;
import com.wellwipes.paymentservice.domain.PaymentStatus;
import com.wellwipes.paymentservice.domain.StripeEvent;
import com.wellwipes.paymentservice.messaging.PaymentEventPublisher;
import com.wellwipes.paymentservice.repository.PaymentRepository;
import com.wellwipes.paymentservice.repository.StripeEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class StripeWebhookService {

    private final PaymentRepository paymentRepository;
    private final StripeEventRepository stripeEventRepository;
    private final PaymentEventPublisher publisher;

    @Value("${wellwipes.stripe.webhook-secret}")
    private String webhookSecret;

    @Transactional
    public void handle(String payload, String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException ex) {
            log.warn("Stripe signature verification failed: {}", ex.getMessage());
            throw new RuntimeException("Invalid Stripe signature", ex);
        }

        if (stripeEventRepository.existsById(event.getId())) {
            log.info("Stripe event {} already processed — skipping", event.getId());
            return;
        }
        stripeEventRepository.save(StripeEvent.builder()
                .stripeEventId(event.getId())
                .eventType(event.getType())
                .build());

        switch (event.getType()) {
            case "checkout.session.completed" -> onCheckoutCompleted(event);
            case "checkout.session.expired" -> onCheckoutExpired(event);
            case "payment_intent.payment_failed" -> log.info("Payment intent failed: {}", event.getId());
            default -> log.debug("Ignoring Stripe event type {}", event.getType());
        }
    }

    private void onCheckoutCompleted(Event event) {
        Session session = (Session) event.getDataObjectDeserializer()
                .getObject()
                .orElseThrow(() -> new IllegalStateException("Unable to deserialize session"));

        Payment payment = paymentRepository.findByStripeSessionId(session.getId())
                .orElseThrow(() -> new IllegalStateException("Payment not found for session " + session.getId()));

        if (payment.getStatus() == PaymentStatus.SUCCEEDED) {
            log.info("Payment {} already SUCCEEDED — skipping", payment.getId());
            return;
        }

        payment.setStatus(PaymentStatus.SUCCEEDED);
        payment.setStripePaymentIntentId(session.getPaymentIntent());
        paymentRepository.save(payment);

        publisher.publishSucceeded(PaymentSucceededEvent.of(
                payment.getId(), payment.getOrderId(), payment.getUserId(),
                payment.getAmountCents(), payment.getCurrency(), payment.getStripeSessionId()
        ));
    }

    private void onCheckoutExpired(Event event) {
        Session session = (Session) event.getDataObjectDeserializer()
                .getObject()
                .orElseThrow(() -> new IllegalStateException("Unable to deserialize session"));

        paymentRepository.findByStripeSessionId(session.getId()).ifPresent(payment -> {
            if (payment.getStatus() == PaymentStatus.PENDING) {
                payment.setStatus(PaymentStatus.EXPIRED);
                payment.setFailureReason("Checkout session expired");
                paymentRepository.save(payment);

                publisher.publishFailed(PaymentFailedEvent.of(
                        payment.getId(), payment.getOrderId(), payment.getUserId(),
                        payment.getAmountCents(), payment.getCurrency(),
                        "Checkout session expired"
                ));
            }
        });
    }
}
