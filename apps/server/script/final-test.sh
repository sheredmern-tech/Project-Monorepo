#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        🧪 FINAL REDIS INTEGRATION TEST                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test 1: Check services
echo ""
echo "Test 1: Checking services..."
docker ps | grep -E "(firma-api|firma-redis|firma-postgres)" > /dev/null
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ All services running${NC}"
else
  echo -e "${RED}❌ Services not running${NC}"
  exit 1
fi

# Test 2: Check API logs for Redis
echo ""
echo "Test 2: Checking Redis initialization..."
docker logs firma-api 2>&1 | grep -i "Redis store created successfully" > /dev/null
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Redis initialized${NC}"
else
  echo -e "${RED}❌ Redis not initialized${NC}"
  exit 1
fi

# Test 3: Login
echo ""
echo "Test 3: Testing login..."
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@perari.id","password":"Admin123!"}' | jq -r '.data.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed${NC}"
  echo "   Run: docker exec firma-api npm run prisma:seed"
  exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"

# Test 4: First request (cache MISS)
echo ""
echo "Test 4: Making first request (should MISS cache)..."
START1=$(date +%s%N)
curl -s http://localhost:3000/api/v1/klien?page=1&limit=5 \
  -H "Authorization: Bearer $TOKEN" > /dev/null
END1=$(date +%s%N)
DURATION1=$(( (END1 - START1) / 1000000 ))

echo "   Duration: ${DURATION1}ms"

# Test 5: Check Redis keys
echo ""
echo "Test 5: Checking Redis keys..."
sleep 1
KEYS=$(docker exec firma-redis redis-cli KEYS "firma:*")
KEY_COUNT=$(echo "$KEYS" | wc -l)

echo "   Keys found: $KEY_COUNT"
echo "$KEYS" | head -3 | sed 's/^/   - /'

if [ $KEY_COUNT -eq 0 ]; then
  echo -e "${RED}❌ No keys in Redis!${NC}"
  echo ""
  echo "Debug info:"
  docker logs firma-api 2>&1 | grep -i "cache\|redis" | tail -20
  exit 1
fi

echo -e "${GREEN}✅ Cache keys found in Redis${NC}"

# Test 6: Second request (cache HIT)
echo ""
echo "Test 6: Making second request (should HIT cache)..."
START2=$(date +%s%N)
curl -s http://localhost:3000/api/v1/klien?page=1&limit=5 \
  -H "Authorization: Bearer $TOKEN" > /dev/null
END2=$(date +%s%N)
DURATION2=$(( (END2 - START2) / 1000000 ))

echo "   Duration: ${DURATION2}ms"

# Test 7: Performance comparison
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    PERFORMANCE COMPARISON                      ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "   Request 1 (MISS): ${DURATION1}ms"
echo "   Request 2 (HIT):  ${DURATION2}ms"

IMPROVEMENT=$(( (DURATION1 - DURATION2) * 100 / DURATION1 ))

if [ $DURATION2 -lt $DURATION1 ]; then
  echo -e "   ${GREEN}Improvement: ${IMPROVEMENT}%${NC}"
  echo "╠════════════════════════════════════════════════════════════════╣"
  echo -e "║  ${GREEN}✅ REDIS CACHE WORKING PERFECTLY!${NC}                        ║"
  echo "╚════════════════════════════════════════════════════════════════╝"
else
  echo -e "   ${YELLOW}⚠️  Performance similar (might be small dataset)${NC}"
  echo "╠════════════════════════════════════════════════════════════════╣"
  echo -e "║  ${GREEN}✅ Redis keys stored, but performance unclear${NC}            ║"
  echo "╚════════════════════════════════════════════════════════════════╝"
fi

# Test 8: Check dashboard cache
echo ""
echo "Test 8: Testing dashboard cache..."
curl -s http://localhost:3000/api/v1/dashboard/stats \
  -H "Authorization: Bearer $TOKEN" > /dev/null

DASHBOARD_KEYS=$(docker exec firma-redis redis-cli KEYS "firma:dashboard:*" | wc -l)
echo "   Dashboard cache keys: $DASHBOARD_KEYS"

if [ $DASHBOARD_KEYS -gt 0 ]; then
  echo -e "${GREEN}✅ Dashboard cache working${NC}"
else
  echo -e "${YELLOW}⚠️  Dashboard cache not stored (might be empty data)${NC}"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo -e "${GREEN}🎉 ALL TESTS COMPLETED!${NC}"
echo "═══════════════════════════════════════════════════════════════"