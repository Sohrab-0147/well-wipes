package com.wellwipes.orderservice.repository;

import com.wellwipes.orderservice.domain.Order;
import com.wellwipes.orderservice.domain.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    @EntityGraph(attributePaths = "items")
    Optional<Order> findWithItemsById(UUID id);

    @EntityGraph(attributePaths = "items")
    Page<Order> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    Optional<Order> findByStripeSessionId(String stripeSessionId);

    @EntityGraph(attributePaths = "items")
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @EntityGraph(attributePaths = "items")
    Page<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);

    long countByStatus(OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalCents), 0) FROM Order o WHERE o.status = :status")
    long sumTotalByStatus(@Param("status") OrderStatus status);

    @Query("""
        SELECT FUNCTION('DATE', o.createdAt), COUNT(o), COALESCE(SUM(o.totalCents), 0)
        FROM Order o
        WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
          AND o.createdAt >= :since
        GROUP BY FUNCTION('DATE', o.createdAt)
        ORDER BY FUNCTION('DATE', o.createdAt) ASC
    """)
    java.util.List<Object[]> findDailyRevenue(@Param("since") java.time.Instant since);

    @Query("""
        SELECT i.productId, i.sku, i.name, SUM(i.quantity), SUM(i.subtotalCents)
        FROM OrderItem i
        WHERE i.order.status IN ('PAID', 'SHIPPED', 'DELIVERED')
        GROUP BY i.productId, i.sku, i.name
        ORDER BY SUM(i.quantity) DESC
    """)
    java.util.List<Object[]> findTopProducts(org.springframework.data.domain.Pageable pageable);
}
