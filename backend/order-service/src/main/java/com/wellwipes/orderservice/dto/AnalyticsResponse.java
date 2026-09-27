package com.wellwipes.orderservice.dto;

import java.util.List;

public record AnalyticsResponse(
        List<DailyRevenue> dailyRevenue,
        List<TopProduct> topProducts,
        long totalRevenueCents,
        long totalOrders,
        long averageOrderValueCents,
        String currency
) {}
