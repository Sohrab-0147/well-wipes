package com.wellwipes.authservice.security;

import com.wellwipes.authservice.domain.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long accessTokenTtlSeconds;
    private final long refreshTokenTtlSeconds;
    private final String issuer;

    public JwtService(
            @Value("${wellwipes.jwt.secret}") String secret,
            @Value("${wellwipes.jwt.issuer}") String issuer,
            @Value("${wellwipes.jwt.access-token-ttl-seconds:900}") long accessTokenTtlSeconds,
            @Value("${wellwipes.jwt.refresh-token-ttl-seconds:604800}") long refreshTokenTtlSeconds
    ) {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException("JWT secret must be at least 32 bytes");
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.issuer = issuer;
        this.accessTokenTtlSeconds = accessTokenTtlSeconds;
        this.refreshTokenTtlSeconds = refreshTokenTtlSeconds;
    }

    public String issueAccessToken(User user) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(accessTokenTtlSeconds);
        return Jwts.builder()
                .subject(user.getId().toString())
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .claims(Map.of(
                        "email", user.getEmail(),
                        "role", user.getRole().name(),
                        "name", user.getFullName() == null ? "" : user.getFullName()
                ))
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }

    public long accessTokenTtlSeconds() { return accessTokenTtlSeconds; }
    public long refreshTokenTtlSeconds() { return refreshTokenTtlSeconds; }
}
