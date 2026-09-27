package com.wellwipes.productservice.controller;

import com.wellwipes.productservice.dto.CreateProductRequest;
import com.wellwipes.productservice.dto.ProductResponse;
import com.wellwipes.productservice.dto.ProductSummaryResponse;
import com.wellwipes.productservice.dto.UpdateProductRequest;
import com.wellwipes.productservice.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public Page<ProductSummaryResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) String q
    ) {
        size = Math.min(size, 100);
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        if (q != null && !q.isBlank()) {
            return productService.search(q.trim(), pageable);
        }
        if (Boolean.TRUE.equals(featured)) {
            return productService.listFeatured(pageable);
        }
        if (categoryId != null) {
            return productService.listByCategory(categoryId, pageable);
        }
        return productService.listActive(pageable);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<ProductSummaryResponse> adminList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        size = Math.min(size, 200);
        return productService.listAll(page, size);
    }

    @GetMapping("/{slug}")
    public ProductResponse getBySlug(@PathVariable String slug) {
        return productService.getBySlug(slug);
    }

    @GetMapping("/id/{id}")
    public ProductResponse getById(@PathVariable UUID id) {
        return productService.getById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @RequestBody CreateProductRequest request) {
        return productService.create(request);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ProductResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateProductRequest request) {
        return productService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
