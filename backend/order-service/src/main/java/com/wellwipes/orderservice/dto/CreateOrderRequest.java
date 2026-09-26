package com.wellwipes.orderservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.Map;

public record CreateOrderRequest(
        @NotEmpty @Valid List<CreateOrderItemRequest> items,
        Map<String, Object> shippingAddress
) {}
