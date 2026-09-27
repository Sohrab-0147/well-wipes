package com.wellwipes.productservice.controller;

import com.wellwipes.productservice.dto.CreateReviewRequest;
import com.wellwipes.productservice.dto.ReviewResponse;
import com.wellwipes.productservice.dto.ReviewSummaryResponse;
import com.wellwipes.productservice.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products/{productId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ReviewSummaryResponse summary(@PathVariable UUID productId) {
        return reviewService.getSummary(productId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse create(@PathVariable UUID productId,
                                  @AuthenticationPrincipal Jwt jwt,
                                  @Valid @RequestBody CreateReviewRequest req) {
        UUID userId = UUID.fromString(jwt.getSubject());
        String name = jwt.getClaimAsString("name");
        if (name == null) name = jwt.getClaimAsString("email");
        return reviewService.create(productId, userId, name, req);
    }

    @DeleteMapping("/{reviewId}")
    public void delete(@PathVariable UUID productId,
                       @PathVariable UUID reviewId,
                       @AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        boolean isAdmin = "ADMIN".equals(jwt.getClaimAsString("role"));
        reviewService.delete(reviewId, userId, isAdmin);
    }
}
