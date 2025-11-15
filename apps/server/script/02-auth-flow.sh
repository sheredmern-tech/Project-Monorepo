#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

API_URL="http://localhost:3000"
TEST_EMAIL="authtest@perari.id"
TEST_PASSWORD="TestPass123!"
TOKEN=""
USER_ID=""

# ACCURATE TEST COUNTERS
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        🔐 FINAL AUTH FLOW TEST SUITE (ACCURATE) 🔐           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Helper to run test and count accurately
run_test() {
    local test_name=$1
    local expected=$2
    local actual=$3
    
    ((TOTAL_TESTS++))
    
    if [ "$expected" == "$actual" ]; then
        echo -e "${GREEN}✅ PASS${NC} - $test_name"
        ((PASSED_TESTS++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} - $test_name (Expected: $expected, Got: $actual)"
        ((FAILED_TESTS++))
        return 1
    fi
}

# Helper to extract status code
get_status() {
    echo "$1" | tail -n1
}

# Helper to extract body
get_body() {
    echo "$1" | head -n-1
}

# Print detailed response
print_response() {
    local body=$1
    local status=$2
    echo -e "${CYAN}   Status: $status${NC}"
    echo -e "${CYAN}   Response:${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
}

echo "================================================"
echo "SETUP: Database Cleanup"
echo "================================================"
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Cleanup script
cat > "$SCRIPT_DIR/cleanup-final-temp.js" << 'CLEANUP_EOF'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  try {
    const testUser = await prisma.user.findUnique({
      where: { email: 'authtest@perari.id' }
    });
    
    if (testUser) {
      console.log('📦 Cleaning up test user:', testUser.email);
      await prisma.logAktivitas.deleteMany({ where: { user_id: testUser.id } });
      await prisma.catatanPerkara.deleteMany({ where: { user_id: testUser.id } });
      await prisma.timPerkara.deleteMany({ where: { user_id: testUser.id } });
      await prisma.tugas.deleteMany({ where: { OR: [
        { ditugaskan_ke: testUser.id },
        { dibuat_oleh: testUser.id }
      ]}});
      await prisma.dokumenHukum.deleteMany({ where: { diunggah_oleh: testUser.id } });
      await prisma.jadwalSidang.deleteMany({ where: { dibuat_oleh: testUser.id } });
      await prisma.pemeriksaanKonflik.deleteMany({ where: { diperiksa_oleh: testUser.id } });
      await prisma.perkara.deleteMany({ where: { dibuat_oleh: testUser.id } });
      await prisma.klien.deleteMany({ where: { dibuat_oleh: testUser.id } });
      await prisma.user.delete({ where: { id: testUser.id } });
      console.log('✅ Test user deleted successfully');
    } else {
      console.log('ℹ️  No test user found');
    }
  } catch (error) {
    console.error('❌ Cleanup error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
CLEANUP_EOF

if (cd "$SCRIPT_DIR" && node cleanup-final-temp.js 2>&1); then
    echo -e "${GREEN}✅ Cleanup successful${NC}"
    rm "$SCRIPT_DIR/cleanup-final-temp.js" 2>/dev/null
else
    echo -e "${YELLOW}⚠️  Cleanup had warnings${NC}"
    rm "$SCRIPT_DIR/cleanup-final-temp.js" 2>/dev/null
fi
echo ""

echo "================================================"
echo "TEST 1: Registration Flow"
echo "================================================"
echo ""

echo -e "${BLUE}1.1${NC} Register with invalid email format"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"email":"invalid-email","password":"TestPass123!","nama_lengkap":"Test User"}')
status=$(get_status "$response")
run_test "Invalid email rejected" "400" "$status"
echo ""

echo -e "${BLUE}1.2${NC} Register with weak password"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@perari.id","password":"12345","nama_lengkap":"Test User"}')
status=$(get_status "$response")
run_test "Weak password rejected" "400" "$status"
echo ""

echo -e "${BLUE}1.3${NC} Register with valid data"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"nama_lengkap\":\"Auth Test User\",\"jabatan\":\"Tester\"}")
status=$(get_status "$response")
body=$(get_body "$response")

if [ "$status" == "200" ] || [ "$status" == "201" ]; then
    run_test "Valid registration accepted" "PASS" "PASS"
    TOKEN=$(echo "$body" | jq -r '.data.access_token // .access_token // empty' 2>/dev/null)
    USER_ID=$(echo "$body" | jq -r '.data.user.id // .user.id // empty' 2>/dev/null)
    
    if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
        echo -e "${GREEN}   ↳ Token: ${TOKEN:0:20}...${NC}"
    fi
else
    run_test "Valid registration accepted" "200/201" "$status"
    print_response "$body" "$status"
fi
echo ""

sleep 1

echo -e "${BLUE}1.4${NC} Register with duplicate email"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"nama_lengkap\":\"Duplicate User\"}")
status=$(get_status "$response")
if [ "$status" == "400" ] || [ "$status" == "409" ]; then
    run_test "Duplicate rejected" "PASS" "PASS"
else
    run_test "Duplicate rejected" "400/409" "$status"
fi
echo ""

echo "================================================"
echo "TEST 2: Login Flow"
echo "================================================"
echo ""

echo -e "${BLUE}2.1${NC} Login with wrong password"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"WrongPassword123!\"}")
status=$(get_status "$response")
run_test "Wrong password rejected" "401" "$status"
echo ""

echo -e "${BLUE}2.2${NC} Login with correct credentials"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")
status=$(get_status "$response")
body=$(get_body "$response")

if [ "$status" == "200" ] || [ "$status" == "201" ]; then
    run_test "Valid login accepted" "PASS" "PASS"
    TOKEN=$(echo "$body" | jq -r '.data.access_token // .access_token // empty' 2>/dev/null)
    
    if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
        echo -e "${GREEN}   ↳ Token received${NC}"
    fi
else
    run_test "Valid login accepted" "200/201" "$status"
    print_response "$body" "$status"
fi
echo ""

# Safety check
if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    echo -e "${RED}═══════════════════════════════════════════════════════${NC}"
    echo -e "${RED}⚠️  CRITICAL: No valid token - stopping tests${NC}"
    echo -e "${RED}═══════════════════════════════════════════════════════${NC}"
    echo ""
    echo "📊 TEST SUMMARY (Partial)"
    echo "Total: $TOTAL_TESTS | Passed: ${GREEN}$PASSED_TESTS${NC} | Failed: ${RED}$FAILED_TESTS${NC}"
    exit 1
fi

echo "================================================"
echo "TEST 3: Protected Endpoints"
echo "================================================"
echo ""

echo -e "${BLUE}3.1${NC} Access profile without token"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/auth/profile")
status=$(get_status "$response")
run_test "No token rejected" "401" "$status"
echo ""

echo -e "${BLUE}3.2${NC} Access profile with valid token"
response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/api/v1/auth/profile" \
    -H "Authorization: Bearer $TOKEN")
status=$(get_status "$response")
run_test "Profile access granted" "200" "$status"
echo ""

echo "================================================"
echo "TEST 4: Password Change"
echo "================================================"
echo ""

NEW_PASSWORD="NewTestPass123!"

echo -e "${BLUE}4.1${NC} Change password with wrong old password"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/auth/change-password" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"old_password":"WrongOld123!","new_password":"NewPass123!"}')
status=$(get_status "$response")
if [ "$status" == "400" ] || [ "$status" == "401" ]; then
    run_test "Wrong old password rejected" "PASS" "PASS"
else
    run_test "Wrong old password rejected" "400/401" "$status"
fi
echo ""

echo -e "${BLUE}4.2${NC} Change password with correct old password"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/auth/change-password" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"old_password\":\"$TEST_PASSWORD\",\"new_password\":\"$NEW_PASSWORD\"}")
status=$(get_status "$response")
if [ "$status" == "200" ] || [ "$status" == "201" ]; then
    run_test "Password changed successfully" "PASS" "PASS"
else
    run_test "Password changed successfully" "200/201" "$status"
fi
echo ""

sleep 1

echo -e "${BLUE}4.3${NC} Login with old password"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")
status=$(get_status "$response")
run_test "Old password rejected" "401" "$status"
echo ""

echo -e "${BLUE}4.4${NC} Login with new password"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$NEW_PASSWORD\"}")
status=$(get_status "$response")
body=$(get_body "$response")

if [ "$status" == "200" ] || [ "$status" == "201" ]; then
    run_test "New password accepted" "PASS" "PASS"
    TOKEN=$(echo "$body" | jq -r '.data.access_token // .access_token // empty' 2>/dev/null)
else
    run_test "New password accepted" "200/201" "$status"
fi
echo ""

echo "================================================"
echo "TEST 5: Token Refresh"
echo "================================================"
echo ""

echo -e "${BLUE}5.1${NC} Refresh token"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/v1/auth/refresh" \
    -H "Authorization: Bearer $TOKEN")
status=$(get_status "$response")
if [ "$status" == "200" ] || [ "$status" == "201" ]; then
    run_test "Token refresh successful" "PASS" "PASS"
else
    run_test "Token refresh successful" "200/201" "$status"
fi
echo ""

echo "================================================"
echo "TEST 6: JWT Token Validation"
echo "================================================"
echo ""

echo -e "${BLUE}6.1${NC} Verify token structure"
if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    payload=$(echo "$TOKEN" | cut -d. -f2)
    padding=$((4 - ${#payload} % 4))
    if [ $padding -lt 4 ]; then
        payload="${payload}$(printf '%*s' $padding | tr ' ' '=')"
    fi
    
    decoded=$(echo "$payload" | base64 -d 2>/dev/null | jq '.' 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        run_test "JWT structure valid" "PASS" "PASS"
    else
        run_test "JWT structure valid" "PASS" "FAIL"
    fi
else
    run_test "JWT structure valid" "PASS" "FAIL"
fi
echo ""

echo "================================================"
echo "📊 FINAL TEST SUMMARY"
echo "================================================"
PERCENTAGE=0
if [ $TOTAL_TESTS -gt 0 ]; then
    PERCENTAGE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
fi

echo ""
echo -e "Total Tests:  ${CYAN}$TOTAL_TESTS${NC}"
echo -e "Passed:       ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:       ${RED}$FAILED_TESTS${NC}"
echo -e "Success Rate: ${CYAN}${PERCENTAGE}%${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           🎉 ALL TESTS PASSED! 🎉                             ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║      ⚠️  $FAILED_TESTS TEST(S) FAILED - REVIEW REQUIRED ⚠️              ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi