package com.wellwipes.aiservice.controller;

import com.wellwipes.aiservice.dto.*;
import com.wellwipes.aiservice.service.EmbeddingService;
import com.wellwipes.aiservice.service.RagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final RagService ragService;
    private final EmbeddingService embeddingService;

    @PostMapping("/search")
    public SearchResponse search(@Valid @RequestBody SearchRequest request) {
        return new SearchResponse(request.query(),
                ragService.search(request.query(), request.topK()));
    }

    @PostMapping("/ask")
    public AskResponse ask(@Valid @RequestBody AskRequest request) {
        var answer = ragService.ask(request.question());
        return new AskResponse(request.question(), answer.answer(), answer.sources());
    }

    @PostMapping("/reindex")
    @PreAuthorize("hasRole('ADMIN')")
    public ReindexResponse reindex() {
        return embeddingService.reindexAll();
    }
}
