package com.wellwipes.productservice.dto;

import java.util.UUID;

public record ProductSummaryResponse(
        UUID id,
        String sku,
        String name,
        String slug,
        String shortDescription,
        Long priceCents,
        String currency,
        String imageUrl,
        Boolean featured,
        UUID categoryId,
        String categoryName
) {}
