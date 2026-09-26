package com.wellwipes.aiservice.dto;

import java.util.List;

public record SearchResponse(
        String query,
        List<SearchResult> results
) {}
