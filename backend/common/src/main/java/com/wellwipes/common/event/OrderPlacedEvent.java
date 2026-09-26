package com.wellwipes.common.event;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderPlacedEvent(
        UUID eventId,
        UUID orderId,
        UUID userId,
        Long totalCents,
        String currency,
        List<Item> items,
        Instant occurredAt
) {
    public record Item(UUID productId, String sku, String name, Long unitPriceCents, Integer quantity) {}

    public static OrderPlacedEvent of(UUID orderId, UUID userId, Long totalCents, String currency, List<Item> items) {
        return new OrderPlacedEvent(UUID.randomUUID(), orderId, userId, totalCents, currency, items, Instant.now());
    }
}
