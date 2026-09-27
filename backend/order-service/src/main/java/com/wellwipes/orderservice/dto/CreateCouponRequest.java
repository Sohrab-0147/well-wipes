package com.wellwipes.orderservice.dto;

import com.wellwipes.orderservice.domain.CouponType;
import jakarta.validation.constraints.*;

import java.time.Instant;

public record CreateCouponRequest(
        @NotBlank @Size(max = 64) String code,
        @Size(max = 255) String description,
        @NotNull CouponType type,
        @NotNull @Positive Long value,
        @NotNull @PositiveOrZero Long minOrderCents,
        @Positive Integer maxUses,
        Instant expiresAt,
        Boolean active
) {}
