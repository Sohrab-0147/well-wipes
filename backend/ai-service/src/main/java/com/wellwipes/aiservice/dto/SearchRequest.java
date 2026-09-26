package com.wellwipes.aiservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record SearchRequest(
        @NotBlank String query,
        @Min(1) @Max(20) Integer topK
) {
    public SearchRequest {
        if (topK == null) topK = 5;
    }
}
