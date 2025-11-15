#!/bin/bash

# Script untuk verifikasi monitoring setup
# Run from: d:\PROJECT\FIRMA-HUKUM\server\

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║       🔍 MONITORING SETUP VERIFICATION SCRIPT             ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ====================
# 1. Check Docker Services
# ====================
echo -e "${YELLOW}📦 Step 1: Checking Docker Services...${NC}"
echo "=================================="

SERVICES=("firma-api" "firma-prometheus" "firma-grafana" "firma-postgres" "firma-redis")
ALL_RUNNING=true

for SERVICE in "${SERVICES[@]}"; do
    if docker ps --format '{{.Names}}' | grep -q "^${SERVICE}$"; then
        echo -e "  ${GREEN}✓${NC} $SERVICE is running"
    else
        echo -e "  ${RED}✗${NC} $SERVICE is NOT running"
        ALL_RUNNING=false
    fi
done

if [ "$ALL_RUNNING" = true ]; then
    echo -e "${GREEN}✅ All services are running!${NC}"
else
    echo -e "${RED}❌ Some services are not running. Run: docker-compose up -d${NC}"
fi

# ====================
# 2. Check API Health
# ====================
echo ""
echo -e "${YELLOW}🏥 Step 2: Checking API Health...${NC}"
echo "=================================="

echo -n "  Testing /health endpoint... "
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
    echo "    URL: http://localhost:3000/health"
else
    echo -e "${RED}✗ Failed${NC}"
fi

echo -n "  Testing /health/liveness... "
if curl -s http://localhost:3000/health/liveness > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ Failed${NC}"
fi

echo -n "  Testing /health/readiness... "
if curl -s http://localhost:3000/health/readiness > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ Failed${NC}"
fi

# ====================
# 3. Check Metrics Endpoint
# ====================
echo ""
echo -e "${YELLOW}📊 Step 3: Checking Metrics Endpoint...${NC}"
echo "=================================="

echo -n "  Testing /metrics endpoint... "
METRICS_RESPONSE=$(curl -s http://localhost:3000/metrics 2>/dev/null)
if echo "$METRICS_RESPONSE" | grep -q "http_requests_total"; then
    echo -e "${GREEN}✓ OK${NC}"
    echo "    URL: http://localhost:3000/metrics"
    echo ""
    echo "  Sample metrics found:"
    echo "$METRICS_RESPONSE" | grep -E "http_requests_total|cache_hits_total|cache_misses_total|nestjs_" | head -5 | sed 's/^/    /'
else
    echo -e "${RED}✗ Failed or no metrics found${NC}"
    echo "  Trying alternative: /api/v1/metrics"
    
    METRICS_ALT=$(curl -s http://localhost:3000/api/v1/metrics 2>/dev/null)
    if echo "$METRICS_ALT" | grep -q "http_requests_total"; then
        echo -e "    ${YELLOW}⚠ Metrics available at: /api/v1/metrics${NC}"
        echo "    ${YELLOW}⚠ Update prometheus.yml to use this path!${NC}"
    else
        echo -e "    ${RED}✗ No metrics endpoint found${NC}"
    fi
fi

# ====================
# 4. Check Prometheus
# ====================
echo ""
echo -e "${YELLOW}📊 Step 4: Checking Prometheus...${NC}"
echo "=================================="

echo -n "  Testing Prometheus health... "
if curl -s http://localhost:9090/-/healthy > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
    echo "    URL: http://localhost:9090"
else
    echo -e "${RED}✗ Failed${NC}"
fi

echo ""
echo "  Checking Prometheus targets:"
TARGETS=$(curl -s http://localhost:9090/api/v1/targets 2>/dev/null)
if echo "$TARGETS" | grep -q "firma-api"; then
    TARGET_HEALTH=$(echo "$TARGETS" | grep -o '"health":"[^"]*"' | head -1)
    if echo "$TARGET_HEALTH" | grep -q '"health":"up"'; then
        echo -e "    ${GREEN}✓${NC} firma-api target is UP"
    else
        echo -e "    ${YELLOW}⚠${NC} firma-api target exists but status: $TARGET_HEALTH"
    fi
else
    echo -e "    ${RED}✗${NC} firma-api target not found"
    echo "    ${YELLOW}Tip: Check prometheus.yml configuration${NC}"
fi

echo ""
echo "  View targets at: ${BLUE}http://localhost:9090/targets${NC}"

# ====================
# 5. Check Grafana
# ====================
echo ""
echo -e "${YELLOW}📈 Step 5: Checking Grafana...${NC}"
echo "=================================="

echo -n "  Testing Grafana health... "
if curl -s http://localhost:3003/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
    echo "    URL: http://localhost:3003"
    echo "    Username: admin"
    echo "    Password: admin123"
else
    echo -e "${RED}✗ Failed${NC}"
fi

# ====================
# 6. Check Grafana Datasources
# ====================
echo ""
echo -e "${YELLOW}🔗 Step 6: Checking Grafana Datasources...${NC}"
echo "=================================="

echo "  Checking datasource files:"
DATASOURCE_CHECK=$(docker exec firma-grafana sh -c 'ls -la /etc/grafana/provisioning/datasources/ 2>/dev/null' 2>/dev/null)
if [ -n "$DATASOURCE_CHECK" ]; then
    echo "$DATASOURCE_CHECK" | sed 's/^/    /'
    
    # Count .yml/.yaml files
    DATASOURCE_COUNT=$(echo "$DATASOURCE_CHECK" | grep -c '\.ya\?ml$' || echo "0")
    if [ "$DATASOURCE_COUNT" -gt 0 ]; then
        echo -e "    ${GREEN}✓${NC} Found $DATASOURCE_COUNT datasource file(s)"
    else
        echo -e "    ${YELLOW}⚠${NC} No .yml/.yaml datasource files found"
    fi
else
    echo -e "    ${RED}✗${NC} Cannot access datasource directory"
fi

# ====================
# 7. Check Grafana Dashboards
# ====================
echo ""
echo -e "${YELLOW}📈 Step 7: Checking Grafana Dashboards...${NC}"
echo "=================================="

echo "  Checking dashboard files:"
DASHBOARD_CHECK=$(docker exec firma-grafana sh -c 'ls -la /etc/grafana/provisioning/dashboards/ 2>/dev/null' 2>/dev/null)
if [ -n "$DASHBOARD_CHECK" ]; then
    echo "$DASHBOARD_CHECK" | sed 's/^/    /'
    
    # Count .json files
    DASHBOARD_COUNT=$(echo "$DASHBOARD_CHECK" | grep -c '\.json$' || echo "0")
    if [ "$DASHBOARD_COUNT" -gt 0 ]; then
        echo -e "    ${GREEN}✓${NC} Found $DASHBOARD_COUNT dashboard file(s)"
        echo ""
        echo "  Dashboard files:"
        echo "$DASHBOARD_CHECK" | grep '\.json$' | awk '{print "    - " $NF}'
    else
        echo -e "    ${YELLOW}⚠${NC} No .json dashboard files found"
        echo "    ${YELLOW}Tip: Check if dashboards are in subdirectories${NC}"
        
        # Check for subdirectories
        SUBDIRS=$(docker exec firma-grafana sh -c 'find /etc/grafana/provisioning/dashboards -name "*.json" 2>/dev/null' 2>/dev/null)
        if [ -n "$SUBDIRS" ]; then
            echo ""
            echo "  Found dashboards in subdirectories:"
            echo "$SUBDIRS" | sed 's/^/    /'
        fi
    fi
else
    echo -e "    ${RED}✗${NC} Cannot access dashboard directory"
fi

# ====================
# 8. Check Recent Logs
# ====================
echo ""
echo -e "${YELLOW}📝 Step 8: Checking Recent Logs...${NC}"
echo "=================================="

echo ""
echo "  Last 10 lines of Grafana logs:"
echo "  ────────────────────────────────"
docker logs firma-grafana --tail=10 2>&1 | sed 's/^/    /'

echo ""
echo "  Checking for errors:"
ERROR_COUNT=$(docker logs firma-grafana --tail=50 2>&1 | grep -ic "error" || echo "0")
if [ "$ERROR_COUNT" -eq 0 ]; then
    echo -e "    ${GREEN}✓${NC} No errors found in recent logs"
else
    echo -e "    ${YELLOW}⚠${NC} Found $ERROR_COUNT error(s) in recent logs"
    echo ""
    echo "  Recent errors:"
    docker logs firma-grafana --tail=50 2>&1 | grep -i "error" | sed 's/^/    /' | head -5
fi

# ====================
# 9. Test Traffic Generation
# ====================
echo ""
echo -e "${YELLOW}🚦 Step 9: Testing Traffic Generation...${NC}"
echo "=================================="

echo "  Sending 10 test requests to generate metrics..."
for i in {1..10}; do
    curl -s http://localhost:3000/health > /dev/null 2>&1 &
    curl -s http://localhost:3000/metrics > /dev/null 2>&1 &
done
wait

echo -e "    ${GREEN}✓${NC} Test requests sent"
echo "    Wait 10-15 seconds for metrics to appear in Prometheus"

# ====================
# SUMMARY
# ====================
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                     📊 SUMMARY                            ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Quick status check
API_STATUS=$(curl -s http://localhost:3000/health > /dev/null 2>&1 && echo "OK" || echo "FAIL")
PROMETHEUS_STATUS=$(curl -s http://localhost:9090/-/healthy > /dev/null 2>&1 && echo "OK" || echo "FAIL")
GRAFANA_STATUS=$(curl -s http://localhost:3003/api/health > /dev/null 2>&1 && echo "OK" || echo "FAIL")

echo "  Service Status:"
echo -e "    API:        $([ "$API_STATUS" = "OK" ] && echo "${GREEN}✓ Running${NC}" || echo "${RED}✗ Down${NC}")"
echo -e "    Prometheus: $([ "$PROMETHEUS_STATUS" = "OK" ] && echo "${GREEN}✓ Running${NC}" || echo "${RED}✗ Down${NC}")"
echo -e "    Grafana:    $([ "$GRAFANA_STATUS" = "OK" ] && echo "${GREEN}✓ Running${NC}" || echo "${RED}✗ Down${NC}")"

echo ""
echo -e "${BLUE}🔗 Quick Links:${NC}"
echo "  ────────────────────────────────────────────────────────"
echo "  📊 API:               http://localhost:3000"
echo "  📈 API Health:        http://localhost:3000/health"
echo "  📊 API Metrics:       http://localhost:3000/metrics"
echo "  📊 Prometheus:        http://localhost:9090"
echo "  🎯 Prometheus Targets: http://localhost:9090/targets"
echo "  📈 Grafana:           http://localhost:3003"
echo "     Username: admin"
echo "     Password: admin123"
echo ""

# ====================
# NEXT STEPS
# ====================
echo -e "${YELLOW}💡 Next Steps:${NC}"
echo "  ────────────────────────────────────────────────────────"

if [ "$API_STATUS" != "OK" ]; then
    echo -e "  ${RED}1. Start API:${NC} docker-compose up -d api"
fi

if [ "$PROMETHEUS_STATUS" != "OK" ]; then
    echo -e "  ${RED}2. Start Prometheus:${NC} docker-compose up -d prometheus"
fi

if [ "$GRAFANA_STATUS" != "OK" ]; then
    echo -e "  ${RED}3. Start Grafana:${NC} docker-compose up -d grafana"
fi

if [ "$API_STATUS" = "OK" ] && [ "$PROMETHEUS_STATUS" = "OK" ] && [ "$GRAFANA_STATUS" = "OK" ]; then
    echo -e "  ${GREEN}✅ All services are running!${NC}"
    echo ""
    echo "  To populate dashboards with data:"
    echo "    1. Generate traffic:"
    echo "       ${CYAN}bash scripts/generate-traffic.sh${NC}"
    echo ""
    echo "    2. Or use justfile:"
    echo "       ${CYAN}just traffic${NC}"
    echo ""
    echo "    3. Wait 30-60 seconds for metrics to propagate"
    echo ""
    echo "    4. Open Grafana and refresh dashboards"
    echo "       ${BLUE}http://localhost:3003${NC}"
fi

echo ""
echo -e "${YELLOW}🔧 Troubleshooting Commands:${NC}"
echo "  ────────────────────────────────────────────────────────"
echo "  View API logs:        docker logs firma-api -f"
echo "  View Prometheus logs: docker logs firma-prometheus -f"
echo "  View Grafana logs:    docker logs firma-grafana -f"
echo "  Restart all:          docker-compose restart"
echo "  Restart Grafana:      docker-compose restart grafana"
echo ""
echo -e "${YELLOW}📚 Using Justfile (Recommended):${NC}"
echo "  ────────────────────────────────────────────────────────"
echo "  View all commands:    just"
echo "  Start services:       just dev"
echo "  View logs:            just logs-api"
echo "  Check health:         just health"
echo "  Generate traffic:     just traffic"
echo "  Open Grafana:         just grafana"
echo "  Open Prometheus:      just prometheus"
echo "  Verify monitoring:    just mon-verify"
echo ""

# ====================
# METRICS CHECK
# ====================
if [ "$API_STATUS" = "OK" ] && [ "$PROMETHEUS_STATUS" = "OK" ]; then
    echo -e "${CYAN}🔍 Checking if Prometheus is scraping metrics...${NC}"
    echo "  ────────────────────────────────────────────────────────"
    
    sleep 2
    
    # Query Prometheus for API metrics
    PROM_QUERY=$(curl -s "http://localhost:9090/api/v1/query?query=up{job=\"firma-api\"}" 2>/dev/null)
    
    if echo "$PROM_QUERY" | grep -q '"value":\[.*,.*"1"\]'; then
        echo -e "  ${GREEN}✓${NC} Prometheus is successfully scraping API metrics!"
        echo -e "  ${GREEN}✓${NC} Target 'firma-api' is UP"
    elif echo "$PROM_QUERY" | grep -q '"value":\[.*,.*"0"\]'; then
        echo -e "  ${RED}✗${NC} Prometheus can see target but it's DOWN"
        echo "  ${YELLOW}Tip: Check if metrics endpoint is accessible${NC}"
    else
        echo -e "  ${YELLOW}⚠${NC} Cannot verify scraping status"
        echo "  ${YELLOW}Tip: Wait a few seconds and check Prometheus targets${NC}"
        echo "  ${BLUE}http://localhost:9090/targets${NC}"
    fi
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ Verification Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""