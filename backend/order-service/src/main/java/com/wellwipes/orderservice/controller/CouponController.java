package com.wellwipes.orderservice.controller;

import com.wellwipes.orderservice.dto.*;
import com.wellwipes.orderservice.service.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @GetMapping("/validate")
    public ValidateCouponResponse validate(
            @RequestParam String code,
            @RequestParam(defaultValue = "0") long subtotalCents) {
        return couponService.validate(code, subtotalCents);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<CouponResponse> list() {
        return couponService.listAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public CouponResponse create(@Valid @RequestBody CreateCouponRequest req) {
        return couponService.create(req);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public CouponResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateCouponRequest req) {
        return couponService.update(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable UUID id) {
        couponService.delete(id);
    }
}
