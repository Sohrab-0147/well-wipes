package com.wellwipes.productservice.dto;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        String sku,
        String name,
        String slug,
        String shortDescription,
        String description,
        Long priceCents,
        String currency,
        Integer stockQuantity,
        String imageUrl,
        Map<String, Object> attributes,
        Boolean active,
        Boolean featured,
        UUID categoryId,
        String categoryName,
        String categorySlug,
        Instant createdAt,
        Instant updatedAt
) {}
