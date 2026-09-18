package com.wellwipes.authservice.controller;

import com.wellwipes.authservice.domain.User;
import com.wellwipes.authservice.dto.RefreshResponse;
import com.wellwipes.authservice.dto.UserResponse;
import com.wellwipes.authservice.repository.UserRepository;
import com.wellwipes.authservice.security.JwtService;
import com.wellwipes.authservice.security.RefreshTokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String REFRESH_COOKIE = "ww_refresh";

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(new UserResponse(
                user.getId(), user.getEmail(), user.getFullName(), user.getAvatarUrl(), user.getRole()
        ));
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshResponse> refresh(
            @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken,
            HttpServletResponse response
    ) {
        if (refreshToken == null) {
            return ResponseEntity.status(401).build();
        }
        var result = refreshTokenService.rotate(refreshToken);
        String newAccessToken = jwtService.issueAccessToken(result.user());

        Cookie newCookie = new Cookie(REFRESH_COOKIE, result.newRawToken());
        newCookie.setHttpOnly(true);
        newCookie.setSecure(false);
        newCookie.setPath("/");
        newCookie.setMaxAge((int) jwtService.refreshTokenTtlSeconds());
        newCookie.setAttribute("SameSite", "Lax");
        response.addCookie(newCookie);

        return ResponseEntity.ok(new RefreshResponse(newAccessToken, jwtService.accessTokenTtlSeconds()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken,
            HttpServletResponse response
    ) {
        if (refreshToken != null) {
            try {
                var rotated = refreshTokenService.rotate(refreshToken);
                refreshTokenService.revokeAll(rotated.user().getId());
            } catch (RuntimeException ignored) {
            }
        }
        Cookie kill = new Cookie(REFRESH_COOKIE, "");
        kill.setHttpOnly(true);
        kill.setPath("/");
        kill.setMaxAge(0);
        response.addCookie(kill);
        return ResponseEntity.noContent().build();
    }
}
