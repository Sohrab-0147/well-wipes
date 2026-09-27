package com.wellwipes.orderservice.dto;

import com.wellwipes.orderservice.domain.CouponType;

import java.time.Instant;
import java.util.UUID;

public record CouponResponse(
        UUID id,
        String code,
        String description,
        CouponType type,
        Long value,
        Long minOrderCents,
        Integer maxUses,
        Integer usedCount,
        Instant expiresAt,
        Boolean active,
        Instant createdAt
) {}
