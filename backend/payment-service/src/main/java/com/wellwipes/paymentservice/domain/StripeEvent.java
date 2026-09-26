package com.wellwipes.paymentservice.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "stripe_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StripeEvent {

    @Id
    @Column(name = "stripe_event_id", length = 255)
    private String stripeEventId;

    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    @CreationTimestamp
    @Column(name = "processed_at", nullable = false, updatable = false)
    private Instant processedAt;
}
