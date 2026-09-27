package com.wellwipes.adminservice.controller;

import com.wellwipes.adminservice.dto.DashboardStats;
import com.wellwipes.adminservice.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public DashboardStats dashboard(@RequestHeader("Authorization") String authorization) {
        String bearerToken = authorization.substring(7);
        return dashboardService.getStats(bearerToken);
    }
}
