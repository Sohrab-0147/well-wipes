package com.wellwipes.orderservice.service;

import com.wellwipes.orderservice.domain.Coupon;
import com.wellwipes.orderservice.domain.CouponType;
import com.wellwipes.orderservice.dto.*;
import com.wellwipes.orderservice.exception.InvalidOrderStateException;
import com.wellwipes.orderservice.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponService {

    private final CouponRepository couponRepository;

    @Transactional(readOnly = true)
    public List<CouponResponse> listAll() {
        return couponRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CouponResponse create(CreateCouponRequest req) {
        String code = req.code().trim().toUpperCase();
        if (couponRepository.findByCodeIgnoreCase(code).isPresent()) {
            throw new InvalidOrderStateException("Coupon code already exists: " + code);
        }

        Coupon c = Coupon.builder()
                .code(code)
                .description(req.description())
                .type(req.type())
                .value(req.value())
                .minOrderCents(req.minOrderCents())
                .maxUses(req.maxUses())
                .expiresAt(req.expiresAt())
                .active(req.active() == null ? true : req.active())
                .build();
        return toResponse(couponRepository.save(c));
    }

    @Transactional
    public CouponResponse update(UUID id, UpdateCouponRequest req) {
        Coupon c = couponRepository.findById(id)
                .orElseThrow(() -> new InvalidOrderStateException("Coupon not found: " + id));

        if (req.description() != null) c.setDescription(req.description());
        if (req.type() != null) c.setType(req.type());
        if (req.value() != null) c.setValue(req.value());
        if (req.minOrderCents() != null) c.setMinOrderCents(req.minOrderCents());
        if (req.maxUses() != null) c.setMaxUses(req.maxUses());
        if (req.expiresAt() != null) c.setExpiresAt(req.expiresAt());
        if (req.active() != null) c.setActive(req.active());

        return toResponse(couponRepository.save(c));
    }

    @Transactional
    public void delete(UUID id) {
        if (!couponRepository.existsById(id)) {
            throw new InvalidOrderStateException("Coupon not found: " + id);
        }
        couponRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public ValidateCouponResponse validate(String rawCode, long subtotalCents) {
        String code = rawCode == null ? "" : rawCode.trim().toUpperCase();
        if (code.isEmpty()) {
            return new ValidateCouponResponse(false, rawCode, "Enter a code", 0L, subtotalCents);
        }

        Coupon c = couponRepository.findByCodeIgnoreCase(code).orElse(null);
        if (c == null) {
            return new ValidateCouponResponse(false, code, "Coupon not found", 0L, subtotalCents);
        }
        if (!Boolean.TRUE.equals(c.getActive())) {
            return new ValidateCouponResponse(false, code, "This coupon is no longer active", 0L, subtotalCents);
        }
        if (c.getExpiresAt() != null && c.getExpiresAt().isBefore(java.time.Instant.now())) {
            return new ValidateCouponResponse(false, code, "This coupon has expired", 0L, subtotalCents);
        }
        if (c.getMaxUses() != null && c.getUsedCount() >= c.getMaxUses()) {
            return new ValidateCouponResponse(false, code, "This coupon has reached its limit", 0L, subtotalCents);
        }
        if (subtotalCents < c.getMinOrderCents()) {
            return new ValidateCouponResponse(
                    false, code,
                    "Minimum order is " + (c.getMinOrderCents() / 100) + " rupees",
                    0L, subtotalCents);
        }

        long discount = computeDiscount(c, subtotalCents);
        long finalTotal = Math.max(0, subtotalCents - discount);

        return new ValidateCouponResponse(true, code, "Applied", discount, finalTotal);
    }

    @Transactional
    public long applyCoupon(String rawCode, long subtotalCents) {
        String code = rawCode.trim().toUpperCase();
        Coupon c = couponRepository.findByCodeForUpdate(code)
                .orElseThrow(() -> new InvalidOrderStateException("Coupon not found: " + code));

        if (!c.isUsable()) {
            throw new InvalidOrderStateException("Coupon is no longer valid");
        }
        if (subtotalCents < c.getMinOrderCents()) {
            throw new InvalidOrderStateException("Order doesn't meet the coupon minimum");
        }

        long discount = computeDiscount(c, subtotalCents);
        c.setUsedCount(c.getUsedCount() + 1);
        couponRepository.save(c);

        log.info("Applied coupon {} — discount {} cents", code, discount);
        return discount;
    }

    private long computeDiscount(Coupon c, long subtotalCents) {
        if (c.getType() == CouponType.PERCENT) {
            long raw = (subtotalCents * c.getValue()) / 100;
            return Math.min(raw, subtotalCents);
        }
        return Math.min(c.getValue(), subtotalCents);
    }

    private CouponResponse toResponse(Coupon c) {
        return new CouponResponse(
                c.getId(), c.getCode(), c.getDescription(),
                c.getType(), c.getValue(), c.getMinOrderCents(),
                c.getMaxUses(), c.getUsedCount(),
                c.getExpiresAt(), c.getActive(), c.getCreatedAt()
        );
    }
}
