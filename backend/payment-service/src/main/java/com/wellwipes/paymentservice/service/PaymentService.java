package com.wellwipes.paymentservice.service;

import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.wellwipes.paymentservice.domain.Payment;
import com.wellwipes.paymentservice.domain.PaymentStatus;
import com.wellwipes.paymentservice.dto.CheckoutLineItem;
import com.wellwipes.paymentservice.dto.CheckoutRequest;
import com.wellwipes.paymentservice.dto.CheckoutResponse;
import com.wellwipes.paymentservice.dto.PaymentResponse;
import com.wellwipes.paymentservice.exception.PaymentNotFoundException;
import com.wellwipes.paymentservice.exception.PaymentProcessingException;
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

    public static PaymentResponse toResponse(Payment p) {
        return new PaymentResponse(
                p.getId(), p.getOrderId(), p.getUserId(),
                p.getAmountCents(), p.getCurrency(), p.getStatus(),
                p.getStripeSessionId(), p.getFailureReason(),
                p.getCreatedAt(), p.getUpdatedAt()
        );
    }
}
