package com.wellwipes.adminservice.client;

import com.wellwipes.adminservice.exception.DownstreamServiceException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
public class ProductServiceClient {

    private final RestClient restClient;

    public ProductServiceClient(@Value("${wellwipes.services.product-service.url}") String baseUrl) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    @SuppressWarnings("unchecked")
    public long getProductCount() {
        try {
            Map<String, Object> page = restClient.get()
                    .uri("/api/v1/products?size=1")
                    .retrieve()
                    .body(Map.class);
            Object total = page.get("totalElements");
            return total instanceof Number n ? n.longValue() : 0L;
        } catch (Exception ex) {
            throw new DownstreamServiceException("Product service unavailable", ex);
        }
    }
}
