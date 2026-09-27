package com.wellwipes.adminservice.dto;

public record DashboardStats(
        long totalOrders,
        long paidOrders,
        long pendingOrders,
        long failedOrders,
        long cancelledOrders,
        long revenueCents,
        String currency,
        long totalProducts
) {}
