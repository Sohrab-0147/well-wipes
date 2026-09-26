package com.wellwipes.paymentservice.messaging;

import com.wellwipes.common.event.PaymentFailedEvent;
import com.wellwipes.common.event.PaymentSucceededEvent;
import com.wellwipes.paymentservice.config.KafkaTopicConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishSucceeded(PaymentSucceededEvent event) {
        log.info("Publishing PaymentSucceeded event {} for order {}",
                event.eventId(), event.orderId());
        kafkaTemplate.send(KafkaTopicConfig.PAYMENT_EVENTS_TOPIC,
                event.orderId().toString(), event);
    }

    public void publishFailed(PaymentFailedEvent event) {
        log.info("Publishing PaymentFailed event {} for order {}",
                event.eventId(), event.orderId());
        kafkaTemplate.send(KafkaTopicConfig.PAYMENT_EVENTS_TOPIC,
                event.orderId().toString(), event);
    }
}
