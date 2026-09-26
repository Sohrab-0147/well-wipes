package com.wellwipes.notificationservice.listener;

import com.wellwipes.common.event.OrderPlacedEvent;
import com.wellwipes.common.event.PaymentFailedEvent;
import com.wellwipes.common.event.PaymentSucceededEvent;
import com.wellwipes.notificationservice.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventListener {

    private final EmailService emailService;

    @KafkaListener(topics = "order-events", groupId = "notification-service")
    public void onOrderEvent(Object event) {
        log.debug("Received order event: {}", event == null ? "null" : event.getClass().getSimpleName());

        if (event instanceof OrderPlacedEvent placed) {
            log.info("Order placed: {} for user {} ({} {})",
                    placed.orderId(), placed.userId(), placed.totalCents(), placed.currency());
            emailService.sendOrderConfirmation(placed);
        }
    }

    @KafkaListener(topics = "payment-events", groupId = "notification-service")
    public void onPaymentEvent(Object event) {
        log.debug("Received payment event: {}", event == null ? "null" : event.getClass().getSimpleName());

        if (event instanceof PaymentSucceededEvent succeeded) {
            log.info("Payment succeeded for order {}: {} {}",
                    succeeded.orderId(), succeeded.amountCents(), succeeded.currency());
            emailService.sendPaymentSuccess(succeeded);
        } else if (event instanceof PaymentFailedEvent failed) {
            log.warn("Payment failed for order {}: {}",
                    failed.orderId(), failed.failureReason());
            emailService.sendPaymentFailed(failed);
        }
    }
}
