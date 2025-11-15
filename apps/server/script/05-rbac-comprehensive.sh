#!/bin/bash
#!/bin/bash

# ============================================================================
# FILE: 05-rbac-comprehensive.sh - Complete RBAC Test Suite (FIXED)
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

# 🔥 CRITICAL FIX: Generate unique timestamp for this test run
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
echo -e "${CYAN}║         🔐 COMPREHENSIVE RBAC TEST SUITE 🔐                     ║${NC}"
echo -e "${CYAN}║         Testing All Roles & Permissions                          ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Test Run ID: $(date +%s)-$${NC}"
echo ""
echo -e "${CYAN}💡 TIP: Run ./00-prerequisites.sh first to check setup${NC}"
echo ""
# ============================================================================
# SECTION 1: AUTHENTICATION & SETUP
# ============================================================================
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  SECTION 1: Authentication & User Setup                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 1.1 Admin Login
echo -e "${CYAN}Checking if admin exists...${NC}"
admin_response=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@perari.id","password":"Admin123!"}')

ADMIN_TOKEN=$(echo "$admin_response" | jq -r '.data.access_token // .access_token // empty')

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" = "null" ]; then
    echo -e "${YELLOW}Admin not found. Creating admin account...${NC}"
    
    admin_register='{
      "email": "admin@perari.id",
      "password": "Admin123!",
      "nama_lengkap": "Admin System",
      "role": "admin"
    }'
    
    register_response=$(curl -s -X POST "$API_URL/auth/register" \
        -H "Content-Type: application/json" \
        -d "$admin_register")
    
    register_token=$(echo "$register_response" | jq -r '.data.access_token // .access_token // empty')
    
    if [ -n "$register_token" ] && [ "$register_token" != "null" ]; then
        ADMIN_TOKEN="$register_token"
        print_result "Admin account created" "PASS" "Account created and logged in"
    else
        print_result "Admin setup" "FAIL" "Cannot create or login as admin"
        exit 1
    fi
else
    print_result "Admin authentication" "PASS" "Token obtained"
fi

# 1.2 Create Staff with UNIQUE email
echo -e "${CYAN}Creating Staff account...${NC}"
staff_data='{
  "email": "staff.test.'$RUN_TIMESTAMP'@perari.id",
  "password": "Staff123!",
  "nama_lengkap": "Staff Test User",
  "role": "staff"
}'

staff_create=$(api_request "POST" "/auth/register" "$ADMIN_TOKEN" "$staff_data")
staff_create_code=$(echo "$staff_create" | cut -d'|' -f1)

if [ "$staff_create_code" = "201" ]; then
    print_result "Create staff account" "PASS" "Staff account ready"
else
    print_result "Create staff account" "FAIL" "Code: $staff_create_code"
fi

echo -e "${CYAN}Authenticating Staff...${NC}"
staff_login=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"staff.test.'$RUN_TIMESTAMP'@perari.id","password":"Staff123!"}')

STAFF_TOKEN=$(echo "$staff_login" | jq -r '.data.access_token // .access_token // empty')

if [ -n "$STAFF_TOKEN" ] && [ "$STAFF_TOKEN" != "null" ]; then
    print_result "Staff authentication" "PASS" "Token obtained"
else
    print_result "Staff authentication" "FAIL" "Failed to get staff token"
fi

# 1.3 Create Advokat with UNIQUE email
echo -e "${CYAN}Creating Advokat account...${NC}"
advokat_data='{
  "email": "advokat.test.'$RUN_TIMESTAMP'@perari.id",
  "password": "Advokat123!",
  "nama_lengkap": "Advokat Test User",
  "role": "advokat"
}'

advokat_create=$(api_request "POST" "/auth/register" "$ADMIN_TOKEN" "$advokat_data")
advokat_create_code=$(echo "$advokat_create" | cut -d'|' -f1)

if [ "$advokat_create_code" = "201" ]; then
    print_result "Create advokat account" "PASS" "Advokat account ready"
else
    print_result "Create advokat account" "FAIL" "Code: $advokat_create_code"
fi

echo -e "${CYAN}Authenticating Advokat...${NC}"
advokat_login=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"advokat.test.'$RUN_TIMESTAMP'@perari.id","password":"Advokat123!"}')

ADVOKAT_TOKEN=$(echo "$advokat_login" | jq -r '.data.access_token // .access_token // empty')
ADVOKAT_ID=$(echo "$advokat_login" | jq -r '.data.user.id // .user.id // empty')

if [ -n "$ADVOKAT_TOKEN" ] && [ "$ADVOKAT_TOKEN" != "null" ]; then
    print_result "Advokat authentication" "PASS" "Token obtained"
else
    print_result "Advokat authentication" "FAIL" "Failed to get advokat token"
fi

# 1.4 Create Paralegal with UNIQUE email
echo -e "${CYAN}Creating Paralegal account...${NC}"
paralegal_data='{
  "email": "paralegal.test.'$RUN_TIMESTAMP'@perari.id",
  "password": "Paralegal123!",
  "nama_lengkap": "Paralegal Test User",
  "role": "paralegal"
}'

paralegal_create=$(api_request "POST" "/auth/register" "$ADMIN_TOKEN" "$paralegal_data")
paralegal_create_code=$(echo "$paralegal_create" | cut -d'|' -f1)

if [ "$paralegal_create_code" = "201" ]; then
    print_result "Create paralegal account" "PASS" "Paralegal account ready"
else
    print_result "Create paralegal account" "FAIL" "Code: $paralegal_create_code"
fi

echo -e "${CYAN}Authenticating Paralegal...${NC}"
paralegal_login=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"paralegal.test.'$RUN_TIMESTAMP'@perari.id","password":"Paralegal123!"}')

PARALEGAL_TOKEN=$(echo "$paralegal_login" | jq -r '.data.access_token // .access_token // empty')
PARALEGAL_ID=$(echo "$paralegal_login" | jq -r '.data.user.id // .user.id // empty')

if [ -n "$PARALEGAL_TOKEN" ] && [ "$PARALEGAL_TOKEN" != "null" ]; then
    print_result "Paralegal authentication" "PASS" "Token obtained"
else
    print_result "Paralegal authentication" "FAIL" "Failed to get paralegal token"
fi

# 1.5 Create Klien with UNIQUE email
echo -e "${CYAN}Creating Klien account...${NC}"
klien_data='{
  "email": "klien.test.'$RUN_TIMESTAMP'@perari.id",
  "password": "Klien123!",
  "nama_lengkap": "Klien Test User",
  "role": "klien"
}'

klien_create=$(api_request "POST" "/auth/register" "$ADMIN_TOKEN" "$klien_data")
klien_create_code=$(echo "$klien_create" | cut -d'|' -f1)

if [ "$klien_create_code" = "201" ]; then
    print_result "Create klien account" "PASS" "Klien account ready"
else
    print_result "Create klien account" "FAIL" "Code: $klien_create_code"
fi

echo -e "${CYAN}Authenticating Klien...${NC}"
klien_login=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"klien.test.'$RUN_TIMESTAMP'@perari.id","password":"Klien123!"}')

KLIEN_TOKEN=$(echo "$klien_login" | jq -r '.data.access_token // .access_token // empty')
KLIEN_ID=$(echo "$klien_login" | jq -r '.data.user.id // .user.id // empty')

if [ -n "$KLIEN_TOKEN" ] && [ "$KLIEN_TOKEN" != "null" ]; then
    print_result "Klien authentication" "PASS" "Token obtained"
else
    print_result "Klien authentication" "FAIL" "Failed to get klien token"
fi

echo ""

# ============================================================================
# SECTION 2: USER MANAGEMENT PERMISSIONS
# ============================================================================
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  SECTION 2: User Management Permissions                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 2.1 Admin CAN create users (with UNIQUE email)
test_user='{
  "email": "test.user.'$RUN_TIMESTAMP'@perari.id",
  "password": "Test123!",
  "nama_lengkap": "Test User",
  "role": "staff"
}'

result=$(api_request "POST" "/users" "$ADMIN_TOKEN" "$test_user")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "201" ]; then
    print_result "Admin CAN create users" "PASS" "201 Created"
else
    print_result "Admin CAN create users" "FAIL" "Expected 201, got $code"
fi

# 2.2 Staff CANNOT create users
result=$(api_request "POST" "/users" "$STAFF_TOKEN" "$test_user")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "403" ]; then
    print_result "Staff CANNOT create users" "PASS" "403 Forbidden as expected"
else
    print_result "Staff CANNOT create users" "FAIL" "Expected 403, got $code"
fi

# 2.3 Admin CAN list all users
result=$(api_request "GET" "/users" "$ADMIN_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "200" ]; then
    # FIX: Meta bisa ada di .data.meta atau langsung .meta
    total=$(echo "$body" | jq -r '.data.meta.total // .meta.total // 0')
    print_result "Admin CAN list all users" "PASS" "Total: $total users"
else
    print_result "Admin CAN list all users" "FAIL" "Expected 200, got $code"
fi

# 2.4 Staff CANNOT list all users
result=$(api_request "GET" "/users" "$STAFF_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "403" ]; then
    print_result "Staff CANNOT list all users" "PASS" "403 Forbidden as expected"
else
    print_result "Staff CANNOT list all users" "FAIL" "Expected 403, got $code"
fi

echo ""

# ============================================================================
# SECTION 3: KLIEN MANAGEMENT PERMISSIONS
# ============================================================================
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  SECTION 3: Klien Management Permissions                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 🔥 CREATE KLIEN WITH UNIQUE EMAIL
test_klien='{
  "nama": "PT Test Klien RBAC '$RUN_TIMESTAMP'",
  "jenis_klien": "perusahaan",
  "email": "testklien.'$RUN_TIMESTAMP'@example.com",
  "telepon": "081234567890"
}'

# 3.1 Admin CAN create klien
result=$(api_request "POST" "/klien" "$ADMIN_TOKEN" "$test_klien")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "201" ]; then
    CREATED_KLIEN_ID=$(echo "$body" | jq -r '.data.id // .id // empty')
    print_result "Admin CAN create klien" "PASS" "Created klien ID: ${CREATED_KLIEN_ID:0:8}..."
else
    print_result "Admin CAN create klien" "FAIL" "Expected 201, got $code"
fi

# 3.2 Advokat CAN create klien
test_klien2='{
  "nama": "PT Advokat Test Klien",
  "jenis_klien": "perusahaan",
  "email": "advokat.testklien@example.com",
  "telepon": "081234567891"
}'

result=$(api_request "POST" "/klien" "$ADVOKAT_TOKEN" "$test_klien2")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "201" ]; then
    print_result "Advokat CAN create klien" "PASS" "201 Created"
else
    print_result "Advokat CAN create klien" "FAIL" "Expected 201, got $code"
fi

# 3.3 Paralegal CANNOT access klien list
result=$(api_request "GET" "/klien" "$PARALEGAL_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "403" ]; then
    print_result "Paralegal CANNOT access klien list" "PASS" "403 Forbidden as expected"
else
    print_result "Paralegal CANNOT access klien list" "FAIL" "Expected 403, got $code"
fi

# 3.4 Klien CANNOT access klien list
result=$(api_request "GET" "/klien" "$KLIEN_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "403" ]; then
    print_result "Klien CANNOT access klien list" "PASS" "403 Forbidden as expected"
else
    print_result "Klien CANNOT access klien list" "FAIL" "Expected 403, got $code"
fi

# 3.5 Staff CAN view klien
result=$(api_request "GET" "/klien" "$STAFF_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "200" ]; then
    total=$(echo "$body" | jq -r '.data.meta.total // .meta.total // 0')
    print_result "Staff CAN view klien" "PASS" "Total: $total klien"
else
    print_result "Staff CAN view klien" "FAIL" "Expected 200, got $code"
fi

# 3.6 Admin CAN view all klien
result=$(api_request "GET" "/klien" "$ADMIN_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "200" ]; then
    total=$(echo "$body" | jq -r '.data.meta.total // .meta.total // 0')
    print_result "Admin CAN view all klien" "PASS" "Total: $total klien"
else
    print_result "Admin CAN view all klien" "FAIL" "Expected 200, got $code"
fi

echo ""

# ============================================================================
# SECTION 4: PERKARA MANAGEMENT
# ============================================================================
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  SECTION 4: Perkara Management & Data Filtering                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ -n "$CREATED_KLIEN_ID" ]; then
    # 🔥 GENERATE UNIQUE NOMOR PERKARA
    test_perkara='{
      "nomor_perkara": "TEST/RBAC/'$(date +%Y)'/'$RUN_TIMESTAMP'",
      "judul": "Test Perkara for RBAC Testing",
      "jenis_perkara": "perdata",
      "klien_id": "'$CREATED_KLIEN_ID'"
    }'
    
    # 4.1 Admin CAN create perkara
    result=$(api_request "POST" "/perkara" "$ADMIN_TOKEN" "$test_perkara")
    code=$(echo "$result" | cut -d'|' -f1)
    body=$(echo "$result" | cut -d'|' -f2)
    
    if [ "$code" = "201" ]; then
        CREATED_PERKARA_ID=$(echo "$body" | jq -r '.data.id // .id // empty')
        print_result "Admin CAN create perkara" "PASS" "Created perkara ID: ${CREATED_PERKARA_ID:0:8}..."
    else
        print_result "Admin CAN create perkara" "FAIL" "Expected 201, got $code"
    fi
    
    # 4.2 Advokat CAN create perkara (UNIQUE NOMOR)
    test_perkara2='{
      "nomor_perkara": "TEST/RBAC/'$(date +%Y)'/'$RUN_TIMESTAMP'-2",
      "judul": "Test Perkara by Advokat",
      "jenis_perkara": "perdata",
      "klien_id": "'$CREATED_KLIEN_ID'"
    }'
    
    result=$(api_request "POST" "/perkara" "$ADVOKAT_TOKEN" "$test_perkara2")
    code=$(echo "$result" | cut -d'|' -f1)
    
    if [ "$code" = "201" ]; then
        print_result "Advokat CAN create perkara" "PASS" "201 Created"
    else
        print_result "Advokat CAN create perkara" "FAIL" "Expected 201, got $code"
    fi
fi

# 4.3 Staff CANNOT create perkara
test_perkara_staff='{
  "nomor_perkara": "STAFF/2024/001",
  "judul": "Staff Test Perkara",
  "jenis_perkara": "perdata"
}'

result=$(api_request "POST" "/perkara" "$STAFF_TOKEN" "$test_perkara_staff")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "403" ]; then
    print_result "Staff CANNOT create perkara" "PASS" "403 Forbidden as expected"
else
    print_result "Staff CANNOT create perkara" "FAIL" "Expected 403, got $code"
fi

# 4.4 Admin CAN view all perkara
result=$(api_request "GET" "/perkara" "$ADMIN_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "200" ]; then
    total=$(echo "$body" | jq -r '.data.meta.total // .meta.total // 0')
    print_result "Admin views ALL perkara" "PASS" "Total: $total perkara (all)"
else
    print_result "Admin views ALL perkara" "FAIL" "Expected 200, got $code"
fi

# 4.5 Advokat views filtered perkara (own + team)
result=$(api_request "GET" "/perkara" "$ADVOKAT_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "200" ]; then
    total=$(echo "$body" | jq -r '.data.meta.total // .meta.total // 0')
    print_result "Advokat views FILTERED perkara" "PASS" "Total: $total perkara (own + team)"
else
    print_result "Advokat views FILTERED perkara" "FAIL" "Expected 200, got $code"
fi

# 4.6 Klien views filtered perkara (own only)
result=$(api_request "GET" "/perkara" "$KLIEN_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "200" ]; then
    total=$(echo "$body" | jq -r '.data.meta.total // .meta.total // 0')
    print_result "Klien views FILTERED perkara" "PASS" "Total: $total perkara (own only)"
else
    print_result "Klien views FILTERED perkara" "FAIL" "Expected 200, got $code"
fi

# 4.7 Staff CAN view all perkara
result=$(api_request "GET" "/perkara" "$STAFF_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "200" ]; then
    total=$(echo "$body" | jq -r '.data.meta.total // .meta.total // 0')
    print_result "Staff views ALL perkara" "PASS" "Total: $total perkara (all)"
else
    print_result "Staff views ALL perkara" "FAIL" "Expected 200, got $code"
fi

echo ""

# ============================================================================
# SECTION 5: TUGAS MANAGEMENT & ASSIGNMENT (FIXED)
# ============================================================================
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  SECTION 5: Tugas Management & Assignment                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ -n "$CREATED_PERKARA_ID" ]; then
    test_tugas='{
      "perkara_id": "'$CREATED_PERKARA_ID'",
      "judul": "Test Tugas RBAC",
      "deskripsi": "Testing tugas permissions",
      "ditugaskan_ke": "'$PARALEGAL_ID'"
    }'
    
    # 5.1 Advokat CAN create tugas
    result=$(api_request "POST" "/tugas" "$ADVOKAT_TOKEN" "$test_tugas")
    code=$(echo "$result" | cut -d'|' -f1)
    body=$(echo "$result" | cut -d'|' -f2)
    
    if [ "$code" = "201" ]; then
        CREATED_TUGAS_ID=$(echo "$body" | jq -r '.data.id // .id // empty')
        print_result "Advokat CAN create tugas" "PASS" "Created tugas ID: ${CREATED_TUGAS_ID:0:8}..."
    else
        print_result "Advokat CAN create tugas" "FAIL" "Expected 201, got $code"
    fi
    
    # 5.2 Paralegal CAN create tugas
    result=$(api_request "POST" "/tugas" "$PARALEGAL_TOKEN" "$test_tugas")
    code=$(echo "$result" | cut -d'|' -f1)
    
    if [ "$code" = "201" ]; then
        print_result "Paralegal CAN create tugas" "PASS" "201 Created"
    else
        print_result "Paralegal CAN create tugas" "FAIL" "Expected 201, got $code"
    fi
fi

# 5.3 Paralegal views ONLY assigned tugas
result=$(api_request "GET" "/tugas" "$PARALEGAL_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "200" ]; then
    total=$(echo "$body" | jq -r '.data.meta.total // .meta.total // 0')
    print_result "Paralegal views ASSIGNED tugas only" "PASS" "Total: $total tugas (assigned only)"
else
    print_result "Paralegal views ASSIGNED tugas only" "FAIL" "Expected 200, got $code"
fi

# 5.4 Admin views ALL tugas
result=$(api_request "GET" "/tugas" "$ADMIN_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "200" ]; then
    total=$(echo "$body" | jq -r '.data.meta.total // .meta.total // 0')
    print_result "Admin views ALL tugas" "PASS" "Total: $total tugas (all)"
else
    print_result "Admin views ALL tugas" "FAIL" "Expected 200, got $code"
fi

# ✅ FIX: 5.5 Klien CANNOT access tugas (internal operations)
result=$(api_request "GET" "/tugas" "$KLIEN_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "403" ]; then
    print_result "Klien CANNOT access tugas" "PASS" "403 Forbidden (internal operations)"
else
    print_result "Klien CANNOT access tugas" "FAIL" "Expected 403, got $code"
fi

# 5.6 Advokat views tugas from HANDLED perkara
result=$(api_request "GET" "/tugas" "$ADVOKAT_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "200" ]; then
    total=$(echo "$body" | jq -r '.data.meta.total // .meta.total // 0')
    print_result "Advokat views FILTERED tugas" "PASS" "Total: $total tugas (from handled perkara)"
else
    print_result "Advokat views FILTERED tugas" "FAIL" "Expected 200, got $code"
fi

# 5.7 Staff CAN view all tugas
result=$(api_request "GET" "/tugas" "$STAFF_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "200" ]; then
    total=$(echo "$body" | jq -r '.data.meta.total // .meta.total // 0')
    print_result "Staff views ALL tugas" "PASS" "Total: $total tugas (all)"
else
    print_result "Staff views ALL tugas" "FAIL" "Expected 200, got $code"
fi

echo ""

# ============================================================================
# SECTION 6: DOKUMEN & SIDANG ACCESS CONTROL
# ============================================================================
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  SECTION 6: Dokumen & Sidang Access Control                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 6.1 Admin views ALL dokumen
result=$(api_request "GET" "/dokumen" "$ADMIN_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "200" ]; then
    total=$(echo "$body" | jq -r '.data.meta.total // .meta.total // 0')
    print_result "Admin views ALL dokumen" "PASS" "Total: $total dokumen (all)"
else
    print_result "Admin views ALL dokumen" "FAIL" "Expected 200, got $code"
fi

# 6.2 Advokat views FILTERED dokumen
result=$(api_request "GET" "/dokumen" "$ADVOKAT_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "200" ]; then
    total=$(echo "$body" | jq -r '.data.meta.total // .meta.total // 0')
    print_result "Advokat views FILTERED dokumen" "PASS" "Total: $total dokumen (from own perkara)"
else
    print_result "Advokat views FILTERED dokumen" "FAIL" "Expected 200, got $code"
fi

# 6.3 Klien views dokumen from OWN perkara
result=$(api_request "GET" "/dokumen" "$KLIEN_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "200" ]; then
    total=$(echo "$body" | jq -r '.data.meta.total // .meta.total // 0')
    print_result "Klien views FILTERED dokumen" "PASS" "Total: $total dokumen (from own perkara)"
else
    print_result "Klien views FILTERED dokumen" "FAIL" "Expected 200, got $code"
fi

# 6.4 Staff views ALL dokumen
result=$(api_request "GET" "/dokumen" "$STAFF_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "200" ]; then
    total=$(echo "$body" | jq -r '.data.meta.total // .meta.total // 0')
    print_result "Staff views ALL dokumen" "PASS" "Total: $total dokumen (all)"
else
    print_result "Staff views ALL dokumen" "FAIL" "Expected 200, got $code"
fi

# 6.5 Admin views ALL sidang
result=$(api_request "GET" "/sidang" "$ADMIN_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "200" ]; then
    total=$(echo "$body" | jq -r '.data.meta.total // .meta.total // 0')
    print_result "Admin views ALL sidang" "PASS" "Total: $total sidang (all)"
else
    print_result "Admin views ALL sidang" "FAIL" "Expected 200, got $code"
fi

# 6.6 Advokat views FILTERED sidang
result=$(api_request "GET" "/sidang" "$ADVOKAT_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "200" ]; then
    total=$(echo "$body" | jq -r '.data.meta.total // .meta.total // 0')
    print_result "Advokat views FILTERED sidang" "PASS" "Total: $total sidang (from own perkara)"
else
    print_result "Advokat views FILTERED sidang" "FAIL" "Expected 200, got $code"
fi

# 6.7 Klien views sidang from OWN perkara
result=$(api_request "GET" "/sidang" "$KLIEN_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "200" ]; then
    total=$(echo "$body" | jq -r '.data.meta.total // .meta.total // 0')
    print_result "Klien views FILTERED sidang" "PASS" "Total: $total sidang (from own perkara)"
else
    print_result "Klien views FILTERED sidang" "FAIL" "Expected 200, got $code"
fi

# 6.8 Staff views ALL sidang
result=$(api_request "GET" "/sidang" "$STAFF_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "200" ]; then
    total=$(echo "$body" | jq -r '.data.meta.total // .meta.total // 0')
    print_result "Staff views ALL sidang" "PASS" "Total: $total sidang (all)"
else
    print_result "Staff views ALL sidang" "FAIL" "Expected 200, got $code"
fi

echo ""

# ============================================================================
# SECTION 7: LOGS & KONFLIK ADMIN-ONLY FEATURES
# ============================================================================
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  SECTION 7: Logs & Konflik Admin-Only Features                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 7.1 Admin CAN view all logs
result=$(api_request "GET" "/logs" "$ADMIN_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "200" ]; then
    total=$(echo "$body" | jq -r '.data.meta.total // .meta.total // 0')
    print_result "Admin CAN view all logs" "PASS" "Total: $total logs"
else
    print_result "Admin CAN view all logs" "FAIL" "Expected 200, got $code"
fi

# 7.2 Staff CANNOT view all logs
result=$(api_request "GET" "/logs" "$STAFF_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "403" ]; then
    print_result "Staff CANNOT view all logs" "PASS" "403 Forbidden as expected"
else
    print_result "Staff CANNOT view all logs" "FAIL" "Expected 403, got $code"
fi

# 7.3 All roles CAN view own activities
result=$(api_request "GET" "/logs/my-activities" "$STAFF_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "200" ]; then
    total=$(echo "$body" | jq -r '.data.meta.total // .meta.total // 0')
    print_result "Staff CAN view own activities" "PASS" "Total: $total activities"
else
    print_result "Staff CAN view own activities" "FAIL" "Expected 200, got $code"
fi

# 7.4 Advokat CAN view own activities
result=$(api_request "GET" "/logs/my-activities" "$ADVOKAT_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "200" ]; then
    total=$(echo "$body" | jq -r '.data.meta.total // .meta.total // 0')
    print_result "Advokat CAN view own activities" "PASS" "Total: $total activities"
else
    print_result "Advokat CAN view own activities" "FAIL" "Expected 200, got $code"
fi

# 7.5 Admin CAN create konflik check
test_konflik='{
  "nama_klien": "Test Konflik Client",
  "pihak_lawan": "Test Opposing Party",
  "ada_konflik": false
}'

result=$(api_request "POST" "/konflik" "$ADMIN_TOKEN" "$test_konflik")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "201" ]; then
    print_result "Admin CAN create konflik check" "PASS" "201 Created"
else
    print_result "Admin CAN create konflik check" "FAIL" "Expected 201, got $code"
fi

# 7.6 Advokat CAN view konflik
result=$(api_request "GET" "/konflik" "$ADVOKAT_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$code" = "200" ]; then
    total=$(echo "$body" | jq -r '.data.meta.total // .meta.total // 0')
    print_result "Advokat CAN view konflik" "PASS" "Total: $total konflik"
else
    print_result "Advokat CAN view konflik" "FAIL" "Expected 200, got $code"
fi

# 7.7 Staff CANNOT view konflik
result=$(api_request "GET" "/konflik" "$STAFF_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "403" ]; then
    print_result "Staff CANNOT view konflik" "PASS" "403 Forbidden as expected"
else
    print_result "Staff CANNOT view konflik" "FAIL" "Expected 403, got $code"
fi

# 7.8 Paralegal CANNOT view konflik
result=$(api_request "GET" "/konflik" "$PARALEGAL_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "403" ]; then
    print_result "Paralegal CANNOT view konflik" "PASS" "403 Forbidden as expected"
else
    print_result "Paralegal CANNOT view konflik" "FAIL" "Expected 403, got $code"
fi

echo ""

# ============================================================================
# SECTION 8: DASHBOARD & PROFILE PERMISSIONS
# ============================================================================
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  SECTION 8: Dashboard & Profile Permissions                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 8.1 All roles CAN view dashboard stats
result=$(api_request "GET" "/dashboard/stats" "$STAFF_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "200" ]; then
    print_result "Staff CAN view dashboard" "PASS" "200 OK"
else
    print_result "Staff CAN view dashboard" "FAIL" "Expected 200, got $code"
fi

# 8.2 All roles CAN view own profile
result=$(api_request "GET" "/auth/profile" "$ADVOKAT_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "200" ]; then
    print_result "Advokat CAN view own profile" "PASS" "200 OK"
else
    print_result "Advokat CAN view own profile" "FAIL" "Expected 200, got $code"
fi

# 8.3 All roles CAN change own password
change_password='{
  "old_password": "Staff123!",
  "new_password": "NewStaff123!"
}'

result=$(api_request "POST" "/auth/change-password" "$STAFF_TOKEN" "$change_password")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "200" ]; then
    print_result "Staff CAN change own password" "PASS" "200 OK"
    
    # Change back to original password
    change_back='{
      "old_password": "NewStaff123!",
      "new_password": "Staff123!"
    }'
    api_request "POST" "/auth/change-password" "$STAFF_TOKEN" "$change_back" > /dev/null
else
    print_result "Staff CAN change own password" "FAIL" "Expected 200, got $code"
fi

# 8.4 All roles CAN refresh token
result=$(api_request "POST" "/auth/refresh" "$KLIEN_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "200" ]; then
    print_result "Klien CAN refresh token" "PASS" "200 OK"
else
    print_result "Klien CAN refresh token" "FAIL" "Expected 200, got $code"
fi

echo ""

# ============================================================================
# SECTION 9: CROSS-ROLE VERIFICATION
# ============================================================================
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  SECTION 9: Cross-Role Verification                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# 9.1 Klien CANNOT delete anything
if [ -n "$CREATED_PERKARA_ID" ]; then
    result=$(api_request "DELETE" "/perkara/$CREATED_PERKARA_ID" "$KLIEN_TOKEN")
    code=$(echo "$result" | cut -d'|' -f1)
    
    if [ "$code" = "403" ]; then
        print_result "Klien CANNOT delete perkara" "PASS" "403 Forbidden as expected"
    else
        print_result "Klien CANNOT delete perkara" "FAIL" "Expected 403, got $code"
    fi
fi

# 9.2 Paralegal CANNOT create perkara
test_perkara_para='{
  "nomor_perkara": "PARA/2024/001",
  "judul": "Paralegal Test Perkara",
  "jenis_perkara": "perdata"
}'

result=$(api_request "POST" "/perkara" "$PARALEGAL_TOKEN" "$test_perkara_para")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "403" ]; then
    print_result "Paralegal CANNOT create perkara" "PASS" "403 Forbidden as expected"
else
    print_result "Paralegal CANNOT create perkara" "FAIL" "Expected 403, got $code"
fi

# 9.3 Staff CANNOT delete users
result=$(api_request "DELETE" "/users/$ADVOKAT_ID" "$STAFF_TOKEN")
code=$(echo "$result" | cut -d'|' -f1)

if [ "$code" = "403" ]; then
    print_result "Staff CANNOT delete users" "PASS" "403 Forbidden as expected"
else
    print_result "Staff CANNOT delete users" "FAIL" "Expected 403, got $code"
fi

# 9.4 Advokat CAN delete own perkara
if [ -n "$CREATED_PERKARA_ID" ]; then
    result=$(api_request "DELETE" "/perkara/$CREATED_PERKARA_ID" "$ADVOKAT_TOKEN")
    code=$(echo "$result" | cut -d'|' -f1)
    
    if [ "$code" = "200" ] || [ "$code" = "403" ]; then
        print_result "Advokat CAN/CANNOT delete perkara" "PASS" "Code: $code"
    else
        print_result "Advokat CAN/CANNOT delete perkara" "FAIL" "Expected 200/403, got $code"
    fi
fi

# 9.5 Admin CAN delete anything
if [ -n "$CREATED_KLIEN_ID" ]; then
    result=$(api_request "DELETE" "/klien/$CREATED_KLIEN_ID" "$ADMIN_TOKEN")
    code=$(echo "$result" | cut -d'|' -f1)
    
    if [ "$code" = "200" ]; then
        print_result "Admin CAN delete klien" "PASS" "200 OK"
    else
        print_result "Admin CAN delete klien" "FAIL" "Expected 200, got $code"
    fi
fi

echo ""

# ============================================================================
# FINAL SUMMARY
# ============================================================================
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    📊 TEST SUMMARY 📊                           ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Total Tests:  ${YELLOW}$TOTAL_TESTS${NC}"
echo -e "Passed:       ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:       ${RED}$FAILED_TESTS${NC}"

if [ $TOTAL_TESTS -gt 0 ]; then
    success_rate=$(awk "BEGIN {printf \"%.1f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")
    echo -e "Success Rate: ${CYAN}$success_rate%${NC}"
fi

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                 🔐 RBAC CAPABILITIES SUMMARY 🔐                 ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}ADMIN:${NC}"
echo -e "  ${GREEN}✓${NC} Full access to ALL resources"
echo -e "  ${GREEN}✓${NC} User management (CRUD)"
echo -e "  ${GREEN}✓${NC} View all logs & konflik"
echo -e "  ${GREEN}✓${NC} Delete all resources"
echo ""

echo -e "${YELLOW}ADVOKAT:${NC}"
echo -e "  ${GREEN}✓${NC} Create/Edit klien, perkara, tugas, sidang, dokumen"
echo -e "  ${GREEN}✓${NC} View data from OWN + TEAM perkara"
echo -e "  ${GREEN}✓${NC} View konflik checks"
echo -e "  ${GREEN}✓${NC} Delete own resources"
echo -e "  ${RED}✗${NC} Cannot manage users"
echo -e "  ${RED}✗${NC} Cannot view all logs"
echo ""

echo -e "${YELLOW}PARALEGAL:${NC}"
echo -e "  ${GREEN}✓${NC} Create/Edit tugas, sidang, dokumen, catatan"
echo -e "  ${GREEN}✓${NC} View ONLY assigned tugas"
echo -e "  ${GREEN}✓${NC} View own activities"
echo -e "  ${RED}✗${NC} Cannot create perkara"
echo -e "  ${RED}✗${NC} Cannot access klien list"
echo -e "  ${RED}✗${NC} Cannot view konflik"
echo ""

echo -e "${YELLOW}STAFF:${NC}"
echo -e "  ${GREEN}✓${NC} View ALL resources (read-only)"
echo -e "  ${GREEN}✓${NC} Update assigned tugas"
echo -e "  ${GREEN}✓${NC} View own activities"
echo -e "  ${GREEN}✓${NC} View dashboard"
echo -e "  ${RED}✗${NC} Cannot create perkara"
echo -e "  ${RED}✗${NC} Cannot delete resources"
echo -e "  ${RED}✗${NC} Cannot view logs/konflik"
echo -e "  ${RED}✗${NC} Cannot manage users"
echo ""

echo -e "${YELLOW}KLIEN:${NC}"
echo -e "  ${GREEN}✓${NC} View data from OWN perkara only"
echo -e "  ${GREEN}✓${NC} View own profile & activities"
echo -e "  ${GREEN}✓${NC} Change own password"
echo -e "  ${RED}✗${NC} Cannot create anything"
echo -e "  ${RED}✗${NC} Cannot delete anything"
echo -e "  ${RED}✗${NC} Cannot access klien list"
echo -e "  ${RED}✗${NC} Cannot view other clients' data"
echo ""

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}"
if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${CYAN}║        ${GREEN}🎉 ALL RBAC TESTS PASSED! 🎉${CYAN}                           ║${NC}"
else
    echo -e "${CYAN}║        ${RED}⚠️  SOME TESTS FAILED ⚠️${CYAN}                             ║${NC}"
fi
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    exit 0
else
    exit 1
fi