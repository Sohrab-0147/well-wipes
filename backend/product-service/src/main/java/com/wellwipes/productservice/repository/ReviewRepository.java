package com.wellwipes.productservice.repository;

import com.wellwipes.productservice.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {

    List<Review> findByProductIdOrderByCreatedAtDesc(UUID productId);

    Optional<Review> findByProductIdAndUserId(UUID productId, UUID userId);

    long countByProductId(UUID productId);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.productId = :productId")
    double averageRating(@Param("productId") UUID productId);
}
