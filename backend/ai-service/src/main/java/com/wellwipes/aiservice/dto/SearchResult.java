package com.wellwipes.aiservice.dto;

import java.util.Map;

public record SearchResult(
        String productId,
        String sku,
        String slug,
        String name,
        Double score,
        Map<String, Object> metadata
) {}
