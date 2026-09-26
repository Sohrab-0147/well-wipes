package com.wellwipes.orderservice.client;

import com.wellwipes.orderservice.dto.ProductSnapshot;
import com.wellwipes.orderservice.exception.DownstreamServiceException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProductClient {

    private final RestClient.Builder restClientBuilder;

    @Value("${wellwipes.services.product-service.url}")
    private String productServiceUrl;

    public ProductSnapshot getProduct(UUID productId) {
        try {
            return restClientBuilder.build()
                    .get()
                    .uri(productServiceUrl + "/api/v1/products/id/{id}", productId)
                    .retrieve()
                    .body(ProductSnapshot.class);
        } catch (RestClientException ex) {
            log.error("Failed to fetch product {}", productId, ex);
            throw new DownstreamServiceException("Product service unavailable", ex);
        }
    }
}
