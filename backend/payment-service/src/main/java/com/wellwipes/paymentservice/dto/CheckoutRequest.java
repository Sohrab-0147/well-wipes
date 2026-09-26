package com.wellwipes.paymentservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record CheckoutRequest(
        @NotNull UUID orderId,
        @NotEmpty @Valid List<CheckoutLineItem> lineItems,
        @Size(min = 3, max = 3) String currency
) {}
