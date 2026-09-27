package com.wellwipes.adminservice.service;

import com.wellwipes.adminservice.client.OrderServiceClient;
import com.wellwipes.adminservice.client.ProductServiceClient;
import com.wellwipes.adminservice.dto.DashboardStats;
import com.wellwipes.adminservice.dto.OrderStatsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final OrderServiceClient orderClient;
    private final ProductServiceClient productClient;

    public DashboardStats getStats(String bearerToken) {
        OrderStatsResponse orders = orderClient.getStats(bearerToken);
        long products = productClient.getProductCount();

        return new DashboardStats(
                orders.total(),
                orders.paid(),
                orders.pending(),
                orders.failed(),
                orders.cancelled(),
                orders.revenueCents(),
                orders.currency(),
                products
        );
    }
}
