package com.wellwipes.aiservice.dto;

import java.util.List;

public record AskResponse(
        String question,
        String answer,
        List<SearchResult> sources
) {}
