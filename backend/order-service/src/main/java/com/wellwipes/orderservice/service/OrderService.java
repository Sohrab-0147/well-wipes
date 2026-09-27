package com.wellwipes.orderservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wellwipes.common.event.OrderPlacedEvent;
import com.wellwipes.orderservice.client.PaymentClient;
import com.wellwipes.orderservice.client.ProductClient;
import com.wellwipes.orderservice.domain.Order;
import com.wellwipes.orderservice.domain.OrderItem;
import com.wellwipes.orderservice.domain.OrderStatus;
import com.wellwipes.orderservice.domain.OutboxEvent;
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

    @Transactional
    public OrderResponse create(UUID userId, String bearerToken, CreateOrderRequest request) {
        List<OrderItem> items = new ArrayList<>();
        long totalCents = 0L;
        String currency = "INR";

        for (CreateOrderItemRequest item : request.items()) {
            ProductSnapshot product = productClient.getProduct(item.productId(), bearerToken);
            if (product == null || !Boolean.TRUE.equals(product.active())) {
                throw new InvalidOrderStateException("Product unavailable: " + item.productId());
            }
            long subtotal = product.priceCents() * item.quantity();
            totalCents += subtotal;
            currency = product.currency();

            items.add(OrderItem.builder()
                    .productId(product.id())
                    .sku(product.sku())
                    .name(product.name())
                    .unitPriceCents(product.priceCents())
                    .quantity(item.quantity())
                    .subtotalCents(subtotal)
                    .build());
        }

        Order order = Order.builder()
                .userId(userId)
                .status(OrderStatus.PENDING)
                .totalCents(totalCents)
                .currency(currency)
                .shippingAddress(request.shippingAddress() == null ? Map.of() : request.shippingAddress())
                .build();
        items.forEach(order::addItem);
        Order saved = orderRepository.saveAndFlush(order);

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

        List<OrderPlacedEvent.Item> eventItems = saved.getItems().stream()
                .map(i -> new OrderPlacedEvent.Item(
                        i.getProductId(), i.getSku(), i.getName(),
                        i.getUnitPriceCents(), i.getQuantity()))
                .toList();

        OrderPlacedEvent event = OrderPlacedEvent.of(
                saved.getId(), userId, saved.getTotalCents(), saved.getCurrency(), eventItems);

        outboxRepository.save(OutboxEvent.builder()
                .aggregateId(saved.getId())
                .eventType("OrderPlaced")
                .payload(objectMapper.convertValue(event, Map.class))
                .build());

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

    public OrderResponse toResponse(Order order, String checkoutUrl) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(i -> new OrderItemResponse(
                        i.getId(), i.getProductId(), i.getSku(), i.getName(),
                        i.getUnitPriceCents(), i.getQuantity(), i.getSubtotalCents()))
                .toList();
        return new OrderResponse(
                order.getId(), order.getUserId(), order.getStatus(),
                order.getTotalCents(), order.getCurrency(), order.getShippingAddress(),
                order.getStripeSessionId(), checkoutUrl,
                itemResponses, order.getCreatedAt(), order.getUpdatedAt()
        );
    }
}
