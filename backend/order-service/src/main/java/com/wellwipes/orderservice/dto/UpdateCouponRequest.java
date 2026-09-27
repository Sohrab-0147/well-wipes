package com.wellwipes.orderservice.dto;

import com.wellwipes.orderservice.domain.CouponType;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record UpdateCouponRequest(
        @Size(max = 255) String description,
        CouponType type,
        @Positive Long value,
        @PositiveOrZero Long minOrderCents,
        @Positive Integer maxUses,
        Instant expiresAt,
        Boolean active
) {}
