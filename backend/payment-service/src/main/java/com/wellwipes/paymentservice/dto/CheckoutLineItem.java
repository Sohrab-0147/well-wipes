package com.wellwipes.paymentservice.dto;

import jakarta.validation.constraints.*;

public record CheckoutLineItem(
        @NotBlank String sku,
        @NotBlank String name,
        @NotNull @PositiveOrZero Long unitPriceCents,
        @NotNull @Min(1) @Max(999) Integer quantity
) {}
