package com.wellwipes.orderservice.dto;

import java.time.LocalDate;

public record DailyRevenue(
        LocalDate date,
        long orderCount,
        long revenueCents
) {}
