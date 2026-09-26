package com.wellwipes.paymentservice.dto;

import com.wellwipes.paymentservice.domain.PaymentStatus;

import java.time.Instant;
import java.util.UUID;

public record PaymentResponse(
        UUID id,
        UUID orderId,
        UUID userId,
        Long amountCents,
        String currency,
        PaymentStatus status,
        String stripeSessionId,
        String failureReason,
        Instant createdAt,
        Instant updatedAt
) {}
