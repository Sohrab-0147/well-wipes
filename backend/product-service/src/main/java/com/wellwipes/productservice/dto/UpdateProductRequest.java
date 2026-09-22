package com.wellwipes.productservice.dto;

import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.util.Map;
import java.util.UUID;

public record UpdateProductRequest(
        @Size(max = 255) String name,
        @Size(max = 280) String slug,
        @Size(max = 500) String shortDescription,
        String description,
        UUID categoryId,
        @PositiveOrZero Long priceCents,
        @Size(min = 3, max = 3) String currency,
        @PositiveOrZero Integer stockQuantity,
        @Size(max = 512) String imageUrl,
        Map<String, Object> attributes,
        Boolean active,
        Boolean featured
) {}
