package com.wellwipes.orderservice.dto;

import java.util.UUID;

public record TopProduct(
        UUID productId,
        String sku,
        String name,
        long unitsSold,
        long revenueCents
) {}
