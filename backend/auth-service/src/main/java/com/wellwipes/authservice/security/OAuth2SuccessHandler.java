package com.wellwipes.authservice.security;

import com.wellwipes.authservice.domain.AuthProvider;
import com.wellwipes.authservice.domain.Role;
import com.wellwipes.authservice.domain.User;
import com.wellwipes.authservice.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private static final String FRONTEND_REDIRECT = "http://localhost:5173/oauth/callback";

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Override
    @Transactional
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        OAuth2User oauth = (OAuth2User) authentication.getPrincipal();

        String email = oauth.getAttribute("email");
        String name = oauth.getAttribute("name");
        String picture = oauth.getAttribute("picture");
        String sub = oauth.getAttribute("sub");

        if (email == null) {
            log.warn("OAuth2 login returned no email for sub={}", sub);
            response.sendRedirect(FRONTEND_REDIRECT + "?error=no_email");
            return;
        }

        User user = userRepository.findByProviderAndProviderId(AuthProvider.GOOGLE, sub)
                .orElseGet(() -> userRepository.findByEmail(email)
                        .map(existing -> {
                            existing.setProvider(AuthProvider.GOOGLE);
                            existing.setProviderId(sub);
                            existing.setAvatarUrl(picture);
                            existing.setEmailVerified(true);
                            return userRepository.save(existing);
                        })
                        .orElseGet(() -> userRepository.save(User.builder()
                                .email(email)
                                .fullName(name)
                                .avatarUrl(picture)
                                .provider(AuthProvider.GOOGLE)
                                .providerId(sub)
                                .role(Role.CUSTOMER)
                                .emailVerified(true)
                                .enabled(true)
                                .build())
                        ));

        String accessToken = jwtService.issueAccessToken(user);
        String refreshRaw = refreshTokenService.issue(user);

        Cookie refreshCookie = new Cookie("ww_refresh", refreshRaw);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(false); // true in prod (HTTPS)
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge((int) jwtService.refreshTokenTtlSeconds());
        refreshCookie.setAttribute("SameSite", "Lax");
        response.addCookie(refreshCookie);

        String redirect = UriComponentsBuilder.fromUriString(FRONTEND_REDIRECT)
                .queryParam("access_token", accessToken)
                .queryParam("user_id", user.getId())
                .queryParam("role", user.getRole())
                .build(true)
                .toUriString();

        response.sendRedirect(redirect);
    }
}
