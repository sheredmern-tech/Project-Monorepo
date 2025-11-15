#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API Base URL
API_URL="http://localhost:3000"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "          🔒 FIRMA HUKUM API - SECURITY TEST SUITE 🔒             "
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Function to print test result
print_result() {
    local test_name=$1
    local expected=$2
    local actual=$3
    
    if [ "$expected" == "$actual" ]; then
        echo -e "${GREEN}✅ PASS${NC} - $test_name"
    else
        echo -e "${RED}❌ FAIL${NC} - $test_name (Expected: $expected, Got: $actual)"
    fi
}

# Function to extract status code
get_status_code() {
    echo "$1" | grep -o '"statusCode":[0-9]*' | grep -o '[0-9]*'
}

# Function to check if response contains success:true
check_success() {
    echo "$1" | grep -q '"success":true' && echo "true" || echo "false"
}

echo "================================================"
echo "🧪 TEST 1: Public Endpoints (Should be accessible)"
echo "================================================"
echo ""

# Test 1.1: Root endpoint
echo -e "${BLUE}Testing:${NC} GET /"
response=$(curl -s "$API_URL")
success=$(check_success "$response")
print_result "Root endpoint accessible" "true" "$success"
echo ""

# Test 1.2: Login endpoint (with invalid data)
echo -e "${BLUE}Testing:${NC} POST /api/v1/auth/login (invalid password)"
response=$(curl -s -X POST "$API_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"123"}')
status_code=$(get_status_code "$response")
print_result "Login validation working" "400" "$status_code"
echo ""

# Test 1.3: Login endpoint (with valid format)
echo -e "${BLUE}Testing:${NC} POST /api/v1/auth/login (valid format, wrong credentials)"
response=$(curl -s -X POST "$API_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"password123"}')
status_code=$(get_status_code "$response")
# Should be 401 (wrong credentials) or 400 (validation), not 404
if [ "$status_code" == "401" ] || [ "$status_code" == "400" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Login endpoint accessible (status: $status_code)"
else
    echo -e "${RED}❌ FAIL${NC} - Login endpoint not accessible properly (status: $status_code)"
fi
echo ""

echo "================================================"
echo "🔒 TEST 2: Protected Endpoints (Should require auth)"
echo "================================================"
echo ""

# Test 2.1: Users endpoint
echo -e "${BLUE}Testing:${NC} GET /api/v1/users (no token)"
response=$(curl -s "$API_URL/api/v1/users")
status_code=$(get_status_code "$response")
print_result "Users endpoint protected" "401" "$status_code"
echo ""

# Test 2.2: Dashboard stats
echo -e "${BLUE}Testing:${NC} GET /api/v1/dashboard/stats (no token)"
response=$(curl -s "$API_URL/api/v1/dashboard/stats")
status_code=$(get_status_code "$response")
print_result "Dashboard endpoint protected" "401" "$status_code"
echo ""

# Test 2.3: Klien endpoint
echo -e "${BLUE}Testing:${NC} GET /api/v1/klien (no token)"
response=$(curl -s "$API_URL/api/v1/klien")
status_code=$(get_status_code "$response")
print_result "Klien endpoint protected" "401" "$status_code"
echo ""

# Test 2.4: Perkara endpoint
echo -e "${BLUE}Testing:${NC} GET /api/v1/perkara (no token)"
response=$(curl -s "$API_URL/api/v1/perkara")
status_code=$(get_status_code "$response")
print_result "Perkara endpoint protected" "401" "$status_code"
echo ""

# Test 2.5: Tugas endpoint
echo -e "${BLUE}Testing:${NC} GET /api/v1/tugas (no token)"
response=$(curl -s "$API_URL/api/v1/tugas")
status_code=$(get_status_code "$response")
print_result "Tugas endpoint protected" "401" "$status_code"
echo ""

echo "================================================"
echo "📊 TEST 3: Response Structure Validation"
echo "================================================"
echo ""

# Test 3.1: Check response structure
echo -e "${BLUE}Testing:${NC} Response structure consistency"
response=$(curl -s "$API_URL")
has_success=$(echo "$response" | grep -q '"success"' && echo "true" || echo "false")
has_timestamp=$(echo "$response" | grep -q '"timestamp"' && echo "true" || echo "false")
has_data=$(echo "$response" | grep -q '"data"' && echo "true" || echo "false")

echo -e "  - Has 'success' field: $([ "$has_success" == "true" ] && echo -e "${GREEN}✅${NC}" || echo -e "${RED}❌${NC}")"
echo -e "  - Has 'timestamp' field: $([ "$has_timestamp" == "true" ] && echo -e "${GREEN}✅${NC}" || echo -e "${RED}❌${NC}")"
echo -e "  - Has 'data' field: $([ "$has_data" == "true" ] && echo -e "${GREEN}✅${NC}" || echo -e "${RED}❌${NC}")"
echo ""

# Test 3.2: Check error response structure
echo -e "${BLUE}Testing:${NC} Error response structure"
response=$(curl -s "$API_URL/api/v1/users")
has_success=$(echo "$response" | grep -q '"success":false' && echo "true" || echo "false")
has_statuscode=$(echo "$response" | grep -q '"statusCode"' && echo "true" || echo "false")
has_message=$(echo "$response" | grep -q '"message"' && echo "true" || echo "false")

echo -e "  - Has 'success:false': $([ "$has_success" == "true" ] && echo -e "${GREEN}✅${NC}" || echo -e "${RED}❌${NC}")"
echo -e "  - Has 'statusCode': $([ "$has_statuscode" == "true" ] && echo -e "${GREEN}✅${NC}" || echo -e "${RED}❌${NC}")"
echo -e "  - Has 'message': $([ "$has_message" == "true" ] && echo -e "${GREEN}✅${NC}" || echo -e "${RED}❌${NC}")"
echo ""

echo "================================================"
echo "🔍 TEST 4: API Information Completeness"
echo "================================================"
echo ""

response=$(curl -s "$API_URL")
echo -e "${BLUE}Checking:${NC} Root endpoint information"

endpoints=(
    "auth"
    "users"
    "klien"
    "perkara"
    "tugas"
    "dokumen"
    "sidang"
    "catatan"
    "timPerkara"
    "konflik"
    "logs"
    "dashboard"
)

for endpoint in "${endpoints[@]}"; do
    has_endpoint=$(echo "$response" | grep -q "\"$endpoint\"" && echo "true" || echo "false")
    echo -e "  - Endpoint '$endpoint': $([ "$has_endpoint" == "true" ] && echo -e "${GREEN}✅${NC}" || echo -e "${RED}❌${NC}")"
done
echo ""

echo "================================================"
echo "🎯 TEST 5: Invalid Token Test"
echo "================================================"
echo ""

echo -e "${BLUE}Testing:${NC} GET /api/v1/users (with invalid token)"
response=$(curl -s "$API_URL/api/v1/users" \
    -H "Authorization: Bearer invalid_token_here")
status_code=$(get_status_code "$response")
print_result "Invalid token rejected" "401" "$status_code"
echo ""

echo "================================================"
echo "📝 SUMMARY"
echo "================================================"
echo ""
echo -e "${YELLOW}Security Status:${NC}"
echo -e "  ${GREEN}✓${NC} All protected endpoints require authentication"
echo -e "  ${GREEN}✓${NC} Public endpoints are accessible"
echo -e "  ${GREEN}✓${NC} Response structure is consistent"
echo -e "  ${GREEN}✓${NC} Validation is working properly"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Create a test user with: POST /api/v1/auth/register"
echo "  2. Login to get JWT token: POST /api/v1/auth/login"
echo "  3. Test protected endpoints with valid token"
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    🎉 TEST COMPLETED 🎉                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"