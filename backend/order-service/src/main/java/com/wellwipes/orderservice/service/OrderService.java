package com.wellwipes.orderservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wellwipes.common.event.OrderPlacedEvent;
import com.wellwipes.orderservice.client.PaymentClient;
import com.wellwipes.orderservice.client.ProductClient;
import com.wellwipes.orderservice.domain.*;
import com.wellwipes.orderservice.dto.*;
import com.wellwipes.orderservice.exception.InvalidOrderStateException;
import com.wellwipes.orderservice.exception.OrderNotFoundException;
import com.wellwipes.orderservice.repository.OrderRepository;
import com.wellwipes.orderservice.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OutboxEventRepository outboxRepository;
    private final ProductClient productClient;
    private final PaymentClient paymentClient;
    private final ObjectMapper objectMapper;
    private final CouponService couponService;

    @Transactional
    public OrderResponse create(UUID userId, String userEmail, String userFullName,
                                 String bearerToken, CreateOrderRequest request) {
        List<OrderItem> items = new ArrayList<>();
        long subtotalCents = 0L;
        String currency = "INR";

        for (CreateOrderItemRequest item : request.items()) {
            ProductSnapshot product = productClient.getProduct(item.productId(), bearerToken);
            if (product == null || !Boolean.TRUE.equals(product.active())) {
                throw new InvalidOrderStateException("Product unavailable: " + item.productId());
            }
            long lineTotal = product.priceCents() * item.quantity();
            subtotalCents += lineTotal;
            currency = product.currency();

            items.add(OrderItem.builder()
                    .productId(product.id())
                    .sku(product.sku())
                    .name(product.name())
                    .unitPriceCents(product.priceCents())
                    .quantity(item.quantity())
                    .subtotalCents(lineTotal)
                    .build());
        }

        long discountCents = 0L;
        String couponCode = null;
        if (request.couponCode() != null && !request.couponCode().isBlank()) {
            couponCode = request.couponCode().trim().toUpperCase();
            discountCents = couponService.applyCoupon(couponCode, subtotalCents);
        }

        long finalTotal = Math.max(0, subtotalCents - discountCents);

        PaymentMethod paymentMethod = request.paymentMethod() != null
                ? request.paymentMethod()
                : PaymentMethod.ONLINE;

        Order order = Order.builder()
                .userId(userId)
                .status(OrderStatus.PENDING)
                .paymentMethod(paymentMethod)
                .subtotalCents(subtotalCents)
                .discountCents(discountCents)
                .couponCode(couponCode)
                .totalCents(finalTotal)
                .currency(currency)
                .shippingAddress(request.shippingAddress() == null ? Map.of() : request.shippingAddress())
                .build();
        items.forEach(order::addItem);
        Order saved = orderRepository.saveAndFlush(order);

        // Publish OrderPlaced for both payment methods
        List<OrderPlacedEvent.Item> eventItems = saved.getItems().stream()
                .map(i -> new OrderPlacedEvent.Item(
                        i.getProductId(), i.getSku(), i.getName(),
                        i.getUnitPriceCents(), i.getQuantity()))
                .toList();

        OrderPlacedEvent event = OrderPlacedEvent.of(
                saved.getId(), userId, userEmail, userFullName,
                saved.getTotalCents(), saved.getCurrency(), eventItems);

        outboxRepository.save(OutboxEvent.builder()
                .aggregateId(saved.getId())
                .eventType("OrderPlaced")
                .payload(objectMapper.convertValue(event, Map.class))
                .build());

        // COD: no Stripe session
        if (paymentMethod == PaymentMethod.COD) {
            log.info("Order {} created with COD — skipping Stripe session", saved.getId());
            return toResponse(saved, null);
        }

        // Online: create Stripe Checkout
        List<Map<String, Object>> lineItems = new ArrayList<>();
        for (OrderItem item : saved.getItems()) {
            lineItems.add(Map.of(
                    "sku", item.getSku(),
                    "name", item.getName(),
                    "unitPriceCents", item.getUnitPriceCents(),
                    "quantity", item.getQuantity()
            ));
        }

        PaymentClient.CheckoutResponse checkout = paymentClient.createCheckout(
                bearerToken, saved.getId(), lineItems, currency);

        saved.setStripeSessionId(checkout.sessionId());
        orderRepository.save(saved);

        return toResponse(saved, checkout.checkoutUrl());
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> listForUser(UUID userId, Pageable pageable) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(o -> toResponse(o, null));
    }

    @Transactional(readOnly = true)
    public OrderResponse getById(UUID orderId, UUID requesterId, boolean isAdmin) {
        Order order = orderRepository.findWithItemsById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found: " + orderId));
        if (!isAdmin && !order.getUserId().equals(requesterId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not your order");
        }
        return toResponse(order, null);
    }

    @Transactional(readOnly = true)
    public Order getEntityById(UUID orderId, UUID requesterId, boolean isAdmin) {
        Order order = orderRepository.findWithItemsById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found: " + orderId));
        if (!isAdmin && !order.getUserId().equals(requesterId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not your order");
        }
        return order;
    }

    @Transactional
    public OrderResponse cancel(UUID orderId, UUID requesterId, boolean isAdmin) {
        Order order = orderRepository.findWithItemsById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found: " + orderId));
        if (!isAdmin && !order.getUserId().equals(requesterId)) {
            throw new org.springframework.security.access.AccessDeniedException("Not your order");
        }
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new InvalidOrderStateException("Only PENDING orders can be cancelled. Current: " + order.getStatus());
        }
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        return toResponse(order, null);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> listAllForAdmin(Pageable pageable) {
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(o -> toResponse(o, null));
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> listAllByStatus(OrderStatus status, Pageable pageable) {
        return orderRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
                .map(o -> toResponse(o, null));
    }

    @Transactional(readOnly = true)
    public OrderStatsResponse getStats() {
        return new OrderStatsResponse(
                orderRepository.count(),
                orderRepository.countByStatus(OrderStatus.PAID),
                orderRepository.countByStatus(OrderStatus.PENDING),
                orderRepository.countByStatus(OrderStatus.FAILED),
                orderRepository.countByStatus(OrderStatus.CANCELLED),
                orderRepository.sumTotalByStatus(OrderStatus.PAID),
                "INR"
        );
    }

    @Transactional
    public OrderResponse updateStatus(UUID orderId, OrderStatus newStatus) {
        Order order = orderRepository.findWithItemsById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found: " + orderId));
        order.setStatus(newStatus);
        orderRepository.save(order);
        return toResponse(order, null);
    }

    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics(int days) {
        java.time.Instant since = java.time.Instant.now().minus(days, java.time.temporal.ChronoUnit.DAYS);

        java.util.List<Object[]> rawDaily = orderRepository.findDailyRevenue(since);
        java.util.Map<java.time.LocalDate, long[]> byDate = new java.util.HashMap<>();
        for (Object[] row : rawDaily) {
            java.time.LocalDate day = ((java.sql.Date) row[0]).toLocalDate();
            long count = ((Number) row[1]).longValue();
            long revenue = ((Number) row[2]).longValue();
            byDate.put(day, new long[]{count, revenue});
        }

        List<DailyRevenue> daily = new ArrayList<>();
        java.time.LocalDate today = java.time.LocalDate.now();
        for (int i = days - 1; i >= 0; i--) {
            java.time.LocalDate day = today.minusDays(i);
            long[] v = byDate.getOrDefault(day, new long[]{0L, 0L});
            daily.add(new DailyRevenue(day, v[0], v[1]));
        }

        List<Object[]> rawTop = orderRepository.findTopProducts(
                org.springframework.data.domain.PageRequest.of(0, 5));
        List<TopProduct> top = new ArrayList<>();
        for (Object[] row : rawTop) {
            top.add(new TopProduct(
                    (java.util.UUID) row[0],
                    (String) row[1],
                    (String) row[2],
                    ((Number) row[3]).longValue(),
                    ((Number) row[4]).longValue()
            ));
        }

        long totalRevenue = daily.stream().mapToLong(DailyRevenue::revenueCents).sum();
        long totalOrders = daily.stream().mapToLong(DailyRevenue::orderCount).sum();
        long aov = totalOrders == 0 ? 0 : totalRevenue / totalOrders;

        return new AnalyticsResponse(daily, top, totalRevenue, totalOrders, aov, "INR");
    }

    public OrderResponse toResponse(Order order, String checkoutUrl) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(i -> new OrderItemResponse(
                        i.getId(), i.getProductId(), i.getSku(), i.getName(),
                        i.getUnitPriceCents(), i.getQuantity(), i.getSubtotalCents()))
                .toList();
        return new OrderResponse(
                order.getId(),
                order.getUserId(),
                order.getStatus(),
                order.getPaymentMethod(),
                order.getSubtotalCents(),
                order.getDiscountCents(),
                order.getCouponCode(),
                order.getTotalCents(),
                order.getCurrency(),
                order.getShippingAddress(),
                order.getStripeSessionId(),
                checkoutUrl,
                itemResponses,
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}
