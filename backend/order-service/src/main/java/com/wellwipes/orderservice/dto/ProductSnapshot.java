package com.wellwipes.orderservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ProductSnapshot(
        UUID id,
        String sku,
        String name,
        Long priceCents,
        String currency,
        Integer stockQuantity,
        Boolean active
) {}
