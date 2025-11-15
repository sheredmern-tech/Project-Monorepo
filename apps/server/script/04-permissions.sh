#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

API_URL="http://localhost:3000"

# Use seeded users credentials
ADMIN_EMAIL="admin@perari.id"
ADMIN_PASSWORD="Admin123!"
ADMIN_TOKEN=""

STAFF_EMAIL="staff@perari.id"
STAFF_PASSWORD="Admin123!"
STAFF_TOKEN=""

ADVOKAT_EMAIL="advokat@perari.id"
ADVOKAT_PASSWORD="Admin123!"
ADVOKAT_TOKEN=""

PASSED=0
FAILED=0

# Generate unique identifiers for each test run
TIMESTAMP=$(date +%s)
RANDOM_ID=$RANDOM

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║       🔐 ROLE-BASED ACCESS CONTROL (RBAC) TEST 🔐             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${CYAN}Test Run ID: ${TIMESTAMP}-${RANDOM_ID}${NC}"
echo ""

# Helper functions
print_result() {
    local name=$1
    local expected=$2
    local actual=$3
    
    if [ "$expected" == "$actual" ]; then
        echo -e "${GREEN}✅ PASS${NC} - $name"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} - $name (Expected: $expected, Got: $actual)"
        ((FAILED++))
        return 1
    fi
}

get_status() { echo "$1" | tail -n1; }
get_body() { echo "$1" | head -n-1; }

echo "================================================"
echo "SETUP: Authenticate Users"
echo "================================================"
echo ""

# Authenticate Admin
echo -e "${BLUE}Authenticating Admin...${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
status=$(get_status "$response")
body=$(get_body "$response")

if [ "$status" == "200" ] || [ "$status" == "201" ]; then
    ADMIN_TOKEN=$(echo "$body" | jq -r '.data.access_token' 2>/dev/null)
    echo -e "${GREEN}✓ Admin authenticated${NC}"
else
    echo -e "${RED}✗ Failed to authenticate admin (status: $status)${NC}"
    echo -e "${YELLOW}Make sure you have run: npx prisma db seed${NC}"
    exit 1
fi

# Authenticate Staff
echo -e "${BLUE}Authenticating Staff...${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$STAFF_EMAIL\",\"password\":\"$STAFF_PASSWORD\"}")
status=$(get_status "$response")
body=$(get_body "$response")

if [ "$status" == "200" ] || [ "$status" == "201" ]; then
    STAFF_TOKEN=$(echo "$body" | jq -r '.data.access_token' 2>/dev/null)
    echo -e "${GREEN}✓ Staff authenticated${NC}"
else
    echo -e "${RED}✗ Failed to authenticate staff (status: $status)${NC}"
    exit 1
fi

# Authenticate Advokat
echo -e "${BLUE}Authenticating Advokat...${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADVOKAT_EMAIL\",\"password\":\"$ADVOKAT_PASSWORD\"}")
status=$(get_status "$response")
body=$(get_body "$response")

if [ "$status" == "200" ] || [ "$status" == "201" ]; then
    ADVOKAT_TOKEN=$(echo "$body" | jq -r '.data.access_token' 2>/dev/null)
    echo -e "${GREEN}✓ Advokat authenticated${NC}"
else
    echo -e "${RED}✗ Failed to authenticate advokat (status: $status)${NC}"
    exit 1
fi
echo ""

echo "================================================"
echo "TEST 1: User Management Permissions"
echo "================================================"
echo ""

echo -e "${BLUE}1.1${NC} Admin CAN create users"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/users" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\":\"newuser-${TIMESTAMP}@perari.id\",
        \"password\":\"NewUser123!\",
        \"nama_lengkap\":\"New User ${TIMESTAMP}\",
        \"role\":\"staff\"
    }")
status=$(get_status "$response")
print_result "Admin create user" "201" "$status"
echo ""

echo -e "${BLUE}1.2${NC} Staff CANNOT create users"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/users" \
    -H "Authorization: Bearer $STAFF_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\":\"forbidden-${TIMESTAMP}@perari.id\",
        \"password\":\"Test123!\",
        \"nama_lengkap\":\"Forbidden User\",
        \"role\":\"staff\"
    }")
status=$(get_status "$response")
print_result "Staff cannot create user" "403" "$status"
echo ""

echo -e "${BLUE}1.3${NC} Admin CAN list all users"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/users" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
status=$(get_status "$response")
print_result "Admin list users" "200" "$status"
echo ""

echo -e "${BLUE}1.4${NC} Staff CANNOT list all users"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/users" \
    -H "Authorization: Bearer $STAFF_TOKEN")
status=$(get_status "$response")
print_result "Staff cannot list users" "403" "$status"
echo ""

echo "================================================"
echo "TEST 2: Klien Management Permissions"
echo "================================================"
echo ""

echo -e "${BLUE}2.1${NC} Admin CAN create klien"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/klien" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"nama\": \"RBAC Test Client ${TIMESTAMP}\",
        \"jenis_klien\": \"perusahaan\",
        \"email\": \"rbac-${TIMESTAMP}@test.com\"
    }")
status=$(get_status "$response")
body=$(get_body "$response")
print_result "Admin create klien" "201" "$status"

KLIEN_ID=""
if [ "$status" == "201" ]; then
    KLIEN_ID=$(echo "$body" | jq -r '.data.id' 2>/dev/null)
fi
echo ""

echo -e "${BLUE}2.2${NC} Advokat CAN create klien"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/klien" \
    -H "Authorization: Bearer $ADVOKAT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"nama\": \"Advokat Client ${TIMESTAMP}\",
        \"jenis_klien\": \"perorangan\"
    }")
status=$(get_status "$response")
print_result "Advokat create klien" "201" "$status"
echo ""

echo -e "${BLUE}2.3${NC} Staff CAN view klien"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/klien" \
    -H "Authorization: Bearer $STAFF_TOKEN")
status=$(get_status "$response")
print_result "Staff view klien" "200" "$status"
echo ""

echo -e "${BLUE}2.4${NC} Admin CAN delete klien"
if [ -n "$KLIEN_ID" ]; then
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$API_URL/api/v1/klien/$KLIEN_ID" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    status=$(get_status "$response")
    print_result "Admin delete klien" "200" "$status"
else
    echo -e "${YELLOW}⚠ SKIP${NC} - No klien ID available"
fi
echo ""

echo "================================================"
echo "TEST 3: Perkara Management Permissions"
echo "================================================"
echo ""

# Create klien for perkara test
response=$(curl -s -X POST "$API_URL/api/v1/klien" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"nama\":\"Perkara Test Client ${TIMESTAMP}\"}")
KLIEN_ID=$(echo "$response" | jq -r '.data.id' 2>/dev/null)

echo -e "${BLUE}3.1${NC} Admin CAN create perkara"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/perkara" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"nomor_perkara\": \"RBAC/${TIMESTAMP}/001\",
        \"judul\": \"RBAC Test Case\",
        \"klien_id\": \"$KLIEN_ID\",
        \"jenis_perkara\": \"perdata\"
    }")
status=$(get_status "$response")
body=$(get_body "$response")
print_result "Admin create perkara" "201" "$status"

PERKARA_ID=""
if [ "$status" == "201" ]; then
    PERKARA_ID=$(echo "$body" | jq -r '.data.id' 2>/dev/null)
fi
echo ""

echo -e "${BLUE}3.2${NC} Advokat CAN create perkara"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/perkara" \
    -H "Authorization: Bearer $ADVOKAT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"nomor_perkara\": \"ADV/${TIMESTAMP}/001\",
        \"judul\": \"Advokat Case\",
        \"klien_id\": \"$KLIEN_ID\",
        \"jenis_perkara\": \"pidana\"
    }")
status=$(get_status "$response")
print_result "Advokat create perkara" "201" "$status"
echo ""

echo -e "${BLUE}3.3${NC} Staff CANNOT create perkara"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/perkara" \
    -H "Authorization: Bearer $STAFF_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"nomor_perkara\": \"STAFF/${TIMESTAMP}/001\",
        \"judul\": \"Staff Case\",
        \"klien_id\": \"$KLIEN_ID\",
        \"jenis_perkara\": \"perdata\"
    }")
status=$(get_status "$response")
print_result "Staff cannot create perkara" "403" "$status"
echo ""

echo -e "${BLUE}3.4${NC} Staff CAN view perkara"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/perkara" \
    -H "Authorization: Bearer $STAFF_TOKEN")
status=$(get_status "$response")
print_result "Staff view perkara" "200" "$status"
echo ""

echo -e "${BLUE}3.5${NC} Admin CAN delete perkara"
if [ -n "$PERKARA_ID" ]; then
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$API_URL/api/v1/perkara/$PERKARA_ID" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    status=$(get_status "$response")
    print_result "Admin delete perkara" "200" "$status"
else
    echo -e "${YELLOW}⚠ SKIP${NC} - No perkara ID available"
fi
echo ""

echo -e "${BLUE}3.6${NC} Staff CANNOT delete perkara"
response=$(curl -s -X POST "$API_URL/api/v1/perkara" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"nomor_perkara\": \"DEL/${TIMESTAMP}/001\",
        \"judul\": \"Delete Test\",
        \"klien_id\": \"$KLIEN_ID\",
        \"jenis_perkara\": \"perdata\"
    }")
TEST_PERKARA_ID=$(echo "$response" | jq -r '.data.id' 2>/dev/null)

if [ -n "$TEST_PERKARA_ID" ] && [ "$TEST_PERKARA_ID" != "null" ]; then
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$API_URL/api/v1/perkara/$TEST_PERKARA_ID" \
        -H "Authorization: Bearer $STAFF_TOKEN")
    status=$(get_status "$response")
    print_result "Staff cannot delete perkara" "403" "$status"
else
    echo -e "${YELLOW}⚠ SKIP${NC} - Could not create test perkara"
fi
echo ""

echo "================================================"
echo "TEST 4: Tugas Permissions"
echo "================================================"
echo ""

# Create perkara for tugas test
response=$(curl -s -X POST "$API_URL/api/v1/perkara" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"nomor_perkara\": \"TASK/${TIMESTAMP}/001\",
        \"judul\": \"Task Test Case\",
        \"klien_id\": \"$KLIEN_ID\",
        \"jenis_perkara\": \"perdata\"
    }")
TASK_PERKARA_ID=$(echo "$response" | jq -r '.data.id' 2>/dev/null)

echo -e "${BLUE}4.1${NC} Advokat CAN create tugas"
if [ -n "$TASK_PERKARA_ID" ] && [ "$TASK_PERKARA_ID" != "null" ]; then
    response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/tugas" \
        -H "Authorization: Bearer $ADVOKAT_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"perkara_id\": \"$TASK_PERKARA_ID\",
            \"judul\": \"Test Task ${TIMESTAMP}\",
            \"deskripsi\": \"Test task description\",
            \"prioritas\": \"tinggi\",
            \"status\": \"belum_mulai\"
        }")
    status=$(get_status "$response")
    body=$(get_body "$response")
    print_result "Advokat create tugas" "201" "$status"

    TUGAS_ID=""
    if [ "$status" == "201" ]; then
        TUGAS_ID=$(echo "$body" | jq -r '.data.id' 2>/dev/null)
    fi
else
    echo -e "${YELLOW}⚠ SKIP${NC} - No perkara ID for tugas test"
fi
echo ""

echo -e "${BLUE}4.2${NC} Staff CAN view tugas"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/tugas" \
    -H "Authorization: Bearer $STAFF_TOKEN")
status=$(get_status "$response")
print_result "Staff view tugas" "200" "$status"
echo ""

echo -e "${BLUE}4.3${NC} Staff CAN update tugas"
if [ -n "$TUGAS_ID" ] && [ "$TUGAS_ID" != "null" ]; then
    response=$(curl -s -w "\n%{http_code}" -X PATCH "$API_URL/api/v1/tugas/$TUGAS_ID" \
        -H "Authorization: Bearer $STAFF_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"status": "sedang_berjalan"}')
    status=$(get_status "$response")
    print_result "Staff update tugas" "200" "$status"
else
    echo -e "${YELLOW}⚠ SKIP${NC} - No tugas ID available (dependent on 4.1)"
fi
echo ""

echo -e "${BLUE}4.4${NC} Advokat CAN delete tugas"
if [ -n "$TUGAS_ID" ] && [ "$TUGAS_ID" != "null" ]; then
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$API_URL/api/v1/tugas/$TUGAS_ID" \
        -H "Authorization: Bearer $ADVOKAT_TOKEN")
    status=$(get_status "$response")
    print_result "Advokat delete tugas" "200" "$status"
else
    echo -e "${YELLOW}⚠ SKIP${NC} - No tugas ID available"
fi
echo ""

echo "================================================"
echo "TEST 5: Logs & Dashboard Permissions"
echo "================================================"
echo ""

echo -e "${BLUE}5.1${NC} Admin CAN view all logs"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/logs" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
status=$(get_status "$response")
print_result "Admin view all logs" "200" "$status"
echo ""

echo -e "${BLUE}5.2${NC} Staff CANNOT view all logs"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/logs" \
    -H "Authorization: Bearer $STAFF_TOKEN")
status=$(get_status "$response")
print_result "Staff cannot view all logs" "403" "$status"
echo ""

echo -e "${BLUE}5.3${NC} Staff CAN view own activities"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/logs/my-activities" \
    -H "Authorization: Bearer $STAFF_TOKEN")
status=$(get_status "$response")
print_result "Staff view own activities" "200" "$status"
echo ""

echo -e "${BLUE}5.4${NC} All roles CAN view dashboard stats"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/dashboard/stats" \
    -H "Authorization: Bearer $STAFF_TOKEN")
status=$(get_status "$response")
print_result "Staff view dashboard" "200" "$status"
echo ""

echo "================================================"
echo "TEST 6: Konflik Permissions (Admin/Advokat only)"
echo "================================================"
echo ""

echo -e "${BLUE}6.1${NC} Admin CAN create konflik check"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/konflik" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"nama_klien\": \"Test Client ${TIMESTAMP}\",
        \"pihak_lawan\": \"Test Opponent ${TIMESTAMP}\",
        \"ada_konflik\": false
    }")
status=$(get_status "$response")
body=$(get_body "$response")
print_result "Admin create konflik" "201" "$status"

KONFLIK_ID=""
if [ "$status" == "201" ]; then
    KONFLIK_ID=$(echo "$body" | jq -r '.data.id' 2>/dev/null)
fi
echo ""

echo -e "${BLUE}6.2${NC} Advokat CAN view konflik"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/konflik" \
    -H "Authorization: Bearer $ADVOKAT_TOKEN")
status=$(get_status "$response")
print_result "Advokat view konflik" "200" "$status"
echo ""

echo -e "${BLUE}6.3${NC} Staff CANNOT view konflik"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/konflik" \
    -H "Authorization: Bearer $STAFF_TOKEN")
status=$(get_status "$response")
print_result "Staff cannot view konflik" "403" "$status"
echo ""

echo "================================================"
echo "TEST 7: Cross-Role Verification"
echo "================================================"
echo ""

echo -e "${BLUE}7.1${NC} User can access own profile"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/auth/profile" \
    -H "Authorization: Bearer $STAFF_TOKEN")
status=$(get_status "$response")
print_result "User access own profile" "200" "$status"
echo ""

echo -e "${BLUE}7.2${NC} User can change own password"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/auth/change-password" \
    -H "Authorization: Bearer $STAFF_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"old_password\": \"Admin123!\",
        \"new_password\": \"NewStaff${TIMESTAMP}!\"
    }")
status=$(get_status "$response")

if [ "$status" == "200" ] || [ "$status" == "201" ]; then
    echo -e "${GREEN}✅ PASS${NC} - User change own password"
    ((PASSED++))
    
    # Revert password back
    curl -s -X POST "$API_URL/api/v1/auth/change-password" \
        -H "Authorization: Bearer $STAFF_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"old_password\": \"NewStaff${TIMESTAMP}!\",
            \"new_password\": \"Admin123!\"
        }" > /dev/null 2>&1
else
    echo -e "${RED}❌ FAIL${NC} - User change own password (Expected: 200 or 201, Got: $status)"
    ((FAILED++))
fi
echo ""

echo -e "${BLUE}7.3${NC} All roles can refresh token"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/auth/refresh" \
    -H "Authorization: Bearer $ADVOKAT_TOKEN")
status=$(get_status "$response")

if [ "$status" == "200" ] || [ "$status" == "201" ]; then
    echo -e "${GREEN}✅ PASS${NC} - All roles refresh token"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} - All roles refresh token (Expected: 200 or 201, Got: $status)"
    ((FAILED++))
fi
echo ""

echo "================================================"
echo "📊 TEST SUMMARY"
echo "================================================"
TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

echo ""
echo -e "Total Tests: ${CYAN}$TOTAL${NC}"
echo -e "Passed:      ${GREEN}$PASSED${NC}"
echo -e "Failed:      ${RED}$FAILED${NC}"
echo -e "Success Rate: ${CYAN}${PERCENTAGE}%${NC}"
echo ""

echo "================================================"
echo "RBAC Summary"
echo "================================================"
echo ""
echo -e "${CYAN}Role Capabilities:${NC}"
echo ""
echo -e "${GREEN}ADMIN:${NC}"
echo "  ✓ Full access to all resources"
echo "  ✓ User management"
echo "  ✓ View all logs"
echo "  ✓ Delete all resources"
echo ""
echo -e "${BLUE}ADVOKAT:${NC}"
echo "  ✓ Create/Edit klien, perkara, tugas"
echo "  ✓ View konflik"
echo "  ✓ Delete own resources"
echo "  ✗ Cannot manage users"
echo ""
echo -e "${YELLOW}STAFF:${NC}"
echo "  ✓ View all resources"
echo "  ✓ Update assigned tugas"
echo "  ✓ View own activities"
echo "  ✗ Cannot create perkara"
echo "  ✗ Cannot delete resources"
echo "  ✗ Cannot view konflik"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║        🎉 ALL RBAC TESTS PASSED! 🎉                           ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║    ⚠️  SOME RBAC TESTS FAILED - REVIEW REQUIRED ⚠️            ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi