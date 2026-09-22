package com.wellwipes.productservice.repository;

import com.wellwipes.productservice.domain.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    Optional<Product> findBySku(String sku);

    Optional<Product> findBySlug(String slug);

    boolean existsBySku(String sku);

    boolean existsBySlug(String slug);

    @EntityGraph(attributePaths = "category")
    Page<Product> findByActiveTrue(Pageable pageable);

    @EntityGraph(attributePaths = "category")
    Page<Product> findByActiveTrueAndCategoryId(UUID categoryId, Pageable pageable);

    @EntityGraph(attributePaths = "category")
    Page<Product> findByActiveTrueAndFeaturedTrue(Pageable pageable);

    @EntityGraph(attributePaths = "category")
    @Query("""
        SELECT p FROM Product p
        WHERE p.active = true
          AND (
              LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%'))
              OR LOWER(p.shortDescription) LIKE LOWER(CONCAT('%', :q, '%'))
              OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :q, '%'))
          )
    """)
    Page<Product> search(@Param("q") String q, Pageable pageable);
}
