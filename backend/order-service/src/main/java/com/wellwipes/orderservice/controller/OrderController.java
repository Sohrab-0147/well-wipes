package com.wellwipes.orderservice.controller;

import com.wellwipes.orderservice.dto.CreateOrderRequest;
import com.wellwipes.orderservice.dto.OrderResponse;
import com.wellwipes.orderservice.service.InvoiceService;
import com.wellwipes.orderservice.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final InvoiceService invoiceService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse create(@AuthenticationPrincipal Jwt jwt,
                                @RequestHeader("Authorization") String authorization,
                                @Valid @RequestBody CreateOrderRequest request) {
        UUID userId = UUID.fromString(jwt.getSubject());
        String userEmail = jwt.getClaimAsString("email");
        String userFullName = jwt.getClaimAsString("name");
        String bearerToken = authorization.substring(7);
        return orderService.create(userId, userEmail, userFullName, bearerToken, request);
    }

    @GetMapping
    public Page<OrderResponse> list(@AuthenticationPrincipal Jwt jwt,
                                    @RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "20") int size) {
        UUID userId = UUID.fromString(jwt.getSubject());
        size = Math.min(size, 100);
        return orderService.listForUser(userId,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }

    @GetMapping("/{id}")
    public OrderResponse get(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        UUID userId = UUID.fromString(jwt.getSubject());
        boolean isAdmin = "ADMIN".equals(jwt.getClaimAsString("role"));
        return orderService.getById(id, userId, isAdmin);
    }

    @PatchMapping("/{id}/cancel")
    public OrderResponse cancel(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        UUID userId = UUID.fromString(jwt.getSubject());
        boolean isAdmin = "ADMIN".equals(jwt.getClaimAsString("role"));
        return orderService.cancel(id, userId, isAdmin);
    }

    @GetMapping("/{id}/invoice")
    public org.springframework.http.ResponseEntity<byte[]> invoice(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        UUID userId = UUID.fromString(jwt.getSubject());
        boolean isAdmin = "ADMIN".equals(jwt.getClaimAsString("role"));
        var order = orderService.getById(id, userId, isAdmin);
        byte[] pdf = invoiceService.generate(
                orderService.getEntityById(id, userId, isAdmin));
        return org.springframework.http.ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=invoice-" + id.toString().substring(0, 8) + ".pdf")
                .body(pdf);
    }
}
