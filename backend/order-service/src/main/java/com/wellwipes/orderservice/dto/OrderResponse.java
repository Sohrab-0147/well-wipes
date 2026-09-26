package com.wellwipes.orderservice.dto;

import com.wellwipes.orderservice.domain.OrderStatus;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        UUID userId,
        OrderStatus status,
        Long totalCents,
        String currency,
        Map<String, Object> shippingAddress,
        String stripeSessionId,
        String checkoutUrl,
        List<OrderItemResponse> items,
        Instant createdAt,
        Instant updatedAt
) {}
