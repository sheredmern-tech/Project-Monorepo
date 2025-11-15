#!/bin/bash

# ============================================================================
# FILE: 00-prerequisites.sh - Setup Prerequisites for Testing
# ============================================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

API_URL="http://localhost:3000/api/v1"

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║              🔧 TEST PREREQUISITES CHECKER 🔧                   ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# CHECK 1: Server Running
# ============================================================================
echo -e "${BLUE}━━━ Checking if server is running ━━━${NC}"

response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")

if [ "$response" = "200" ] || [ "$response" = "404" ]; then
    echo -e "${GREEN}✓${NC} Server is running on localhost:3000"
else
    echo -e "${RED}✗${NC} Server is NOT running"
    echo -e "${YELLOW}Please start the server with: npm run start:dev${NC}"
    exit 1
fi

echo ""

# ============================================================================
# CHECK 2: Database Connection
# ============================================================================
echo -e "${BLUE}━━━ Checking database connection ━━━${NC}"

# Try to access any endpoint (even 404 means server is up)
db_check=$(curl -s "$API_URL/health" 2>&1)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Database connection OK"
else
    echo -e "${RED}✗${NC} Database connection failed"
    echo -e "${YELLOW}Please check your database configuration${NC}"
    exit 1
fi

echo ""

# ============================================================================
# CHECK 3: Admin Account Exists
# ============================================================================
echo -e "${BLUE}━━━ Checking admin account ━━━${NC}"

admin_login=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@perari.id","password":"Admin123!"}')

# FIX: Token ada di .data.access_token
admin_token=$(echo "$admin_login" | jq -r '.data.access_token // .access_token // empty')

if [ -n "$admin_token" ] && [ "$admin_token" != "null" ]; then
    echo -e "${GREEN}✓${NC} Admin account exists and working"
    echo -e "  ${CYAN}→ Email: admin@perari.id${NC}"
    echo -e "  ${CYAN}→ Token obtained successfully${NC}"
    echo -e "  ${CYAN}→ Token: ${admin_token:0:50}...${NC}"
else
    echo -e "${RED}✗${NC} Admin account not found or credentials wrong"
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}SOLUTION: Run database seeding${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "Run these commands:"
    echo -e "${CYAN}1. npm run seed${NC}        # Seed database with default data"
    echo -e "${CYAN}2. ./00-prerequisites.sh${NC}  # Re-run this check"
    echo ""
    echo "Debug info:"
    echo "$admin_login" | jq '.'
    exit 1
fi

echo ""

# ============================================================================
# CHECK 4: Required Dependencies
# ============================================================================
echo -e "${BLUE}━━━ Checking required dependencies ━━━${NC}"

# Check jq
if command -v jq &> /dev/null; then
    echo -e "${GREEN}✓${NC} jq is installed"
else
    echo -e "${RED}✗${NC} jq is NOT installed"
    echo -e "${YELLOW}Install with: brew install jq (macOS) or apt-get install jq (Linux)${NC}"
    exit 1
fi

# Check curl
if command -v curl &> /dev/null; then
    echo -e "${GREEN}✓${NC} curl is installed"
else
    echo -e "${RED}✗${NC} curl is NOT installed"
    exit 1
fi

echo ""

# ============================================================================
# CHECK 5: Test User Accounts (Optional)
# ============================================================================
echo -e "${BLUE}━━━ Checking test accounts ━━━${NC}"

# Check if test accounts already exist
test_staff=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"staff.test@perari.id","password":"Staff123!"}')

staff_token=$(echo "$test_staff" | jq -r '.data.access_token // .access_token // empty')

if [ -n "$staff_token" ] && [ "$staff_token" != "null" ]; then
    echo -e "${YELLOW}⚠${NC}  Test accounts already exist (will be reused)"
    echo -e "  ${CYAN}→ staff.test@perari.id${NC}"
else
    echo -e "${GREEN}✓${NC} Test accounts ready to be created"
fi

echo ""

# ============================================================================
# FINAL SUMMARY
# ============================================================================
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    ✅ ALL CHECKS PASSED ✅                      ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}You are ready to run the tests!${NC}"
echo ""
echo -e "Available test suites:"
echo -e "${CYAN}  ./01-api-security.sh${NC}            # API security tests"
echo -e "${CYAN}  ./02-auth-flow.sh${NC}               # Authentication flow tests"
echo -e "${CYAN}  ./03-crud-operations.sh${NC}         # CRUD operations tests"
echo -e "${CYAN}  ./04-permissions.sh${NC}             # Basic RBAC tests"
echo -e "${CYAN}  ./05-rbac-comprehensive.sh${NC}      # Complete RBAC test suite"
echo ""
echo -e "Or run all tests:"
echo -e "${CYAN}  ./run-all-tests.sh${NC}              # Run all API tests"
echo ""

exit 0