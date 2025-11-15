#!/bin/bash

# ===== COMPREHENSIVE TRAFFIC GENERATOR FOR GRAFANA DASHBOARDS =====
# This script generates realistic API traffic to populate all dashboard metrics

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"
TOTAL_REQUESTS="${TOTAL_REQUESTS:-500}"
CONCURRENT_REQUESTS="${CONCURRENT_REQUESTS:-5}"
DELAY_BETWEEN_BATCHES="${DELAY_BETWEEN_BATCHES:-0.1}"

# Counters
SUCCESS_COUNT=0
ERROR_COUNT=0
START_TIME=$(date +%s)

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║       🚀 TRAFFIC GENERATOR FOR GRAFANA DASHBOARDS         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}📊 Configuration:${NC}"
echo "   API Base URL: $API_BASE_URL"
echo "   Total Requests: $TOTAL_REQUESTS"
echo "   Concurrent: $CONCURRENT_REQUESTS"
echo "   Delay: ${DELAY_BETWEEN_BATCHES}s"
echo ""

# Function to make API request
make_request() {
    local METHOD=$1
    local ENDPOINT=$2
    local DESCRIPTION=$3
    
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X "$METHOD" "$API_BASE_URL$ENDPOINT" 2>/dev/null || echo "000")
    
    if [[ "$RESPONSE" =~ ^[2-3][0-9][0-9]$ ]]; then
        ((SUCCESS_COUNT++))
        echo -e "${GREEN}✓${NC} $DESCRIPTION (${RESPONSE})"
        return 0
    else
        ((ERROR_COUNT++))
        echo -e "${RED}✗${NC} $DESCRIPTION (${RESPONSE})"
        return 1
    fi
}

# Function to login and get token
get_auth_token() {
    echo -e "\n${BLUE}🔑 Getting authentication token...${NC}"
    
    TOKEN=$(curl -s -X POST "$API_BASE_URL/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@perari.id","password":"Admin123!"}' \
        | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')
    
    if [ -z "$TOKEN" ]; then
        echo -e "${RED}❌ Failed to get auth token${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✓ Token acquired${NC}"
    echo "$TOKEN"
}

# Function to make authenticated request
make_auth_request() {
    local METHOD=$1
    local ENDPOINT=$2
    local DESCRIPTION=$3
    local TOKEN=$4
    
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
        -X "$METHOD" \
        -H "Authorization: Bearer $TOKEN" \
        "$API_BASE_URL$ENDPOINT" 2>/dev/null || echo "000")
    
    if [[ "$RESPONSE" =~ ^[2-3][0-9][0-9]$ ]]; then
        ((SUCCESS_COUNT++))
        return 0
    else
        ((ERROR_COUNT++))
        return 1
    fi
}

# ============================================================================
# PHASE 1: Basic Health & Metrics Endpoints
# ============================================================================
echo -e "\n${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}  PHASE 1: Health & Metrics (100 requests)${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

for i in $(seq 1 100); do
    case $((i % 4)) in
        0) make_request GET "/health" "Health check" ;;
        1) make_request GET "/health/liveness" "Liveness probe" ;;
        2) make_request GET "/health/readiness" "Readiness probe" ;;
        3) make_request GET "/metrics" "Prometheus metrics" ;;
    esac
    sleep 0.05
done

echo -e "${GREEN}✓ Phase 1 Complete: Basic endpoints${NC}"

# ============================================================================
# PHASE 2: Authentication & User Endpoints
# ============================================================================
echo -e "\n${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}  PHASE 2: Authentication (50 requests)${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Get auth token
AUTH_TOKEN=$(get_auth_token)

# Login attempts (mix success and simulated failures)
for i in $(seq 1 50); do
    if [ $((i % 5)) -eq 0 ]; then
        # Simulate wrong password (401)
        curl -s -o /dev/null -w "%{http_code}" -X POST "$API_BASE_URL/api/v1/auth/login" \
            -H "Content-Type: application/json" \
            -d '{"email":"admin@perari.id","password":"wrongpassword"}' > /dev/null 2>&1
        ((ERROR_COUNT++))
        echo -e "${YELLOW}⚠${NC} Login attempt (simulated wrong password)"
    else
        # Successful login
        RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_BASE_URL/api/v1/auth/login" \
            -H "Content-Type: application/json" \
            -d '{"email":"admin@perari.id","password":"Admin123!"}' 2>/dev/null || echo "000")
        
        if [[ "$RESPONSE" =~ ^[2-3][0-9][0-9]$ ]]; then
            ((SUCCESS_COUNT++))
            echo -e "${GREEN}✓${NC} Login successful (${RESPONSE})"
        fi
    fi
    sleep 0.1
done

echo -e "${GREEN}✓ Phase 2 Complete: Authentication${NC}"

# ============================================================================
# PHASE 3: Protected API Endpoints (with auth)
# ============================================================================
echo -e "\n${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}  PHASE 3: Protected Endpoints (150 requests)${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -n "$AUTH_TOKEN" ]; then
    ENDPOINTS=(
        "GET /api/v1/users Users"
        "GET /api/v1/users/profile Profile"
        "GET /api/v1/klien Clients"
        "GET /api/v1/perkara Cases"
        "GET /api/v1/tugas Tasks"
        "GET /api/v1/sidang Hearings"
        "GET /api/v1/dokumen Documents"
        "GET /api/v1/catatan Notes"
        "GET /api/v1/dashboard Dashboard"
        "GET /api/v1/logs Logs"
    )
    
    for i in $(seq 1 150); do
        RANDOM_ENDPOINT=${ENDPOINTS[$RANDOM % ${#ENDPOINTS[@]}]}
        read -r METHOD ENDPOINT DESC <<< "$RANDOM_ENDPOINT"
        
        make_auth_request "$METHOD" "$ENDPOINT" "$DESC" "$AUTH_TOKEN"
        sleep 0.05
    done
else
    echo -e "${YELLOW}⚠ Skipping authenticated endpoints (no token)${NC}"
fi

echo -e "${GREEN}✓ Phase 3 Complete: Protected endpoints${NC}"

# ============================================================================
# PHASE 4: Mixed Traffic Pattern (Realistic)
# ============================================================================
echo -e "\n${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}  PHASE 4: Realistic Mixed Traffic (200 requests)${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

for i in $(seq 1 200); do
    RAND=$((RANDOM % 100))
    
    if [ $RAND -lt 30 ]; then
        # 30% - Health checks
        make_request GET "/health" "Health" > /dev/null 2>&1
    elif [ $RAND -lt 50 ]; then
        # 20% - Metrics
        make_request GET "/metrics" "Metrics" > /dev/null 2>&1
    elif [ $RAND -lt 70 ] && [ -n "$AUTH_TOKEN" ]; then
        # 20% - User endpoints
        make_auth_request GET "/api/v1/users" "Users" "$AUTH_TOKEN" > /dev/null 2>&1
    elif [ $RAND -lt 85 ] && [ -n "$AUTH_TOKEN" ]; then
        # 15% - Cases
        make_auth_request GET "/api/v1/perkara" "Cases" "$AUTH_TOKEN" > /dev/null 2>&1
    elif [ $RAND -lt 95 ] && [ -n "$AUTH_TOKEN" ]; then
        # 10% - Dashboard
        make_auth_request GET "/api/v1/dashboard" "Dashboard" "$AUTH_TOKEN" > /dev/null 2>&1
    else
        # 5% - Other endpoints
        make_request GET "/health/liveness" "Liveness" > /dev/null 2>&1
    fi
    
    # Progress indicator
    if [ $((i % 20)) -eq 0 ]; then
        echo -e "${CYAN}Progress: $i/200${NC}"
    fi
    
    sleep 0.05
done

echo -e "${GREEN}✓ Phase 4 Complete: Mixed traffic${NC}"

# ============================================================================
# SUMMARY
# ============================================================================
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
TOTAL_REQUESTS=$((SUCCESS_COUNT + ERROR_COUNT))
SUCCESS_RATE=$(awk "BEGIN {printf \"%.2f\", ($SUCCESS_COUNT/$TOTAL_REQUESTS)*100}")

echo -e "\n${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                     📊 SUMMARY                            ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ✓ Total Requests:     ${GREEN}$TOTAL_REQUESTS${NC}"
echo -e "  ✓ Successful:         ${GREEN}$SUCCESS_COUNT${NC}"
echo -e "  ✗ Errors:             ${RED}$ERROR_COUNT${NC}"
echo -e "  📈 Success Rate:      ${GREEN}${SUCCESS_RATE}%${NC}"
echo -e "  ⏱  Duration:          ${BLUE}${DURATION}s${NC}"
echo -e "  🚀 Requests/sec:      ${MAGENTA}$(awk "BEGIN {printf \"%.2f\", $TOTAL_REQUESTS/$DURATION}")${NC}"
echo ""
echo -e "${YELLOW}💡 Next Steps:${NC}"
echo "   1. Wait 30-60 seconds for metrics to propagate"
echo "   2. Open Grafana: http://localhost:3003"
echo "   3. Navigate to 'Firma Hukum PERARI' folder"
echo "   4. Refresh dashboards (Ctrl+Shift+R or click refresh icon)"
echo ""
echo -e "${GREEN}✨ Traffic generation complete!${NC}"