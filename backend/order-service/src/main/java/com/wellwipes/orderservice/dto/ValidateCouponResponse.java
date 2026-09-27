package com.wellwipes.orderservice.dto;

public record ValidateCouponResponse(
        boolean valid,
        String code,
        String message,
        Long discountCents,
        Long finalTotalCents
) {}
