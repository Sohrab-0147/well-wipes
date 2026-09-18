package com.wellwipes.authservice.dto;

// Refresh token is delivered via cookie — no fields needed.
// Kept as a class for future extension (e.g., device fingerprint).
public record RefreshRequest() {}
