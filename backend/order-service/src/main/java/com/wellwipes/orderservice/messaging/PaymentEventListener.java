package com.wellwipes.orderservice.messaging;

import com.wellwipes.common.event.PaymentFailedEvent;
import com.wellwipes.common.event.PaymentSucceededEvent;
import com.wellwipes.orderservice.domain.Order;
import com.wellwipes.orderservice.domain.OrderStatus;
import com.wellwipes.orderservice.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventListener {

    private final OrderRepository orderRepository;

    @KafkaListener(topics = "payment-events", groupId = "order-service")
    @Transactional
    public void onPaymentEvent(Object event) {
        if (event instanceof PaymentSucceededEvent succeeded) {
            handleSucceeded(succeeded);
        } else if (event instanceof PaymentFailedEvent failed) {
            handleFailed(failed);
        } else {
            log.debug("Ignoring unknown payment event: {}", event);
        }
    }

    private void handleSucceeded(PaymentSucceededEvent event) {
        orderRepository.findById(event.orderId()).ifPresentOrElse(order -> {
            if (order.getStatus() == OrderStatus.PAID) {
                log.info("Order {} already PAID — skipping", order.getId());
                return;
            }
            order.setStatus(OrderStatus.PAID);
            order.setPaymentId(event.paymentId());
            orderRepository.save(order);
            log.info("Order {} marked PAID", order.getId());
        }, () -> log.warn("Received PaymentSucceeded for unknown order {}", event.orderId()));
    }

    private void handleFailed(PaymentFailedEvent event) {
        orderRepository.findById(event.orderId()).ifPresent(order -> {
            if (order.getStatus() == OrderStatus.PENDING) {
                order.setStatus(OrderStatus.FAILED);
                orderRepository.save(order);
                log.info("Order {} marked FAILED: {}", order.getId(), event.failureReason());
            }
        });
    }
}
