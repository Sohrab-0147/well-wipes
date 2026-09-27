#!/bin/bash
echo "Stopping Well-Wipes..."

for p in 8080 8081 8082 8083 8084 8085 8086 8087; do
  lsof -ti :$p 2>/dev/null | xargs kill -9 2>/dev/null || true
done
echo "  ✔ Backend stopped"

cd ~/Projects/well-wipes-setup/well-wipes/infra
docker compose down
echo "  ✔ Docker stopped"

echo ""
echo "✔ Done. Frontend — press Ctrl+C in its terminal."
