package com.wellwipes.common.event;

import java.time.Instant;
import java.util.UUID;

public record PaymentSucceededEvent(
        UUID eventId,
        UUID paymentId,
        UUID orderId,
        UUID userId,
        String userEmail,
        String userFullName,
        Long amountCents,
        String currency,
        String stripeSessionId,
        Instant occurredAt
) {
    public static PaymentSucceededEvent of(UUID paymentId, UUID orderId, UUID userId,
                                            String userEmail, String userFullName,
                                            Long amountCents, String currency,
                                            String stripeSessionId) {
        return new PaymentSucceededEvent(
                UUID.randomUUID(), paymentId, orderId, userId,
                userEmail, userFullName,
                amountCents, currency, stripeSessionId, Instant.now()
        );
    }

    // Backward-compatible factory for existing callers
    public static PaymentSucceededEvent of(UUID paymentId, UUID orderId, UUID userId,
                                            Long amountCents, String currency,
                                            String stripeSessionId) {
        return of(paymentId, orderId, userId, null, null, amountCents, currency, stripeSessionId);
    }
}
