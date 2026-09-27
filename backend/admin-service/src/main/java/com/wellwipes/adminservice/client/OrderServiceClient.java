package com.wellwipes.adminservice.client;

import com.wellwipes.adminservice.dto.OrderStatsResponse;
import com.wellwipes.adminservice.exception.DownstreamServiceException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class OrderServiceClient {

    private final RestClient restClient;

    public OrderServiceClient(@Value("${wellwipes.services.order-service.url}") String baseUrl) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    public OrderStatsResponse getStats(String bearerToken) {
        try {
            return restClient.get()
                    .uri("/api/v1/orders/admin/stats")
                    .header("Authorization", "Bearer " + bearerToken)
                    .retrieve()
                    .body(OrderStatsResponse.class);
        } catch (Exception ex) {
            throw new DownstreamServiceException("Order service unavailable", ex);
        }
    }
}
