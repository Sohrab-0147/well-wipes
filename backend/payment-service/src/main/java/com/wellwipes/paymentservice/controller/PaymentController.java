package com.wellwipes.paymentservice.controller;

import com.wellwipes.paymentservice.dto.CheckoutRequest;
import com.wellwipes.paymentservice.dto.CheckoutResponse;
import com.wellwipes.paymentservice.dto.PaymentResponse;
import com.wellwipes.paymentservice.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/checkout")
    public CheckoutResponse checkout(@AuthenticationPrincipal Jwt jwt,
                                     @Valid @RequestBody CheckoutRequest request) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return paymentService.createCheckout(userId, request);
    }

    @GetMapping("/order/{orderId}")
    public PaymentResponse getByOrder(@AuthenticationPrincipal Jwt jwt,
                                      @PathVariable UUID orderId) {
        return paymentService.getByOrderId(orderId);
    }
}
