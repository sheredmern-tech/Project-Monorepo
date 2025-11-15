#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

API_URL="http://localhost:3000"
ADMIN_EMAIL="admin@perari.id"
ADMIN_PASSWORD="Admin123!"
ADMIN_TOKEN=""

KLIEN_ID=""
PERKARA_ID=""
TUGAS_ID=""

PASSED=0
FAILED=0

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          📝 COMPREHENSIVE CRUD OPERATIONS TEST 📝             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
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
echo "SETUP: Login as Admin"
echo "================================================"
echo ""

# Login with admin
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\":\"$ADMIN_EMAIL\",
        \"password\":\"$ADMIN_PASSWORD\"
    }")

status=$(get_status "$response")
body=$(get_body "$response")

if [ "$status" == "200" ] || [ "$status" == "201" ]; then
    ADMIN_TOKEN=$(echo "$body" | jq -r '.data.access_token' 2>/dev/null)
    echo -e "${GREEN}✓ Admin authenticated${NC}"
    echo ""
else
    echo -e "${RED}✗ Failed to authenticate admin (status: $status)${NC}"
    echo -e "${YELLOW}💡 Did you run: npx prisma db seed ?${NC}"
    echo ""
    exit 1
fi

echo "================================================"
echo "TEST 1: KLIEN CRUD Operations"
echo "================================================"
echo ""

echo -e "${BLUE}1.1${NC} CREATE - Buat klien baru"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/klien" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "nama": "PT. Test Company",
        "jenis_klien": "perusahaan",
        "email": "contact@testcompany.com",
        "telepon": "081234567890",
        "alamat": "Jl. Test No. 123",
        "kota": "Jakarta"
    }')
status=$(get_status "$response")
body=$(get_body "$response")
print_result "Create klien" "201" "$status"

if [ "$status" == "201" ]; then
    KLIEN_ID=$(echo "$body" | jq -r '.data.id' 2>/dev/null)
    echo -e "${GREEN}   ↳ Klien ID: $KLIEN_ID${NC}"
fi
echo ""

echo -e "${BLUE}1.2${NC} READ - Get all klien"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/klien?page=1&limit=10" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
status=$(get_status "$response")
print_result "Get all klien" "200" "$status"
echo ""

echo -e "${BLUE}1.3${NC} READ - Get klien by ID"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/klien/$KLIEN_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
status=$(get_status "$response")
body=$(get_body "$response")
print_result "Get klien by ID" "200" "$status"

if [ "$status" == "200" ]; then
    nama=$(echo "$body" | jq -r '.data.nama' 2>/dev/null)
    if [ "$nama" == "PT. Test Company" ]; then
        echo -e "${GREEN}   ↳ Data correct${NC}"
        ((PASSED++))
    else
        echo -e "${RED}   ↳ Data mismatch${NC}"
        ((FAILED++))
    fi
fi
echo ""

echo -e "${BLUE}1.4${NC} UPDATE - Update klien"
response=$(curl -s -w "\n%{http_code}" -X PATCH "$API_URL/api/v1/klien/$KLIEN_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "nama": "PT. Test Company Updated",
        "telepon": "081298765432"
    }')
status=$(get_status "$response")
body=$(get_body "$response")
print_result "Update klien" "200" "$status"

if [ "$status" == "200" ]; then
    updated_nama=$(echo "$body" | jq -r '.data.nama' 2>/dev/null)
    if [ "$updated_nama" == "PT. Test Company Updated" ]; then
        echo -e "${GREEN}   ↳ Update successful${NC}"
        ((PASSED++))
    else
        echo -e "${RED}   ↳ Update failed${NC}"
        ((FAILED++))
    fi
fi
echo ""

echo -e "${BLUE}1.5${NC} SEARCH - Search klien by nama"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/klien?search=Updated" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
status=$(get_status "$response")
body=$(get_body "$response")
print_result "Search klien" "200" "$status"

if [ "$status" == "200" ]; then
    count=$(echo "$body" | jq -r '.data.meta.total' 2>/dev/null)
    if [ "$count" -gt 0 ] 2>/dev/null; then
        echo -e "${GREEN}   ↳ Found $count result(s)${NC}"
        ((PASSED++))
    else
        echo -e "${RED}   ↳ No results found${NC}"
        ((FAILED++))
    fi
fi
echo ""

echo "================================================"
echo "TEST 2: PERKARA CRUD Operations"
echo "================================================"
echo ""

echo -e "${BLUE}2.1${NC} CREATE - Buat perkara baru"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/perkara" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"nomor_perkara\": \"TEST/2025/001\",
        \"judul\": \"Test Case - Gugatan Wanprestasi\",
        \"klien_id\": \"$KLIEN_ID\",
        \"jenis_perkara\": \"perdata\",
        \"status\": \"aktif\",
        \"prioritas\": \"tinggi\",
        \"nama_pengadilan\": \"PN Jakarta Selatan\"
    }")
status=$(get_status "$response")
body=$(get_body "$response")
print_result "Create perkara" "201" "$status"

if [ "$status" == "201" ]; then
    PERKARA_ID=$(echo "$body" | jq -r '.data.id' 2>/dev/null)
    echo -e "${GREEN}   ↳ Perkara ID: $PERKARA_ID${NC}"
fi
echo ""

echo -e "${BLUE}2.2${NC} READ - Get perkara by ID with relations"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/perkara/$PERKARA_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
status=$(get_status "$response")
body=$(get_body "$response")
print_result "Get perkara details" "200" "$status"

if [ "$status" == "200" ]; then
    klien_nama=$(echo "$body" | jq -r '.data.klien.nama' 2>/dev/null)
    if [ -n "$klien_nama" ] && [ "$klien_nama" != "null" ]; then
        echo -e "${GREEN}   ↳ Relation data loaded${NC}"
        ((PASSED++))
    fi
fi
echo ""

echo -e "${BLUE}2.3${NC} UPDATE - Update status perkara"
response=$(curl -s -w "\n%{http_code}" -X PATCH "$API_URL/api/v1/perkara/$PERKARA_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "status": "selesai"
    }')
status=$(get_status "$response")
print_result "Update perkara status" "200" "$status"
echo ""

echo -e "${BLUE}2.4${NC} FILTER - Get perkara by jenis"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/perkara?jenis_perkara=perdata" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
status=$(get_status "$response")
print_result "Filter by jenis perkara" "200" "$status"
echo ""

echo -e "${BLUE}2.5${NC} STATISTICS - Get perkara statistics"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/perkara/$PERKARA_ID/statistics" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
status=$(get_status "$response")
body=$(get_body "$response")
print_result "Get perkara statistics" "200" "$status"

if [ "$status" == "200" ]; then
    total_tugas=$(echo "$body" | jq -r '.data.statistik.total_tugas' 2>/dev/null)
    if [ "$total_tugas" != "null" ]; then
        echo -e "${GREEN}   ↳ Statistics available${NC}"
        ((PASSED++))
    fi
fi
echo ""

echo "================================================"
echo "TEST 3: TUGAS CRUD Operations"
echo "================================================"
echo ""

echo -e "${BLUE}3.1${NC} CREATE - Buat tugas baru"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/tugas" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"perkara_id\": \"$PERKARA_ID\",
        \"judul\": \"Draft Surat Gugatan\",
        \"deskripsi\": \"Membuat draft gugatan lengkap\",
        \"status\": \"belum_mulai\",
        \"prioritas\": \"tinggi\",
        \"tenggat_waktu\": \"2025-12-31T23:59:59Z\"
    }")
status=$(get_status "$response")
body=$(get_body "$response")
print_result "Create tugas" "201" "$status"

if [ "$status" == "201" ]; then
    TUGAS_ID=$(echo "$body" | jq -r '.data.id' 2>/dev/null)
    echo -e "${GREEN}   ↳ Tugas ID: $TUGAS_ID${NC}"
fi
echo ""

echo -e "${BLUE}3.2${NC} READ - Get my tasks"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/tugas/my-tasks" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
status=$(get_status "$response")
print_result "Get my tasks" "200" "$status"
echo ""

echo -e "${BLUE}3.3${NC} UPDATE - Update tugas status to 'sedang_berjalan'"
response=$(curl -s -w "\n%{http_code}" -X PATCH "$API_URL/api/v1/tugas/$TUGAS_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "status": "sedang_berjalan"
    }')
status=$(get_status "$response")
print_result "Update tugas to in-progress" "200" "$status"
echo ""

echo -e "${BLUE}3.4${NC} UPDATE - Complete tugas"
response=$(curl -s -w "\n%{http_code}" -X PATCH "$API_URL/api/v1/tugas/$TUGAS_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "status": "selesai"
    }')
status=$(get_status "$response")
body=$(get_body "$response")
print_result "Complete tugas" "200" "$status"

if [ "$status" == "200" ]; then
    tanggal_selesai=$(echo "$body" | jq -r '.data.tanggal_selesai' 2>/dev/null)
    if [ "$tanggal_selesai" != "null" ]; then
        echo -e "${GREEN}   ↳ Completion date set automatically${NC}"
        ((PASSED++))
    fi
fi
echo ""

echo -e "${BLUE}3.5${NC} FILTER - Get tugas by status"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/tugas?status=selesai" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
status=$(get_status "$response")
print_result "Filter tugas by status" "200" "$status"
echo ""

echo "================================================"
echo "TEST 4: PAGINATION & SORTING"
echo "================================================"
echo ""

echo -e "${BLUE}4.1${NC} Pagination - Page 1"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/klien?page=1&limit=5" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
status=$(get_status "$response")
body=$(get_body "$response")
print_result "Get page 1" "200" "$status"

if [ "$status" == "200" ]; then
    page=$(echo "$body" | jq -r '.data.meta.page' 2>/dev/null)
    limit=$(echo "$body" | jq -r '.data.meta.limit' 2>/dev/null)
    if [ "$page" == "1" ] && [ "$limit" == "5" ]; then
        echo -e "${GREEN}   ↳ Pagination working${NC}"
        ((PASSED++))
    fi
fi
echo ""

echo -e "${BLUE}4.2${NC} Sorting - Sort by created_at desc"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/klien?sortBy=created_at&sortOrder=desc" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
status=$(get_status "$response")
print_result "Sort descending" "200" "$status"
echo ""

echo -e "${BLUE}4.3${NC} Sorting - Sort by nama asc"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/klien?sortBy=nama&sortOrder=asc" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
status=$(get_status "$response")
print_result "Sort ascending" "200" "$status"
echo ""

echo "================================================"
echo "TEST 5: DASHBOARD & AGGREGATIONS"
echo "================================================"
echo ""

echo -e "${BLUE}5.1${NC} Get dashboard stats"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/dashboard/stats" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
status=$(get_status "$response")
body=$(get_body "$response")
print_result "Get dashboard stats" "200" "$status"

if [ "$status" == "200" ]; then
    total_perkara=$(echo "$body" | jq -r '.data.total_perkara' 2>/dev/null)
    if [ "$total_perkara" != "null" ]; then
        echo -e "${GREEN}   ↳ Dashboard data available${NC}"
        ((PASSED++))
    fi
fi
echo ""

echo -e "${BLUE}5.2${NC} Get my stats"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/dashboard/my-stats" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
status=$(get_status "$response")
print_result "Get my stats" "200" "$status"
echo ""

echo -e "${BLUE}5.3${NC} Get perkara chart by jenis"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/dashboard/chart/perkara-by-jenis" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
status=$(get_status "$response")
print_result "Get chart data - by jenis" "200" "$status"
echo ""

echo -e "${BLUE}5.4${NC} Get perkara chart by status"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/dashboard/chart/perkara-by-status" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
status=$(get_status "$response")
print_result "Get chart data - by status" "200" "$status"
echo ""

echo "================================================"
echo "TEST 6: ERROR HANDLING"
echo "================================================"
echo ""

echo -e "${BLUE}6.1${NC} Get non-existent klien"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/klien/00000000-0000-0000-0000-000000000000" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
status=$(get_status "$response")
print_result "Non-existent resource returns 404" "404" "$status"
echo ""

echo -e "${BLUE}6.2${NC} Create klien with invalid data"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/klien" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "invalid-email",
        "telepon": "123"
    }')
status=$(get_status "$response")
print_result "Invalid data returns 400" "400" "$status"
echo ""

echo -e "${BLUE}6.3${NC} Update with invalid UUID"
response=$(curl -s -w "\n%{http_code}" -X PATCH "$API_URL/api/v1/klien/invalid-uuid" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"nama": "Test"}')
status=$(get_status "$response")
# Accept either 400 or 404 for invalid UUID
if [ "$status" == "400" ] || [ "$status" == "404" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Invalid UUID returns error (got $status)"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} - Invalid UUID (Expected: 400 or 404, Got: $status)"
    ((FAILED++))
fi
echo ""

echo "================================================"
echo "TEST 7: CLEANUP - Delete Resources"
echo "================================================"
echo ""

echo -e "${BLUE}7.1${NC} DELETE - Delete tugas"
if [ -n "$TUGAS_ID" ] && [ "$TUGAS_ID" != "null" ]; then
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$API_URL/api/v1/tugas/$TUGAS_ID" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    status=$(get_status "$response")
    print_result "Delete tugas" "200" "$status"
else
    echo -e "${YELLOW}⚠ SKIP${NC} - No tugas to delete"
fi
echo ""

echo -e "${BLUE}7.2${NC} DELETE - Delete perkara"
if [ -n "$PERKARA_ID" ] && [ "$PERKARA_ID" != "null" ]; then
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$API_URL/api/v1/perkara/$PERKARA_ID" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    status=$(get_status "$response")
    print_result "Delete perkara" "200" "$status"
else
    echo -e "${YELLOW}⚠ SKIP${NC} - No perkara to delete"
fi
echo ""

echo -e "${BLUE}7.3${NC} DELETE - Delete klien"
if [ -n "$KLIEN_ID" ] && [ "$KLIEN_ID" != "null" ]; then
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$API_URL/api/v1/klien/$KLIEN_ID" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    status=$(get_status "$response")
    print_result "Delete klien" "200" "$status"
else
    echo -e "${YELLOW}⚠ SKIP${NC} - No klien to delete"
fi
echo ""

echo -e "${BLUE}7.4${NC} Verify deletion - klien should not exist"
if [ -n "$KLIEN_ID" ] && [ "$KLIEN_ID" != "null" ]; then
    response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/klien/$KLIEN_ID" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    status=$(get_status "$response")
    print_result "Deleted resource returns 404" "404" "$status"
fi
echo ""

echo "================================================"
echo "📊 TEST SUMMARY"
echo "================================================"
TOTAL=$((PASSED + FAILED))
PERCENTAGE=0
if [ $TOTAL -gt 0 ]; then
    PERCENTAGE=$((PASSED * 100 / TOTAL))
fi

echo ""
echo -e "Total Tests: ${CYAN}$TOTAL${NC}"
echo -e "Passed:      ${GREEN}$PASSED${NC}"
echo -e "Failed:      ${RED}$FAILED${NC}"
echo -e "Success Rate: ${CYAN}${PERCENTAGE}%${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║        🎉 ALL CRUD TESTS PASSED! 🎉                           ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║    ⚠️  SOME CRUD TESTS FAILED - REVIEW REQUIRED ⚠️            ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi