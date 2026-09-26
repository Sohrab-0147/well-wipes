package com.wellwipes.common.event;

import java.time.Instant;
import java.util.UUID;

public record PaymentSucceededEvent(
        UUID eventId,
        UUID paymentId,
        UUID orderId,
        UUID userId,
        Long amountCents,
        String currency,
        String stripeSessionId,
        Instant occurredAt
) {
    public static PaymentSucceededEvent of(UUID paymentId, UUID orderId, UUID userId,
                                            Long amountCents, String currency,
                                            String stripeSessionId) {
        return new PaymentSucceededEvent(
                UUID.randomUUID(), paymentId, orderId, userId,
                amountCents, currency, stripeSessionId, Instant.now()
        );
    }
}
