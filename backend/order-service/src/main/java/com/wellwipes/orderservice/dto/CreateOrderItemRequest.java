package com.wellwipes.orderservice.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateOrderItemRequest(
        @NotNull UUID productId,
        @NotNull @Min(1) @Max(999) Integer quantity
) {}
