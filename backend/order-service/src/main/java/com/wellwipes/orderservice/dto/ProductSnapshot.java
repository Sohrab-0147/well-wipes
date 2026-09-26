package com.wellwipes.orderservice.dto;

import java.util.UUID;

public record ProductSnapshot(
        UUID id,
        String sku,
        String name,
        Long priceCents,
        String currency,
        Integer stockQuantity,
        Boolean active
) {}
