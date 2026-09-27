package com.wellwipes.orderservice.dto;

import com.wellwipes.orderservice.domain.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Map;

public record CreateOrderRequest(
        @NotEmpty @Valid List<CreateOrderItemRequest> items,
        Map<String, Object> shippingAddress,
        @Size(max = 64) String couponCode,
        PaymentMethod paymentMethod
) {}
