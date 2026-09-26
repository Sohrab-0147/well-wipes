package com.wellwipes.paymentservice.repository;

import com.wellwipes.paymentservice.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByStripeSessionId(String sessionId);

    Optional<Payment> findByOrderId(UUID orderId);
}
