package com.wellwipes.authservice.config;

import com.wellwipes.authservice.security.OAuth2SuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final OAuth2SuccessHandler oauth2SuccessHandler;
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                .requestMatchers("/api/v1/auth/refresh", "/api/v1/auth/logout").permitAll()
                .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth -> oauth
                .successHandler(oauth2SuccessHandler)
                .failureHandler((req, res, ex) -> {
                    System.err.println("========== OAUTH2 LOGIN FAILED ==========");
                    System.err.println("Exception: " + ex.getClass().getName());
                    System.err.println("Message:   " + ex.getMessage());
                    ex.printStackTrace(System.err);
                    System.err.println("=========================================");
                    String fe = System.getenv().getOrDefault("FRONTEND_REDIRECT", "http://localhost:5173/oauth/callback");
                    res.sendRedirect(fe + "?error=" + java.net.URLEncoder.encode(ex.getMessage() == null ? "unknown" : ex.getMessage(), "UTF-8"));
                })
            )
            .oauth2ResourceServer(oauth -> oauth.jwt(jwt ->
                jwt.jwtAuthenticationConverter(buildAdminAwareConverter())))
            .exceptionHandling(ex -> ex
                .defaultAuthenticationEntryPointFor(
                    new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                    new AntPathRequestMatcher("/api/**")
                )
            );
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOriginPatterns(List.of("http://localhost:5173", "http://localhost:3000", "https://*.trycloudflare.com"));
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }

    private JwtAuthenticationConverter buildAdminAwareConverter() {
        JwtAuthenticationConverter c = new JwtAuthenticationConverter();
        c.setJwtGrantedAuthoritiesConverter(jwt -> {
            String role = jwt.getClaimAsString("role");
            if (role == null || role.isBlank()) {
                return java.util.List.of();
            }
            return java.util.List.of(
                new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role)
            );
        });
        return c;
    }
}
