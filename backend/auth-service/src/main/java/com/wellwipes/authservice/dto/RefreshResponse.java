package com.wellwipes.authservice.dto;

public record RefreshResponse(
        String accessToken,
        long expiresInSeconds
) {}
