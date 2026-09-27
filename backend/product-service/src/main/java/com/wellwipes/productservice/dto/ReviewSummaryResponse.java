package com.wellwipes.productservice.dto;

import java.util.List;

public record ReviewSummaryResponse(
        double averageRating,
        long totalCount,
        List<ReviewResponse> reviews
) {}
