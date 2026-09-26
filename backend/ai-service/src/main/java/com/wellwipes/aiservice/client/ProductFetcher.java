package com.wellwipes.aiservice.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class ProductFetcher {

    private final RestClient restClient;

    public ProductFetcher(@Value("${wellwipes.services.product-service.url}") String baseUrl) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> fetchAll() {
        try {
            Map<String, Object> page = restClient.get()
                    .uri("/api/v1/products?size=100&page=0")
                    .retrieve()
                    .body(Map.class);
            return (List<Map<String, Object>>) page.get("content");
        } catch (Exception ex) {
            log.error("Failed to fetch products", ex);
            throw new RuntimeException("Product fetch failed", ex);
        }
    }
}
