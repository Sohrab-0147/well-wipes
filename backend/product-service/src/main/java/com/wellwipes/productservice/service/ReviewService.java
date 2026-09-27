package com.wellwipes.productservice.service;

import com.wellwipes.productservice.domain.Review;
import com.wellwipes.productservice.dto.CreateReviewRequest;
import com.wellwipes.productservice.dto.ReviewResponse;
import com.wellwipes.productservice.dto.ReviewSummaryResponse;
import com.wellwipes.productservice.exception.DuplicateResourceException;
import com.wellwipes.productservice.exception.ProductNotFoundException;
import com.wellwipes.productservice.repository.ProductRepository;
import com.wellwipes.productservice.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public ReviewSummaryResponse getSummary(UUID productId) {
        if (!productRepository.existsById(productId)) {
            throw new ProductNotFoundException("Product not found: " + productId);
        }
        List<ReviewResponse> reviews = reviewRepository
                .findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(this::toResponse)
                .toList();
        double avg = reviewRepository.averageRating(productId);
        long count = reviewRepository.countByProductId(productId);
        return new ReviewSummaryResponse(avg, count, reviews);
    }

    @Transactional
    public ReviewResponse create(UUID productId, UUID userId, String userName,
                                  CreateReviewRequest req) {
        if (!productRepository.existsById(productId)) {
            throw new ProductNotFoundException("Product not found: " + productId);
        }
        reviewRepository.findByProductIdAndUserId(productId, userId).ifPresent(r -> {
            throw new DuplicateResourceException("You've already reviewed this product");
        });

        Review review = Review.builder()
                .productId(productId)
                .userId(userId)
                .userName(userName == null || userName.isBlank() ? "Anonymous" : userName)
                .rating(req.rating())
                .title(req.title())
                .comment(req.comment())
                .build();

        Review saved = reviewRepository.save(review);
        log.info("Review created for product {} by {}", productId, userId);
        return toResponse(saved);
    }

    @Transactional
    public void delete(UUID reviewId, UUID userId, boolean isAdmin) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ProductNotFoundException("Review not found: " + reviewId));
        if (!isAdmin && !review.getUserId().equals(userId)) {
            throw new AccessDeniedException("Not your review");
        }
        reviewRepository.delete(review);
    }

    private ReviewResponse toResponse(Review r) {
        return new ReviewResponse(
                r.getId(), r.getUserId(), r.getUserName(),
                r.getRating(), r.getTitle(), r.getComment(), r.getCreatedAt()
        );
    }
}
