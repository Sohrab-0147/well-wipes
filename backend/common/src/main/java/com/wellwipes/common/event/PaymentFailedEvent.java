package com.wellwipes.common.event;

import java.time.Instant;
import java.util.UUID;

public record PaymentFailedEvent(
        UUID eventId,
        UUID paymentId,
        UUID orderId,
        UUID userId,
        String userEmail,
        String userFullName,
        Long amountCents,
        String currency,
        String failureReason,
        Instant occurredAt
) {
    public static PaymentFailedEvent of(UUID paymentId, UUID orderId, UUID userId,
                                         String userEmail, String userFullName,
                                         Long amountCents, String currency,
                                         String failureReason) {
        return new PaymentFailedEvent(
                UUID.randomUUID(), paymentId, orderId, userId,
                userEmail, userFullName,
                amountCents, currency, failureReason, Instant.now()
        );
    }

    // Backward-compatible factory for existing callers
    public static PaymentFailedEvent of(UUID paymentId, UUID orderId, UUID userId,
                                         Long amountCents, String currency,
                                         String failureReason) {
        return of(paymentId, orderId, userId, null, null, amountCents, currency, failureReason);
    }
}
