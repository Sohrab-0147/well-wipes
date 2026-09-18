package com.wellwipes.authservice.dto;

import com.wellwipes.authservice.domain.Role;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String fullName,
        String avatarUrl,
        Role role
) {}
