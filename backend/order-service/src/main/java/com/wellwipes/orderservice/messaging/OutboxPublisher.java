package com.wellwipes.orderservice.messaging;

import com.wellwipes.orderservice.domain.OutboxEvent;
import com.wellwipes.orderservice.domain.OutboxStatus;
import com.wellwipes.orderservice.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OutboxPublisher {

    public static final String ORDER_EVENTS_TOPIC = "order-events";

    private final OutboxEventRepository outboxRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Scheduled(fixedDelay = 2000)
    @Transactional
    public void publishPending() {
        List<OutboxEvent> events = outboxRepository.findTop50ByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING);
        if (events.isEmpty()) return;

        for (OutboxEvent event : events) {
            try {
                kafkaTemplate.send(ORDER_EVENTS_TOPIC,
                        event.getAggregateId().toString(),
                        event.getPayload())
                        .whenComplete((result, ex) -> {
                            if (ex == null) {
                                markSent(event);
                            } else {
                                markFailed(event, ex.getMessage());
                            }
                        });
            } catch (Exception ex) {
                log.error("Outbox publish failed for event {}", event.getId(), ex);
                markFailed(event, ex.getMessage());
            }
        }
    }

    @Transactional
    public void markSent(OutboxEvent event) {
        event.setStatus(OutboxStatus.SENT);
        event.setSentAt(Instant.now());
        outboxRepository.save(event);
    }

    @Transactional
    public void markFailed(OutboxEvent event, String error) {
        event.setAttempts(event.getAttempts() + 1);
        event.setLastError(error != null && error.length() > 990 ? error.substring(0, 990) : error);
        if (event.getAttempts() >= 5) {
            event.setStatus(OutboxStatus.FAILED);
        }
        outboxRepository.save(event);
    }
}
