package com.wellwipes.productservice.dto;

import jakarta.validation.constraints.*;

import java.util.Map;
import java.util.UUID;

public record CreateProductRequest(
        @NotBlank @Size(max = 64) String sku,
        @NotBlank @Size(max = 255) String name,
        @NotBlank @Size(max = 280) String slug,
        @Size(max = 500) String shortDescription,
        String description,
        UUID categoryId,
        @NotNull @PositiveOrZero Long priceCents,
        @Size(min = 3, max = 3) String currency,
        @NotNull @PositiveOrZero Integer stockQuantity,
        @Size(max = 512) String imageUrl,
        Map<String, Object> attributes,
        Boolean active,
        Boolean featured
) {}
