package com.wellwipes.paymentservice.controller;

import com.wellwipes.paymentservice.service.StripeWebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class StripeWebhookController {

    private final StripeWebhookService webhookService;

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader
    ) {
        try {
            webhookService.handle(payload, sigHeader);
            return ResponseEntity.ok("received");
        } catch (Exception ex) {
            log.error("Webhook processing failed", ex);
            return ResponseEntity.badRequest().body("error");
        }
    }
}
