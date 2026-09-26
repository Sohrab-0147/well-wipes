package com.wellwipes.aiservice.dto;

public record ReindexResponse(
        int productsIndexed,
        long durationMs
) {}
