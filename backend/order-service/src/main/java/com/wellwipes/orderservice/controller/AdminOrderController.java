package com.wellwipes.orderservice.controller;

import com.wellwipes.orderservice.domain.OrderStatus;
import com.wellwipes.orderservice.dto.OrderResponse;
import com.wellwipes.orderservice.dto.OrderStatsResponse;
import com.wellwipes.orderservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public Page<OrderResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        var pageable = PageRequest.of(page, Math.min(size, 100), Sort.by("createdAt").descending());
        if (status != null && !status.isBlank()) {
            return orderService.listAllByStatus(OrderStatus.valueOf(status.toUpperCase()), pageable);
        }
        return orderService.listAllForAdmin(pageable);
    }

    @GetMapping("/stats")
    public OrderStatsResponse stats() {
        return orderService.getStats();
    }

    @PatchMapping("/{id}/status")
    public OrderResponse updateStatus(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("status is required");
        }
        return orderService.updateStatus(id, OrderStatus.valueOf(status.toUpperCase()));
    }
}
