package com.wellwipes.productservice.service;

import com.wellwipes.productservice.config.CacheConfig;
import com.wellwipes.productservice.domain.Category;
import com.wellwipes.productservice.domain.Product;
import com.wellwipes.productservice.dto.CreateProductRequest;
import com.wellwipes.productservice.dto.ProductResponse;
import com.wellwipes.productservice.dto.ProductSummaryResponse;
import com.wellwipes.productservice.dto.UpdateProductRequest;
import com.wellwipes.productservice.exception.DuplicateResourceException;
import com.wellwipes.productservice.exception.ProductNotFoundException;
import com.wellwipes.productservice.mapper.ProductMapper;
import com.wellwipes.productservice.repository.CategoryRepository;
import com.wellwipes.productservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    @Cacheable(cacheNames = CacheConfig.PRODUCTS, key = "#id")
    @Transactional(readOnly = true)
    public ProductResponse getById(UUID id) {
        log.debug("Cache miss for product id={}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found: " + id));
        return productMapper.toResponse(product);
    }

    @Cacheable(cacheNames = CacheConfig.PRODUCTS, key = "'slug:' + #slug")
    @Transactional(readOnly = true)
    public ProductResponse getBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ProductNotFoundException("Product not found: " + slug));
        return productMapper.toResponse(product);
    }

    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> listActive(Pageable pageable) {
        return productRepository.findByActiveTrue(pageable).map(productMapper::toSummary);
    }

    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> listByCategory(UUID categoryId, Pageable pageable) {
        return productRepository.findByActiveTrueAndCategoryId(categoryId, pageable)
                .map(productMapper::toSummary);
    }

    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> listFeatured(Pageable pageable) {
        return productRepository.findByActiveTrueAndFeaturedTrue(pageable)
                .map(productMapper::toSummary);
    }

    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> search(String q, Pageable pageable) {
        return productRepository.search(q, pageable).map(productMapper::toSummary);
    }

    @Transactional
    @CacheEvict(cacheNames = CacheConfig.PRODUCT_LISTS, allEntries = true)
    public ProductResponse create(CreateProductRequest request) {
        if (productRepository.existsBySku(request.sku())) {
            throw new DuplicateResourceException("SKU already exists: " + request.sku());
        }
        if (productRepository.existsBySlug(request.slug())) {
            throw new DuplicateResourceException("Slug already exists: " + request.slug());
        }

        Product product = productMapper.toEntity(request);
        if (request.currency() == null) {
            product.setCurrency("INR");
        }
        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ProductNotFoundException("Category not found: " + request.categoryId()));
            product.setCategory(category);
        }
        Product saved = productRepository.saveAndFlush(product);
        return productMapper.toResponse(saved);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(cacheNames = CacheConfig.PRODUCTS, key = "#id"),
            @CacheEvict(cacheNames = CacheConfig.PRODUCT_LISTS, allEntries = true)
    })
    public ProductResponse update(UUID id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found: " + id));

        if (request.name() != null) product.setName(request.name());
        if (request.slug() != null && !request.slug().equals(product.getSlug())) {
            if (productRepository.existsBySlug(request.slug())) {
                throw new DuplicateResourceException("Slug already exists: " + request.slug());
            }
            product.setSlug(request.slug());
        }
        if (request.shortDescription() != null) product.setShortDescription(request.shortDescription());
        if (request.description() != null) product.setDescription(request.description());
        if (request.priceCents() != null) product.setPriceCents(request.priceCents());
        if (request.currency() != null) product.setCurrency(request.currency());
        if (request.stockQuantity() != null) product.setStockQuantity(request.stockQuantity());
        if (request.imageUrl() != null) product.setImageUrl(request.imageUrl());
        if (request.attributes() != null) product.setAttributes(request.attributes());
        if (request.active() != null) product.setActive(request.active());
        if (request.featured() != null) product.setFeatured(request.featured());
        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ProductNotFoundException("Category not found: " + request.categoryId()));
            product.setCategory(category);
        }

        Product saved = productRepository.saveAndFlush(product);
        return productMapper.toResponse(saved);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(cacheNames = CacheConfig.PRODUCTS, key = "#id"),
            @CacheEvict(cacheNames = CacheConfig.PRODUCT_LISTS, allEntries = true)
    })
    public void delete(UUID id) {
        if (!productRepository.existsById(id)) {
            throw new ProductNotFoundException("Product not found: " + id);
        }
        productRepository.deleteById(id);
    }
}
