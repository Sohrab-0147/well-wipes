package com.wellwipes.authservice.security;

import com.wellwipes.authservice.domain.RefreshToken;
import com.wellwipes.authservice.domain.User;
import com.wellwipes.authservice.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    private final RefreshTokenRepository repo;

    @Value("${wellwipes.jwt.refresh-token-ttl-seconds:604800}")
    private long refreshTokenTtlSeconds;

    private final SecureRandom random = new SecureRandom();

    @Transactional
    public String issue(User user) {
        String raw = generateRaw();
        RefreshToken token = RefreshToken.builder()
                .user(user)
                .tokenHash(hash(raw))
                .expiresAt(Instant.now().plusSeconds(refreshTokenTtlSeconds))
                .build();
        repo.save(token);
        return raw;
    }

    @Transactional
    public RotationResult rotate(String rawToken) {
        RefreshToken existing = repo.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new InvalidRefreshTokenException("Refresh token not found"));

        if (Boolean.TRUE.equals(existing.getRevoked())) {
            log.warn("Reuse of revoked refresh token detected for user {}", existing.getUser().getId());
            repo.revokeAllByUserId(existing.getUser().getId(), Instant.now());
            throw new InvalidRefreshTokenException("Refresh token has been revoked");
        }

        if (existing.getExpiresAt().isBefore(Instant.now())) {
            throw new InvalidRefreshTokenException("Refresh token has expired");
        }

        String newRaw = issue(existing.getUser());

        existing.setRevoked(true);
        existing.setRevokedAt(Instant.now());
        repo.save(existing);

        return new RotationResult(existing.getUser(), newRaw);
    }

    @Transactional
    public void revokeAll(UUID userId) {
        repo.revokeAllByUserId(userId, Instant.now());
    }

    private String generateRaw() {
        byte[] bytes = new byte[48];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String raw) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(raw.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }

    public record RotationResult(User user, String newRawToken) {}
}
