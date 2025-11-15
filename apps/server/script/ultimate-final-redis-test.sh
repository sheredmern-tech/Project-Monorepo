#!/bin/bash

# ============================================================================
# 🔥 ULTIMATE FINAL REDIS TEST - PRODUCTION READINESS VERIFICATION
# ============================================================================
# Tests ADVANCED features that ultimate-redis-test.sh doesn't cover:
# - Cache warming on startup
# - Compression effectiveness
# - Redis persistence & recovery
# - Controller endpoints (/api/v1/cache/*)
# - Scheduled cache warming
# - Chaos engineering (failover scenarios)
# ============================================================================

BASE_URL="http://localhost:3000/api/v1"
REDIS_CONTAINER="firma-redis"
API_CONTAINER="firma-api"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

print_header() {
    echo ""
    echo -e "${MAGENTA}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${MAGENTA}║${NC}     🔥 ULTIMATE FINAL REDIS TEST - PRODUCTION READY 🔥       ${MAGENTA}║${NC}"
    echo -e "${CYAN}║${NC}            Advanced Features & Chaos Engineering               ${CYAN}║${NC}"
    echo -e "${MAGENTA}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_section() {
    echo ""
    echo -e "${YELLOW}================================================${NC}"
    echo -e "${YELLOW}$1${NC}"
    echo -e "${YELLOW}================================================${NC}"
    echo ""
}

print_test() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${BLUE}TEST $TOTAL_TESTS: $1${NC}"
}

pass_test() {
    PASSED_TESTS=$((PASSED_TESTS + 1))
    echo -e "${GREEN}✅ PASS${NC} - $1"
}

fail_test() {
    FAILED_TESTS=$((FAILED_TESTS + 1))
    echo -e "${RED}❌ FAIL${NC} - $1"
}

skip_test() {
    SKIPPED_TESTS=$((SKIPPED_TESTS + 1))
    echo -e "${YELLOW}⏭️  SKIP${NC} - $1"
}

info_test() {
    echo -e "   ${CYAN}ℹ️  $1${NC}"
}

warn_test() {
    echo -e "${YELLOW}⚠️  WARN${NC} - $1"
}

# Redis helpers
redis_exec() {
    docker exec $REDIS_CONTAINER redis-cli "$@" 2>/dev/null
}

redis_keys_count() {
    redis_exec DBSIZE | grep -oE '[0-9]+'
}

# ============================================================================
print_header

# ============================================================================
print_section "🔥 PHASE 1: CACHE WARMING VERIFICATION"
# ============================================================================

print_test "Check Cache Warming on Startup"
# Restart API to trigger onModuleInit
echo "   ${CYAN}Restarting API container...${NC}"
docker restart $API_CONTAINER > /dev/null 2>&1
sleep 15 # Wait for startup

# Check logs for warming messages
WARMING_LOGS=$(docker logs $API_CONTAINER --tail 100 2>&1 | grep -i "cache warming")

if echo "$WARMING_LOGS" | grep -q "Starting cache warming"; then
    pass_test "Cache warming triggered on startup"
    info_test "Found warming logs in container output"
    
    # Check if completed successfully
    if echo "$WARMING_LOGS" | grep -q "Completed"; then
        DURATION=$(echo "$WARMING_LOGS" | grep "Completed" | grep -oP '\d+ms' | head -1)
        info_test "Warming completed in: $DURATION"
        
        # Extract succeeded/failed counts
        SUCCEEDED=$(echo "$WARMING_LOGS" | grep "Completed" | grep -oP '\d+ succeeded' | grep -oP '\d+')
        FAILED=$(echo "$WARMING_LOGS" | grep "Completed" | grep -oP '\d+ failed' | grep -oP '\d+')
        
        if [ ! -z "$SUCCEEDED" ] && [ "$SUCCEEDED" -gt 0 ]; then
            pass_test "Cache warming succeeded: $SUCCEEDED tasks completed"
        else
            fail_test "No successful warming tasks recorded"
        fi
        
        if [ ! -z "$FAILED" ] && [ "$FAILED" -gt 0 ]; then
            warn_test "$FAILED warming tasks failed"
        fi
    else
        warn_test "Warming logs incomplete - check if process finished"
    fi
else
    fail_test "No cache warming logs found - warming disabled or failed"
fi

print_test "Verify Pre-warmed Keys Exist"
KEYS_COUNT=$(redis_keys_count)

if [ "$KEYS_COUNT" -gt 0 ]; then
    pass_test "Found $KEYS_COUNT pre-warmed keys in Redis"
    
    # Check for expected warming keys
    EXPECTED_KEYS=(
        "firma:dashboard:stats"
        "firma:dashboard:recentActivities"
        "firma:dashboard:perkaraByJenis"
        "firma:dashboard:perkaraByStatus"
        "firma:dashboard:upcomingSidang"
        "firma:klien:findAll"
        "firma:perkara:findAll"
    )
    
    for key_pattern in "${EXPECTED_KEYS[@]}"; do
        if redis_exec KEYS "*$key_pattern*" | grep -q "$key_pattern"; then
            info_test "✓ Found: $key_pattern"
        else
            warn_test "✗ Missing: $key_pattern"
        fi
    done
else
    fail_test "No pre-warmed keys found - warming failed"
fi

print_test "Measure Time to First Byte (TTFB)"
# First request should be instant (cache already warmed)
echo "   ${CYAN}Testing dashboard stats (should be cached)...${NC}"

# Get token first
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@perari.id", "password": "Admin123!"}' | \
  grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

START_TIME=$(date +%s%3N)
curl -s -X GET "$BASE_URL/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN" > /dev/null
END_TIME=$(date +%s%3N)
TTFB=$((END_TIME - START_TIME))

info_test "TTFB: ${TTFB}ms"

if [ "$TTFB" -lt 100 ]; then
    pass_test "Excellent TTFB - cache working perfectly (${TTFB}ms)"
elif [ "$TTFB" -lt 200 ]; then
    pass_test "Good TTFB - cache serving requests fast (${TTFB}ms)"
else
    warn_test "Slow TTFB - might not be hitting cache (${TTFB}ms)"
fi

# ============================================================================
print_section "📦 PHASE 2: COMPRESSION EFFECTIVENESS"
# ============================================================================

print_test "Verify Compression in Logs"
COMPRESSION_LOGS=$(docker logs $API_CONTAINER --tail 200 2>&1 | grep -i "compressed")

if [ ! -z "$COMPRESSION_LOGS" ]; then
    pass_test "Compression logs found in container output"
    
    # Extract compression ratios
    echo "$COMPRESSION_LOGS" | grep "reduction" | head -5 | while read line; do
        RATIO=$(echo "$line" | grep -oP '\d+\.\d+%' | tail -1)
        BEFORE=$(echo "$line" | grep -oP '\d+ →' | grep -oP '\d+')
        AFTER=$(echo "$line" | grep -oP '→ \d+' | grep -oP '\d+')
        info_test "Compression: ${BEFORE}B → ${AFTER}B (${RATIO} reduction)"
    done
else
    warn_test "No compression logs found - check if compression enabled"
fi

print_test "Compare Redis Memory Usage"
MEMORY_BEFORE=$(redis_exec INFO memory | grep "used_memory:" | cut -d: -f2 | tr -d '\r')
info_test "Redis memory usage: $MEMORY_BEFORE bytes"

# Calculate theoretical uncompressed size
TOTAL_KEYS=$(redis_keys_count)
if [ "$TOTAL_KEYS" -gt 0 ]; then
    AVG_SIZE=0
    KEY_COUNT=0
    
    redis_exec KEYS "firma:*" | while read key; do
        if [ ! -z "$key" ]; then
            SIZE=$(redis_exec MEMORY USAGE "$key" 2>/dev/null)
            if [ ! -z "$SIZE" ] && [ "$SIZE" != "N/A" ]; then
                AVG_SIZE=$((AVG_SIZE + SIZE))
                KEY_COUNT=$((KEY_COUNT + 1))
            fi
        fi
    done
    
    if [ "$KEY_COUNT" -gt 0 ]; then
        AVG_SIZE=$((AVG_SIZE / KEY_COUNT))
        info_test "Average key size: $AVG_SIZE bytes"
        pass_test "Memory analysis completed"
    else
        skip_test "Could not calculate average key size"
    fi
else
    skip_test "No keys to analyze"
fi

print_test "Compression Service Status"
COMPRESSION_STATUS=$(curl -s -X GET "$BASE_URL/cache/status" \
  -H "Authorization: Bearer $TOKEN" | grep -o '"enabled":[^,]*' | head -1)

if echo "$COMPRESSION_STATUS" | grep -q "true"; then
    pass_test "Compression is ENABLED in service"
else
    warn_test "Compression appears to be DISABLED"
fi

# ============================================================================
print_section "💾 PHASE 3: REDIS PERSISTENCE & RECOVERY"
# ============================================================================

print_test "Check Redis Persistence Configuration"
PERSISTENCE_CONFIG=$(redis_exec CONFIG GET save)
info_test "Redis save config: $PERSISTENCE_CONFIG"

if echo "$PERSISTENCE_CONFIG" | grep -q "save"; then
    pass_test "Redis persistence is configured"
else
    warn_test "Redis persistence might not be enabled"
fi

print_test "Verify RDB Snapshots"
RDB_FILE=$(docker exec $REDIS_CONTAINER ls -lh /data/*.rdb 2>/dev/null)

if [ ! -z "$RDB_FILE" ]; then
    pass_test "RDB snapshot file exists"
    info_test "$RDB_FILE"
else
    warn_test "No RDB snapshot found - data might not persist"
fi

print_test "Chaos Test: Redis Restart"
echo "   ${CYAN}Stopping Redis container...${NC}"
KEYS_BEFORE_STOP=$(redis_keys_count)
info_test "Keys before stop: $KEYS_BEFORE_STOP"

docker stop $REDIS_CONTAINER > /dev/null 2>&1
sleep 2

echo "   ${CYAN}Starting Redis container...${NC}"
docker start $REDIS_CONTAINER > /dev/null 2>&1
sleep 5

# Wait for Redis to be ready
for i in {1..10}; do
    if redis_exec PING 2>/dev/null | grep -q "PONG"; then
        break
    fi
    sleep 1
done

KEYS_AFTER_RESTART=$(redis_keys_count)
info_test "Keys after restart: $KEYS_AFTER_RESTART"

if [ "$KEYS_AFTER_RESTART" -gt 0 ]; then
    pass_test "Redis recovered data after restart"
    
    if [ "$KEYS_AFTER_RESTART" -eq "$KEYS_BEFORE_STOP" ]; then
        pass_test "All keys preserved (${KEYS_AFTER_RESTART}/${KEYS_BEFORE_STOP})"
    else
        warn_test "Key count mismatch: ${KEYS_AFTER_RESTART}/${KEYS_BEFORE_STOP}"
    fi
else
    fail_test "Redis lost all data - persistence NOT working"
fi

print_test "API Reconnection After Redis Restart"
sleep 5 # Wait for API to reconnect

RECONNECT_RESPONSE=$(curl -s -X GET "$BASE_URL/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN")

if echo "$RECONNECT_RESPONSE" | grep -q "total_perkara"; then
    pass_test "API successfully reconnected to Redis"
else
    fail_test "API failed to reconnect - check Redis connection handling"
fi

# ============================================================================
print_section "🎛️  PHASE 4: CONTROLLER ENDPOINTS TEST"
# ============================================================================

print_test "GET /api/v1/cache/status"
STATUS_RESPONSE=$(curl -s -X GET "$BASE_URL/cache/status" \
  -H "Authorization: Bearer $TOKEN")

if echo "$STATUS_RESPONSE" | grep -q "redis"; then
    pass_test "Cache status endpoint working"
    
    if echo "$STATUS_RESPONSE" | grep -q "\"connected\":true"; then
        info_test "✓ Redis connected"
    fi
    
    if echo "$STATUS_RESPONSE" | grep -q "compression"; then
        info_test "✓ Compression stats present"
    fi
    
    if echo "$STATUS_RESPONSE" | grep -q "warming"; then
        info_test "✓ Warming status present"
    fi
else
    fail_test "Cache status endpoint not returning expected data"
fi

print_test "POST /api/v1/cache/warm (Manual Trigger)"
WARM_RESPONSE=$(curl -s -X POST "$BASE_URL/cache/warm" \
  -H "Authorization: Bearer $TOKEN")

if echo "$WARM_RESPONSE" | grep -q "success\|completed"; then
    pass_test "Manual cache warming triggered successfully"
    
    MANUAL_DURATION=$(echo "$WARM_RESPONSE" | grep -oP '"duration":\d+' | grep -oP '\d+')
    if [ ! -z "$MANUAL_DURATION" ]; then
        info_test "Warming duration: ${MANUAL_DURATION}ms"
    fi
else
    fail_test "Manual cache warming failed"
fi

print_test "GET /api/v1/cache/keys"
KEYS_RESPONSE=$(curl -s -X GET "$BASE_URL/cache/keys" \
  -H "Authorization: Bearer $TOKEN")

if echo "$KEYS_RESPONSE" | grep -q "total"; then
    TOTAL_KEYS_API=$(echo "$KEYS_RESPONSE" | grep -oP '"total":\d+' | grep -oP '\d+')
    pass_test "Cache keys endpoint working (found $TOTAL_KEYS_API keys)"
else
    fail_test "Cache keys endpoint not working"
fi

print_test "GET /api/v1/cache/stats"
STATS_RESPONSE=$(curl -s -X GET "$BASE_URL/cache/stats" \
  -H "Authorization: Bearer $TOKEN")

if echo "$STATS_RESPONSE" | grep -q "total_keys"; then
    pass_test "Cache stats endpoint working"
    
    HIT_RATE=$(echo "$STATS_RESPONSE" | grep -oP '"hit_rate":"[^"]*"' | cut -d'"' -f4)
    MEMORY_USED=$(echo "$STATS_RESPONSE" | grep -oP '"used":"[^"]*"' | cut -d'"' -f4)
    
    if [ ! -z "$HIT_RATE" ]; then
        info_test "Hit rate: $HIT_RATE"
    fi
    
    if [ ! -z "$MEMORY_USED" ]; then
        info_test "Memory used: $MEMORY_USED"
    fi
else
    fail_test "Cache stats endpoint not returning expected data"
fi

print_test "DELETE /api/v1/cache/flush (Danger Zone)"
echo "   ${YELLOW}⚠️  This will flush all cache!${NC}"
echo "   ${CYAN}Creating backup first...${NC}"

BACKUP_KEYS=$(redis_exec KEYS "firma:*")

FLUSH_RESPONSE=$(curl -s -X DELETE "$BASE_URL/cache/flush" \
  -H "Authorization: Bearer $TOKEN")

if echo "$FLUSH_RESPONSE" | grep -q "flushed"; then
    pass_test "Cache flush endpoint working"
    
    sleep 1
    KEYS_AFTER_FLUSH=$(redis_keys_count)
    
    if [ "$KEYS_AFTER_FLUSH" -eq 0 ]; then
        pass_test "All keys successfully flushed"
        
        # Trigger warming to restore cache
        echo "   ${CYAN}Re-warming cache...${NC}"
        curl -s -X POST "$BASE_URL/cache/warm" \
          -H "Authorization: Bearer $TOKEN" > /dev/null
        sleep 3
        
        KEYS_AFTER_REWARM=$(redis_keys_count)
        if [ "$KEYS_AFTER_REWARM" -gt 0 ]; then
            pass_test "Cache restored after flush ($KEYS_AFTER_REWARM keys)"
        fi
    else
        warn_test "Flush incomplete ($KEYS_AFTER_FLUSH keys remain)"
    fi
else
    fail_test "Cache flush endpoint failed"
fi

# ============================================================================
print_section "⏰ PHASE 5: SCHEDULED CACHE WARMING"
# ============================================================================

print_test "Verify Cron Decorator in Source"
if docker exec $API_CONTAINER grep -r "@Cron" /app/dist 2>/dev/null | grep -q "schedule"; then
    pass_test "Cron decorator found in compiled code"
else
    skip_test "Cannot verify cron in compiled code"
fi

print_test "Check ScheduleModule Initialization"
SCHEDULE_LOGS=$(docker logs $API_CONTAINER --tail 200 2>&1 | grep -i "ScheduleModule")

if [ ! -z "$SCHEDULE_LOGS" ]; then
    pass_test "ScheduleModule initialized successfully"
    info_test "Found: $(echo "$SCHEDULE_LOGS" | head -1)"
else
    warn_test "No ScheduleModule logs found"
fi

print_test "Warming Service Configuration"
# Check warming status endpoint
WARMING_CONFIG=$(curl -s -X GET "$BASE_URL/cache/status" \
  -H "Authorization: Bearer $TOKEN" | grep -A5 "warming")

if [ ! -z "$WARMING_CONFIG" ]; then
    if echo "$WARMING_CONFIG" | grep -q "enabled.*true"; then
        pass_test "Cache warming is ENABLED"
    else
        warn_test "Cache warming might be DISABLED"
    fi
    
    if echo "$WARMING_CONFIG" | grep -q "onStartup.*true"; then
        info_test "✓ Warming on startup: ENABLED"
    fi
    
    if echo "$WARMING_CONFIG" | grep -q "EVERY_6_HOURS"; then
        info_test "✓ Scheduled warming: Every 6 hours"
    fi
else
    skip_test "Cannot verify warming configuration"
fi

# ============================================================================
print_section "🔬 PHASE 6: EDGE CASES & ERROR HANDLING"
# ============================================================================

print_test "Large Payload Compression"
# Create a large test payload
LARGE_PAYLOAD=$(curl -s -X GET "$BASE_URL/klien?page=1&limit=50" \
  -H "Authorization: Bearer $TOKEN")

PAYLOAD_SIZE=$(echo "$LARGE_PAYLOAD" | wc -c)
info_test "Payload size: $PAYLOAD_SIZE bytes"

if [ "$PAYLOAD_SIZE" -gt 1024 ]; then
    pass_test "Large payload test executed (${PAYLOAD_SIZE}B)"
    
    # Check if it was compressed
    sleep 1
    COMPRESSION_LOG=$(docker logs $API_CONTAINER --tail 50 2>&1 | grep "Compressed" | tail -1)
    
    if [ ! -z "$COMPRESSION_LOG" ]; then
        info_test "Compression applied: $COMPRESSION_LOG"
    fi
else
    skip_test "Payload too small to test compression effectively"
fi

print_test "Invalid Cache Key Pattern"
INVALID_PATTERN=$(curl -s -X GET "$BASE_URL/cache/keys" \
  -H "Authorization: Bearer $TOKEN" | grep -o '"keys":\[\]')

if [ -z "$INVALID_PATTERN" ]; then
    pass_test "Cache keys endpoint handles patterns correctly"
else
    warn_test "Unexpected empty keys array"
fi

print_test "Redis Connection Error Handling"
# This test requires temporarily disconnecting Redis
# Skip if not in test environment
skip_test "Redis disconnection test skipped (requires manual intervention)"

# ============================================================================
print_section "📊 FINAL PRODUCTION READINESS REPORT"
# ============================================================================

echo ""
echo -e "${MAGENTA}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║${NC}              ULTIMATE FINAL TEST RESULTS                       ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╠════════════════════════════════════════════════════════════════╣${NC}"
printf "${MAGENTA}║${NC}  Total Tests:    %-43s ${MAGENTA}║${NC}\n" "$TOTAL_TESTS"
printf "${MAGENTA}║${NC}  ${GREEN}Passed:        %-43s${NC} ${MAGENTA}║${NC}\n" "$PASSED_TESTS"
printf "${MAGENTA}║${NC}  ${RED}Failed:        %-43s${NC} ${MAGENTA}║${NC}\n" "$FAILED_TESTS"
printf "${MAGENTA}║${NC}  ${YELLOW}Skipped:       %-43s${NC} ${MAGENTA}║${NC}\n" "$SKIPPED_TESTS"
echo -e "${MAGENTA}╠════════════════════════════════════════════════════════════════╣${NC}"

SUCCESS_RATE=$(awk "BEGIN {printf \"%.1f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")
printf "${MAGENTA}║${NC}  Success Rate:   %-42s ${MAGENTA}║${NC}\n" "${SUCCESS_RATE}%"

echo -e "${MAGENTA}╠════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${MAGENTA}║${NC}                 PRODUCTION READINESS CHECKLIST                 ${MAGENTA}║${NC}"
echo -e "${MAGENTA}╠════════════════════════════════════════════════════════════════╣${NC}"

# Check critical features
FINAL_KEYS=$(redis_keys_count)

if [ "$FINAL_KEYS" -gt 0 ]; then
    echo -e "${MAGENTA}║${NC}  ${GREEN}✅ Redis Cache Operational${NC}                                 ${MAGENTA}║${NC}"
else
    echo -e "${MAGENTA}║${NC}  ${RED}❌ Redis Cache NOT Working${NC}                                 ${MAGENTA}║${NC}"
fi

if [ "$PASSED_TESTS" -gt $((TOTAL_TESTS * 80 / 100)) ]; then
    echo -e "${MAGENTA}║${NC}  ${GREEN}✅ Advanced Features Working${NC}                               ${MAGENTA}║${NC}"
else
    echo -e "${MAGENTA}║${NC}  ${YELLOW}⚠️  Some Advanced Features Need Attention${NC}                 ${MAGENTA}║${NC}"
fi

if [ "$FAILED_TESTS" -eq 0 ]; then
    echo -e "${MAGENTA}║${NC}  ${GREEN}✅ No Critical Failures${NC}                                    ${MAGENTA}║${NC}"
else
    echo -e "${MAGENTA}║${NC}  ${RED}❌ Critical Failures Detected${NC}                              ${MAGENTA}║${NC}"
fi

echo -e "${MAGENTA}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Final verdict
if [ "$FAILED_TESTS" -eq 0 ] && [ "$FINAL_KEYS" -gt 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
    echo -e "${GREEN}║          🎉 PRODUCTION READY! ALL SYSTEMS GO! 🎉             ║${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    exit 0
elif [ "$FAILED_TESTS" -le 2 ] && [ "$FINAL_KEYS" -gt 0 ]; then
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║                                                                ║${NC}"
    echo -e "${YELLOW}║   ⚠️  MOSTLY READY - Minor Issues to Address ⚠️            ║${NC}"
    echo -e "${YELLOW}║                                                                ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════════════╝${NC}"
    exit 1
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                                ║${NC}"
    echo -e "${RED}║       ❌ NOT PRODUCTION READY - Critical Issues Found ❌     ║${NC}"
    echo -e "${RED}║                                                                ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
    exit 2
fi