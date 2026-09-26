package com.wellwipes.orderservice.client;

import com.wellwipes.orderservice.exception.DownstreamServiceException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentClient {

    private final RestClient.Builder restClientBuilder;

    @Value("${wellwipes.services.payment-service.url}")
    private String paymentServiceUrl;

    public record CheckoutResponse(String sessionId, String checkoutUrl) {}

    public CheckoutResponse createCheckout(String bearerToken, UUID orderId,
                                            List<Map<String, Object>> lineItems, String currency) {
        try {
            Map<String, Object> body = Map.of(
                    "orderId", orderId.toString(),
                    "lineItems", lineItems,
                    "currency", currency
            );
            return restClientBuilder.build()
                    .post()
                    .uri(paymentServiceUrl + "/api/v1/payments/checkout")
                    .header("Authorization", "Bearer " + bearerToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(CheckoutResponse.class);
        } catch (RestClientException ex) {
            log.error("Payment service call failed for order {}", orderId, ex);
            throw new DownstreamServiceException("Payment service unavailable", ex);
        }
    }
}
