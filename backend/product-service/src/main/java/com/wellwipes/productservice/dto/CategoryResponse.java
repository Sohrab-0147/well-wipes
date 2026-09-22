package com.wellwipes.productservice.dto;

import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String name,
        String slug,
        String description,
        Integer displayOrder,
        Boolean active
) {}
