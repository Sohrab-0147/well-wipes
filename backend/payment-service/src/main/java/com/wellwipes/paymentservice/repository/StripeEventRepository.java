package com.wellwipes.paymentservice.repository;

import com.wellwipes.paymentservice.domain.StripeEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StripeEventRepository extends JpaRepository<StripeEvent, String> {
}
