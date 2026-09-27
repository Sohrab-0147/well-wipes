#!/bin/bash
set -e

echo "═══════════════════════════════════════"
echo "  Well-Wipes — full stack startup"
echo "═══════════════════════════════════════"
echo ""

echo "▸ 1/6  Starting Docker Desktop..."
open -a Docker 2>/dev/null || echo "  (Docker may already be running)"
for i in {1..30}; do
  if docker ps >/dev/null 2>&1; then
    echo "  ✔ Docker ready"
    break
  fi
  sleep 2
done

echo ""
echo "▸ 2/6  Starting infrastructure..."
cd ~/Projects/well-wipes-setup/well-wipes/infra
docker compose up -d
echo "  Waiting 45s for Postgres + Kafka..."
sleep 45
docker compose ps --format "table {{.Name}}\t{{.Status}}"

echo ""
echo "▸ 3/6  Clearing any stale backend ports..."
for p in 8080 8081 8082 8083 8084 8085 8086 8087; do
  lsof -ti :$p 2>/dev/null | xargs kill -9 2>/dev/null || true
done
sleep 3
echo "  ✔ Ports 8080-8087 cleared"

echo ""
echo "▸ 4/6  Building backend..."
cd ~/Projects/well-wipes-setup/well-wipes/backend
mvn clean install -DskipTests -q 2>&1 | tail -3 || {
  echo "  ✘ Build failed. Run 'mvn clean install -DskipTests' to see errors."
  exit 1
}
echo "  ✔ Build succeeded"

echo ""
echo "▸ 5/6  Starting 8 backend services..."
BACKEND=~/Projects/well-wipes-setup/well-wipes/backend

cd $BACKEND/auth-service && nohup mvn spring-boot:run > /tmp/auth.log 2>&1 & sleep 22
echo "  → auth-service up"

cd $BACKEND/product-service && nohup mvn spring-boot:run > /tmp/product.log 2>&1 & sleep 22
echo "  → product-service up"

cd $BACKEND/payment-service && nohup mvn spring-boot:run > /tmp/payment.log 2>&1 & sleep 22
echo "  → payment-service up"

cd $BACKEND/order-service && nohup mvn spring-boot:run > /tmp/order.log 2>&1 & sleep 22
echo "  → order-service up"

cd $BACKEND/notification-service && nohup mvn spring-boot:run > /tmp/notification.log 2>&1 & sleep 22
echo "  → notification-service up"

cd $BACKEND/admin-service && nohup mvn spring-boot:run > /tmp/admin.log 2>&1 & sleep 18
echo "  → admin-service up"

cd $BACKEND/ai-service && nohup mvn spring-boot:run > /tmp/ai.log 2>&1 & sleep 22
echo "  → ai-service up"

cd $BACKEND/api-gateway && nohup mvn spring-boot:run > /tmp/gateway.log 2>&1 & sleep 18
echo "  → api-gateway up"

echo ""
echo "▸ 6/6  Health check..."
echo ""
printf "  %-24s %s\n" "Service" "Status"
printf "  %-24s %s\n" "───────" "──────"
for entry in "8080:api-gateway" "8081:auth-service" "8082:product-service" "8083:payment-service" "8084:order-service" "8085:notification-service" "8086:admin-service" "8087:ai-service"; do
  port=${entry%%:*}
  name=${entry##*:}
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port/actuator/health")
  if [ "$code" = "200" ]; then
    printf "  %-24s ✔ %s\n" "$name" "$code"
  else
    printf "  %-24s ✘ %s\n" "$name" "$code"
  fi
done

echo ""
echo "═══════════════════════════════════════"
echo "  Backend is up."
echo "═══════════════════════════════════════"
echo ""
echo "  Frontend (new terminal):"
echo "    cd ~/Projects/well-wipes-setup/well-wipes/frontend && npm run dev"
echo ""
echo "  Stripe webhook (new terminal, optional):"
echo "    stripe listen --events checkout.session.completed,checkout.session.expired,payment_intent.payment_failed --forward-to localhost:8083/api/v1/payments/webhook"
echo ""
echo "  Then open: http://localhost:5173"
echo ""
