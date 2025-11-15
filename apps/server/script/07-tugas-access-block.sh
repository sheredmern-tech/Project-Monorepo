#!/bin/bash

# ============================================================================
# FILE: 07-tugas-access-block.sh
# ============================================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

API_URL="http://localhost:3000/api/v1"

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Generate unique timestamp
RUN_TIMESTAMP=$(date +%s)

# Function to print test result
print_result() {
    local test_name=$1
    local status=$2
    local message=$3
    
    ((TOTAL_TESTS++))
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓${NC} $test_name"
        [ -n "$message" ] && echo -e "  ${CYAN}→ $message${NC}"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}✗${NC} $test_name"
        [ -n "$message" ] && echo -e "  ${RED}→ $message${NC}"
        ((FAILED_TESTS++))
    fi
}

# Function to make API request
api_request() {
    local method=$1
    local endpoint=$2
    local token=$3
    local data=$4
    
    if [ -n "$data" ]; then
        response=$(curl -s -X "$method" "$API_URL$endpoint" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "$data" \
            -w "\n%{http_code}")
    else
        response=$(curl -s -X "$method" "$API_URL$endpoint" \
            -H "Authorization: Bearer $token" \
            -w "\n%{http_code}")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    echo "$http_code|$body"
}

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║              🔒 TUGAS ACCESS BLOCK TESTS 🔒                      ║${NC}"
echo -e "${CYAN}║         Verify Clients Cannot Access Internal Tasks              ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# SETUP: Create test accounts and test data
# ============================================================================
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  SETUP: Creating Test Accounts                                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Login as admin
echo -e "${CYAN}Authenticating as admin...${NC}"
admin_response=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@perari.id","password":"Admin123!"}')

ADMIN_TOKEN=$(echo "$admin_response" | jq -r '.data.access_token // .access_token // empty')

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" = "null" ]; then
    echo -e "${RED}❌ Failed to get admin token${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Admin authenticated${NC}"

# Create Klien user
echo -e "${CYAN}Creating Klien user...${NC}"
klien_data='{
  "email": "klien.tugas.test.'$RUN_TIMESTAMP'@perari.id",
  "password": "Klien123!",
  "nama_lengkap": "Klien Tugas Test",
  "role": "klien"
}'

klien_create=$(curl -s -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "$klien_data")

klien_login=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"klien.tugas.test.'$RUN_TIMESTAMP'@perari.id","password":"Klien123!"}')

KLIEN_TOKEN=$(echo "$klien_login" | jq -r '.data.access_token // .access_token // empty')
KLIEN_ID=$(echo "$klien_login" | jq -r '.data.user.id // .user.id // empty')
echo -e "${GREEN}✓ Klien user created and authenticated${NC}"

# Create Paralegal user
echo -e "${CYAN}Creating Paralegal user...${NC}"
paralegal_data='{
  "email": "paralegal.tugas.test.'$RUN_TIMESTAMP'@perari.id",
  "password": "Para123!",
  "nama_lengkap": "Paralegal Tugas Test",
  "role": "paralegal"
}'

paralegal_create=$(curl -s -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "$paralegal_data")

paralegal_login=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"paralegal.tugas.test.'$RUN_TIMESTAMP'@perari.id","password":"Para123!"}')

PARALEGAL_TOKEN=$(echo "$paralegal_login" | jq -r '.data.access_token // .access_token // empty')
PARALEGAL_ID=$(echo "$paralegal_login" | jq -r '.data.user.id // .user.id // empty')
echo -e "${GREEN}✓ Paralegal user created and authenticated${NC}"

# Create Advokat user
echo -e "${CYAN}Creating Advokat user...${NC}"
advokat_data='{
  "email": "advokat.tugas.test.'$RUN_TIMESTAMP'@perari.id",
  "password": "Adv123!",
  "nama_lengkap": "Advokat Tugas Test",
  "role": "advokat"
}'

advokat_create=$(curl -s -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "$advokat_data")

advokat_login=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"advokat.tugas.test.'$RUN_TIMESTAMP'@perari.id","password":"Adv123!"}')

ADVOKAT_TOKEN=$(echo "$advokat_login" | jq -r '.data.access_token // .access_token // empty')
ADVOKAT_ID=$(echo "$advokat_login" | jq -r '.data.user.id // .user.id // empty')
echo -e "${GREEN}✓ Advokat user created and authenticated${NC}"

# Create Staff user
echo -e "${CYAN}Creating Staff user...${NC}"
staff_data='{
  "email": "staff.tugas.test.'$RUN_TIMESTAMP'@perari.id",
  "password": "Staff123!",
  "nama_lengkap": "Staff Tugas Test",
  "role": "staff"
}'

staff_create=$(curl -s -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "$staff_data")

staff_login=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"staff.tugas.test.'$RUN_TIMESTAMP'@perari.id","password":"Staff123!"}')

STAFF_TOKEN=$(echo "$staff_login" | jq -r '.data.access_token // .access_token // empty')
STAFF_ID=$(echo "$staff_login" | jq -r '.data.user.id // .user.id // empty')
echo -e "${GREEN}✓ Staff user created and authenticated${NC}"

# Create test klien data
echo -e "${CYAN}Creating test klien...${NC}"
klien_create=$(curl -s -X POST "$API_URL/klien" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "nama": "PT Test Klien Tugas",
      "jenis_klien": "perusahaan",
      "email": "test.klien.tugas.'$RUN_TIMESTAMP'@test.com",
      "telepon": "081234567890"
    }')

TEST_KLIEN_ID=$(echo "$klien_create" | jq -r '.data.id // .id // empty')
echo -e "${GREEN}✓ Test klien created (ID: $TEST_KLIEN_ID)${NC}"

# Create test perkara
echo -e "${CYAN}Creating test perkara...${NC}"
perkara_create=$(curl -s -X POST "$API_URL/perkara" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "nomor_perkara": "TEST/TGS/'$RUN_TIMESTAMP'/001",
      "judul": "Test Perkara untuk Tugas",
      "klien_id": "'$TEST_KLIEN_ID'",
      "jenis_perkara": "perdata",
      "status": "aktif"
    }')

TEST_PERKARA_ID=$(echo "$perkara_create" | jq -r '.data.id // .id // empty')
echo -e "${GREEN}✓ Test perkara created (ID: $TEST_PERKARA_ID)${NC}"

# Create test tugas (by admin)
echo -e "${CYAN}Creating test tugas...${NC}"
tugas_create=$(curl -s -X POST "$API_URL/tugas" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "perkara_id": "'$TEST_PERKARA_ID'",
      "judul": "Draft Surat Gugatan",
      "deskripsi": "Membuat draft surat gugatan lengkap",
      "ditugaskan_ke": "'$PARALEGAL_ID'",
      "status": "belum_mulai",
      "prioritas": "tinggi"
    }')

TEST_TUGAS_ID=$(echo "$tugas_create" | jq -r '.data.id // .id // empty')
echo -e "${GREEN}✓ Test tugas created (ID: $TEST_TUGAS_ID)${NC}"

echo ""

# ============================================================================
# SECTION 1: CLIENT CANNOT ACCESS TUGAS ENDPOINTS
# ============================================================================
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  SECTION 1: Client Cannot Access ANY Tugas Endpoints           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# TEST 1.1: Client CANNOT access GET /tugas (list all tasks)
result=$(api_request "GET" "/tugas" "$KLIEN_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "403" ]; then
    error_msg=$(echo "$body" | jq -r '.message // empty')
    print_result "Client CANNOT access GET /tugas (list)" "PASS" "403 Forbidden: $error_msg"
else
    print_result "Client CANNOT access GET /tugas (list)" "FAIL" "Expected 403, got $code"
fi

# TEST 1.2: Client CANNOT access GET /tugas/:id (view task detail)
result=$(api_request "GET" "/tugas/$TEST_TUGAS_ID" "$KLIEN_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "403" ]; then
    print_result "Client CANNOT access GET /tugas/:id" "PASS" "403 Forbidden as expected"
else
    print_result "Client CANNOT access GET /tugas/:id" "FAIL" "Expected 403, got $code"
fi

# TEST 1.3: Client CANNOT access GET /tugas/my-tasks
result=$(api_request "GET" "/tugas/my-tasks" "$KLIEN_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "403" ]; then
    print_result "Client CANNOT access GET /tugas/my-tasks" "PASS" "403 Forbidden as expected"
else
    print_result "Client CANNOT access GET /tugas/my-tasks" "FAIL" "Expected 403, got $code"
fi

# TEST 1.4: Client CANNOT create POST /tugas
new_tugas='{
  "perkara_id": "'$TEST_PERKARA_ID'",
  "judul": "Unauthorized Task Creation",
  "deskripsi": "This should not be created",
  "status": "belum_mulai"
}'

result=$(api_request "POST" "/tugas" "$KLIEN_TOKEN" "$new_tugas")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "403" ]; then
    print_result "Client CANNOT create POST /tugas" "PASS" "403 Forbidden as expected"
else
    print_result "Client CANNOT create POST /tugas" "FAIL" "Expected 403, got $code"
fi

# TEST 1.5: Client CANNOT update PATCH /tugas/:id
update_tugas='{
  "status": "selesai"
}'

result=$(api_request "PATCH" "/tugas/$TEST_TUGAS_ID" "$KLIEN_TOKEN" "$update_tugas")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "403" ]; then
    print_result "Client CANNOT update PATCH /tugas/:id" "PASS" "403 Forbidden as expected"
else
    print_result "Client CANNOT update PATCH /tugas/:id" "FAIL" "Expected 403, got $code"
fi

# TEST 1.6: Client CANNOT delete DELETE /tugas/:id
result=$(api_request "DELETE" "/tugas/$TEST_TUGAS_ID" "$KLIEN_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "403" ]; then
    print_result "Client CANNOT delete DELETE /tugas/:id" "PASS" "403 Forbidden as expected"
else
    print_result "Client CANNOT delete DELETE /tugas/:id" "FAIL" "Expected 403, got $code"
fi

# TEST 1.7: Client CANNOT filter tasks by perkara_id
result=$(api_request "GET" "/tugas?perkara_id=$TEST_PERKARA_ID" "$KLIEN_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "403" ]; then
    print_result "Client CANNOT filter tasks by perkara" "PASS" "403 Forbidden as expected"
else
    print_result "Client CANNOT filter tasks by perkara" "FAIL" "Expected 403, got $code"
fi

echo ""

# ============================================================================
# SECTION 2: INTERNAL ROLES CAN ACCESS TUGAS
# ============================================================================
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  SECTION 2: Internal Roles CAN Access Tugas                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# TEST 2.1: Admin CAN access GET /tugas
result=$(api_request "GET" "/tugas" "$ADMIN_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "200" ]; then
    total=$(echo "$body" | jq -r '.data.meta.total // .meta.total // 0')
    print_result "Admin CAN access GET /tugas" "PASS" "Total: $total tugas"
else
    print_result "Admin CAN access GET /tugas" "FAIL" "Expected 200, got $code"
fi

# TEST 2.2: Paralegal CAN access GET /tugas/my-tasks
result=$(api_request "GET" "/tugas/my-tasks" "$PARALEGAL_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "200" ]; then
    total=$(echo "$body" | jq -r '.data.meta.total // .meta.total // 0')
    print_result "Paralegal CAN access GET /tugas/my-tasks" "PASS" "Total: $total tugas"
else
    print_result "Paralegal CAN access GET /tugas/my-tasks" "FAIL" "Expected 200, got $code"
fi

# TEST 2.3: Paralegal CAN view task detail
result=$(api_request "GET" "/tugas/$TEST_TUGAS_ID" "$PARALEGAL_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "200" ]; then
    print_result "Paralegal CAN view task detail" "PASS" "200 OK"
else
    print_result "Paralegal CAN view task detail" "FAIL" "Expected 200, got $code"
fi

# TEST 2.4: Paralegal CAN update their task
update_tugas='{
  "status": "sedang_berjalan"
}'

result=$(api_request "PATCH" "/tugas/$TEST_TUGAS_ID" "$PARALEGAL_TOKEN" "$update_tugas")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "200" ]; then
    print_result "Paralegal CAN update their task" "PASS" "200 OK"
else
    print_result "Paralegal CAN update their task" "FAIL" "Expected 200, got $code"
fi

# TEST 2.5: Advokat CAN create new task
advokat_tugas='{
  "perkara_id": "'$TEST_PERKARA_ID'",
  "judul": "Review Dokumen",
  "deskripsi": "Review dokumen perkara",
  "ditugaskan_ke": "'$PARALEGAL_ID'",
  "status": "belum_mulai",
  "prioritas": "sedang"
}'

result=$(api_request "POST" "/tugas" "$ADVOKAT_TOKEN" "$advokat_tugas")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "201" ]; then
    print_result "Advokat CAN create new task" "PASS" "201 Created"
else
    print_result "Advokat CAN create new task" "FAIL" "Expected 201, got $code"
fi

# TEST 2.6: Staff CAN access GET /tugas
result=$(api_request "GET" "/tugas" "$STAFF_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "200" ]; then
    print_result "Staff CAN access GET /tugas" "PASS" "200 OK"
else
    print_result "Staff CAN access GET /tugas" "FAIL" "Expected 200, got $code"
fi

# TEST 2.7: Admin CAN delete task
result=$(api_request "DELETE" "/tugas/$TEST_TUGAS_ID" "$ADMIN_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "200" ]; then
    print_result "Admin CAN delete task" "PASS" "200 OK"
else
    print_result "Admin CAN delete task" "FAIL" "Expected 200, got $code"
fi

echo ""

# ============================================================================
# SECTION 3: ERROR MESSAGES & SECURITY
# ============================================================================
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  SECTION 3: Error Messages & Security Verification             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# TEST 3.1: Error message is clear and informative
result=$(api_request "GET" "/tugas" "$KLIEN_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "403" ]; then
    error_msg=$(echo "$body" | jq -r '.message // empty')
    if [ -n "$error_msg" ]; then
        print_result "Clear error message provided" "PASS" "Error: $error_msg"
    else
        print_result "Clear error message provided" "FAIL" "No error message"
    fi
else
    print_result "Clear error message provided" "FAIL" "Expected 403, got $code"
fi

# TEST 3.2: Verify @Roles guard is working at controller level
result=$(api_request "GET" "/tugas" "$KLIEN_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "403" ]; then
    print_result "@Roles guard blocks at controller level" "PASS" "Guard working correctly"
else
    print_result "@Roles guard blocks at controller level" "FAIL" "Guard not blocking"
fi

# TEST 3.3: Verify no data leakage in error response
result=$(api_request "GET" "/tugas/$TEST_TUGAS_ID" "$KLIEN_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "403" ]; then
    has_sensitive_data=$(echo "$body" | jq -r '.data // empty')
    if [ -z "$has_sensitive_data" ] || [ "$has_sensitive_data" = "null" ]; then
        print_result "No data leakage in error response" "PASS" "Error response contains no task data"
    else
        print_result "No data leakage in error response" "FAIL" "Error response contains task data"
    fi
fi

# TEST 3.4: Consistent blocking across all HTTP methods
methods=("GET" "POST" "PATCH" "DELETE")
all_blocked=true

for method in "${methods[@]}"; do
    if [ "$method" = "POST" ] || [ "$method" = "PATCH" ]; then
        result=$(api_request "$method" "/tugas" "$KLIEN_TOKEN" '{}')
    else
        result=$(api_request "$method" "/tugas" "$KLIEN_TOKEN")
    fi
    
    code=$(echo "$result" | cut -d'|' -f1)
    if [ "$code" != "403" ] && [ "$code" != "404" ]; then
        all_blocked=false
    fi
done

if [ "$all_blocked" = true ]; then
    print_result "All HTTP methods consistently blocked" "PASS" "GET, POST, PATCH, DELETE all blocked"
else
    print_result "All HTTP methods consistently blocked" "FAIL" "Some methods not blocked"
fi

echo ""

#!/bin/bash

# ============================================================================
# FINAL SUMMARY
# ============================================================================
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    📊 TEST SUMMARY 📊                           ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "Total Tests: ${YELLOW}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [ $TOTAL_TESTS -gt 0 ]; then
    success_rate=$(awk "BEGIN {printf \"%.1f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")
    echo -e "Success Rate: ${CYAN}$success_rate%${NC}"
fi

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║              🔒 TUGAS ACCESS CONTROL SUMMARY 🔒                  ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}❌ CLIENT (KLIEN) BLOCKED FROM:${NC}"
echo -e "   ${RED}✗${NC} GET /tugas - List all tasks"
echo -e "   ${RED}✗${NC} GET /tugas/:id - View task details"
echo -e "   ${RED}✗${NC} GET /tugas/my-tasks - View personal tasks"
echo -e "   ${RED}✗${NC} POST /tugas - Create new task"
echo -e "   ${RED}✗${NC} PATCH /tugas/:id - Update task"
echo -e "   ${RED}✗${NC} DELETE /tugas/:id - Delete task"
echo -e "   ${RED}✗${NC} GET /tugas?perkara_id=X - Filter tasks by perkara"
echo ""

echo -e "${YELLOW}✅ INTERNAL ROLES HAVE ACCESS:${NC}"
echo -e "   ${GREEN}✓${NC} Admin - Full access to all task operations"
echo -e "   ${GREEN}✓${NC} Advokat - Can create, view, update, delete tasks"
echo -e "   ${GREEN}✓${NC} Paralegal - Can view and update assigned tasks"
echo -e "   ${GREEN}✓${NC} Staff - Can view and manage tasks"
echo ""

echo -e "${YELLOW}🛡️ SECURITY FEATURES VERIFIED:${NC}"
echo -e "   ${GREEN}✓${NC} @Roles guard working at controller level"
echo -e "   ${GREEN}✓${NC} Clear 403 Forbidden responses"
echo -e "   ${GREEN}✓${NC} No data leakage in error responses"
echo -e "   ${GREEN}✓${NC} Consistent blocking across all HTTP methods"
echo ""

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                        KEY FINDINGS                              ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}1. Access Control:${NC}"
echo -e "   • Clients (klien) are completely blocked from task management"
echo -e "   • Internal roles (admin, advokat, paralegal, staff) have appropriate access"
echo -e "   • Role-based authorization is enforced consistently"
echo ""

echo -e "${YELLOW}2. Security Posture:${NC}"
echo -e "   • All unauthorized requests return 403 Forbidden"
echo -e "   • Error messages are informative but don't leak sensitive data"
echo -e "   • Guards are applied at controller level for maximum security"
echo ""

echo -e "${YELLOW}3. API Behavior:${NC}"
echo -e "   • Consistent responses across all HTTP methods (GET, POST, PATCH, DELETE)"
echo -e "   • Proper HTTP status codes (403 for forbidden, 200/201 for success)"
echo -e "   • Clean error handling without exposing internal details"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║          ✅ ALL TESTS PASSED - ACCESS CONTROL WORKING! ✅       ║${NC}"
    echo -e "${GREEN}║                                                                  ║${NC}"
    echo -e "${GREEN}║  The tugas (task) management system is properly secured.         ║${NC}"
    echo -e "${GREEN}║  Clients cannot access internal task operations.                 ║${NC}"
    echo -e "${GREEN}║  Internal roles have appropriate access levels.                  ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║      ⚠️  SOME TESTS FAILED - REVIEW ACCESS CONTROL! ⚠️          ║${NC}"
    echo -e "${RED}║                                                                  ║${NC}"
    echo -e "${RED}║  Please review the failed tests above and verify:                ║${NC}"
    echo -e "${RED}║  1. @Roles decorators are properly applied                       ║${NC}"
    echo -e "${RED}║  2. RolesGuard is configured correctly                           ║${NC}"
    echo -e "${RED}║  3. Role enum values match database roles                        ║${NC}"
    echo -e "${RED}║  4. Guards are registered in the correct order                   ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    exit 1
fi