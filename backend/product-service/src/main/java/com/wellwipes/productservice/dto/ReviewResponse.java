package com.wellwipes.productservice.dto;

import java.time.Instant;
import java.util.UUID;

public record ReviewResponse(
        UUID id,
        UUID userId,
        String userName,
        Integer rating,
        String title,
        String comment,
        Instant createdAt
) {}
