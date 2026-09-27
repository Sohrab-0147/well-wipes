package com.wellwipes.orderservice.dto;

public record OrderStatsResponse(
        long total,
        long paid,
        long pending,
        long failed,
        long cancelled,
        long revenueCents,
        String currency
) {}
