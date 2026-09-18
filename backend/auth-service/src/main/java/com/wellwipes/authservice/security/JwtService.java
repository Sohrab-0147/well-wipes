package com.wellwipes.authservice.security;

import com.wellwipes.authservice.config.JwtProperties;
import com.wellwipes.authservice.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class JwtService {

    private final JwtProperties props;
    private final SecretKey signingKey;

    public JwtService(JwtProperties props) {
        this.props = props;
        byte[] keyBytes = props.secret().getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                "JWT secret must be at least 32 bytes (256 bits) for HS256. Current length: " + keyBytes.length
            );
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String issueAccessToken(User user) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(props.accessTokenTtlSeconds());

        return Jwts.builder()
                .subject(user.getId().toString())
                .issuer(props.issuer())
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .claims(Map.of(
                        "email", user.getEmail(),
                        "role", user.getRole().name(),
                        "name", user.getFullName() == null ? "" : user.getFullName()
                ))
                .signWith(signingKey)
                .compact();
    }

    public Claims parseAndValidate(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(signingKey)
                    .requireIssuer(props.issuer())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException | IllegalArgumentException ex) {
            log.debug("JWT validation failed: {}", ex.getMessage());
            throw new InvalidTokenException("Invalid or expired JWT", ex);
        }
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(parseAndValidate(token).getSubject());
    }

    public long accessTokenTtlSeconds() {
        return props.accessTokenTtlSeconds();
    }

    public long refreshTokenTtlSeconds() {
        return props.refreshTokenTtlSeconds();
    }
}
