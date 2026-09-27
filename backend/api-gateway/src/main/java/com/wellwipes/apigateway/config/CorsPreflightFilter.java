package com.wellwipes.apigateway.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Set;

/**
 * Handles CORS preflight (OPTIONS) requests locally at the gateway.
 * Downstream services add their own CORS headers on real responses,
 * so this filter only intercepts preflight and lets everything else pass through.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorsPreflightFilter implements Filter {

    private static final Set<String> ALLOWED_ORIGINS = Set.of(
            "http://localhost:5173",
            "http://localhost:3000"
    );

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        String origin = request.getHeader("Origin");

        // Only intercept preflight requests
        boolean isPreflight = "OPTIONS".equalsIgnoreCase(request.getMethod())
                && request.getHeader("Access-Control-Request-Method") != null;

        if (isPreflight) {
            if (origin != null && ALLOWED_ORIGINS.contains(origin)) {
                response.setHeader("Access-Control-Allow-Origin", origin);
                response.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
                response.setHeader("Access-Control-Allow-Credentials", "true");
                response.setHeader("Access-Control-Max-Age", "3600");

                String requestedHeaders = request.getHeader("Access-Control-Request-Headers");
                if (requestedHeaders != null) {
                    response.setHeader("Access-Control-Allow-Headers", requestedHeaders);
                }
            }
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        chain.doFilter(req, res);
    }
}
