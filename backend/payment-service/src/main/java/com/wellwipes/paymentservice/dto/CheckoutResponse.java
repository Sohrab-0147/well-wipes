package com.wellwipes.paymentservice.dto;

public record CheckoutResponse(
        String sessionId,
        String checkoutUrl
) {}
