package com.wellwipes.productservice.service;

import com.wellwipes.productservice.config.CacheConfig;
import com.wellwipes.productservice.domain.Category;
import com.wellwipes.productservice.dto.CategoryResponse;
import com.wellwipes.productservice.dto.CreateCategoryRequest;
import com.wellwipes.productservice.exception.DuplicateResourceException;
import com.wellwipes.productservice.exception.ProductNotFoundException;
import com.wellwipes.productservice.mapper.CategoryMapper;
import com.wellwipes.productservice.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Cacheable(cacheNames = CacheConfig.CATEGORIES, key = "'all-active'")
    @Transactional(readOnly = true)
    public List<CategoryResponse> listActive() {
        return categoryRepository.findByActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Transactional
    @CacheEvict(cacheNames = CacheConfig.CATEGORIES, allEntries = true)
    public CategoryResponse create(CreateCategoryRequest request) {
        if (categoryRepository.existsByName(request.name())) {
            throw new DuplicateResourceException("Category name already exists: " + request.name());
        }
        if (categoryRepository.existsBySlug(request.slug())) {
            throw new DuplicateResourceException("Category slug already exists: " + request.slug());
        }
        Category category = categoryMapper.toEntity(request);
        if (category.getActive() == null) category.setActive(true);
        if (category.getDisplayOrder() == null) category.setDisplayOrder(0);
        Category saved = categoryRepository.save(category);
        return categoryMapper.toResponse(saved);
    }

    @Transactional
    @CacheEvict(cacheNames = CacheConfig.CATEGORIES, allEntries = true)
    public void delete(UUID id) {
        if (!categoryRepository.existsById(id)) {
            throw new ProductNotFoundException("Category not found: " + id);
        }
        categoryRepository.deleteById(id);
    }
}
