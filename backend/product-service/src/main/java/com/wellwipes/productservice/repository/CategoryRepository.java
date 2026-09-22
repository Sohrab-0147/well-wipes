package com.wellwipes.productservice.repository;

import com.wellwipes.productservice.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {

    Optional<Category> findBySlug(String slug);

    List<Category> findByActiveTrueOrderByDisplayOrderAsc();

    boolean existsByName(String name);

    boolean existsBySlug(String slug);
}
