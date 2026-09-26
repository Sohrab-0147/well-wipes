package com.wellwipes.orderservice.dto;

import java.util.UUID;

public record OrderItemResponse(
        UUID id,
        UUID productId,
        String sku,
        String name,
        Long unitPriceCents,
        Integer quantity,
        Long subtotalCents
) {}
