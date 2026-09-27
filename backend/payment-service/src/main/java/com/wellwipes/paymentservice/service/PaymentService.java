package com.wellwipes.paymentservice.service;

import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.wellwipes.common.event.PaymentSucceededEvent;
import com.wellwipes.paymentservice.domain.Payment;
import com.wellwipes.paymentservice.domain.PaymentStatus;
import com.wellwipes.paymentservice.dto.CheckoutLineItem;
import com.wellwipes.paymentservice.dto.CheckoutRequest;
import com.wellwipes.paymentservice.dto.CheckoutResponse;
import com.wellwipes.paymentservice.dto.PaymentResponse;
import com.wellwipes.paymentservice.exception.PaymentNotFoundException;
import com.wellwipes.paymentservice.exception.PaymentProcessingException;
import com.wellwipes.paymentservice.messaging.PaymentEventPublisher;
import com.wellwipes.paymentservice.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentEventPublisher publisher;

    @Value("${wellwipes.stripe.success-url}")
    private String successUrl;

    @Value("${wellwipes.stripe.cancel-url}")
    private String cancelUrl;

    @Transactional
    public CheckoutResponse createCheckout(UUID userId, CheckoutRequest request) {
        long totalCents = request.lineItems().stream()
                .mapToLong(li -> li.unitPriceCents() * li.quantity())
                .sum();

        String currency = (request.currency() == null) ? "INR" : request.currency();

        SessionCreateParams.Builder builder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .putMetadata("orderId", request.orderId().toString())
                .putMetadata("userId", userId.toString());

        for (CheckoutLineItem item : request.lineItems()) {
            builder.addLineItem(SessionCreateParams.LineItem.builder()
                    .setQuantity(item.quantity().longValue())
                    .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency(currency.toLowerCase())
                            .setUnitAmount(item.unitPriceCents())
                            .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                    .setName(item.name())
                                    .putMetadata("sku", item.sku())
                                    .build())
                            .build())
                    .build());
        }

        Session session;
        try {
            session = Session.create(builder.build());
        } catch (StripeException ex) {
            log.error("Stripe session creation failed for order {}", request.orderId(), ex);
            throw new PaymentProcessingException("Stripe checkout failed: " + ex.getMessage(), ex);
        }

        Payment payment = Payment.builder()
                .orderId(request.orderId())
                .userId(userId)
                .stripeSessionId(session.getId())
                .amountCents(totalCents)
                .currency(currency)
                .status(PaymentStatus.PENDING)
                .build();
        paymentRepository.save(payment);

        return new CheckoutResponse(session.getId(), session.getUrl());
    }

    @Transactional(readOnly = true)
    public PaymentResponse getByOrderId(UUID orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found for order: " + orderId));
        return toResponse(payment);
    }

    /**
     * Reconcile payment status by asking Stripe directly. Used as a fallback
     * when the webhook is delayed, missed, or cannot be verified locally.
     */
    @Transactional
    public PaymentResponse syncStatus(UUID orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found for order: " + orderId));

        if (payment.getStatus() == PaymentStatus.SUCCEEDED) {
            return toResponse(payment);
        }

        if (payment.getStripeSessionId() == null) {
            throw new PaymentProcessingException("Payment has no Stripe session");
        }

        Session session;
        try {
            session = Session.retrieve(payment.getStripeSessionId());
        } catch (StripeException ex) {
            log.error("Stripe session retrieve failed for {}", payment.getStripeSessionId(), ex);
            throw new PaymentProcessingException("Stripe lookup failed: " + ex.getMessage(), ex);
        }

        String sessionStatus = session.getStatus();
        String paymentStatus = session.getPaymentStatus();
        log.info("Sync check: session={} status={} payment_status={}",
                session.getId(), sessionStatus, paymentStatus);

        if ("complete".equals(sessionStatus) && "paid".equals(paymentStatus)) {
            payment.setStatus(PaymentStatus.SUCCEEDED);
            payment.setStripePaymentIntentId(session.getPaymentIntent());
            paymentRepository.save(payment);

            publisher.publishSucceeded(PaymentSucceededEvent.of(
                    payment.getId(), payment.getOrderId(), payment.getUserId(),
                    payment.getAmountCents(), payment.getCurrency(), payment.getStripeSessionId()
            ));
            log.info("Payment {} reconciled as SUCCEEDED, event published", payment.getId());
        } else if ("expired".equals(sessionStatus)) {
            payment.setStatus(PaymentStatus.EXPIRED);
            payment.setFailureReason("Checkout session expired");
            paymentRepository.save(payment);
        }

        return toResponse(payment);
    }

    public static PaymentResponse toResponse(Payment p) {
        return new PaymentResponse(
                p.getId(), p.getOrderId(), p.getUserId(),
                p.getAmountCents(), p.getCurrency(), p.getStatus(),
                p.getStripeSessionId(), p.getFailureReason(),
                p.getCreatedAt(), p.getUpdatedAt()
        );
    }
}
