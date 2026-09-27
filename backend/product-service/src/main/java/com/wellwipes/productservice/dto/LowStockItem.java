package com.wellwipes.productservice.dto;

import java.util.UUID;

public record LowStockItem(
        UUID id,
        String sku,
        String name,
        String slug,
        Integer stockQuantity,
        Integer lowStockThreshold,
        String categoryName
) {}
