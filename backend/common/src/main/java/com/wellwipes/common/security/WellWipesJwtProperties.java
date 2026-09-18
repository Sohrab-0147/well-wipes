package com.wellwipes.common.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "wellwipes.jwt")
public record WellWipesJwtProperties(
        String secret,
        String issuer
) {
    public WellWipesJwtProperties {
        if (secret == null || secret.getBytes().length < 32) {
            throw new IllegalStateException(
                "wellwipes.jwt.secret must be at least 32 bytes (256 bits) for HS256"
            );
        }
        if (issuer == null || issuer.isBlank()) {
            throw new IllegalStateException("wellwipes.jwt.issuer must be set");
        }
    }
}
