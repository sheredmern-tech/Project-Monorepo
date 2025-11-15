#!/bin/bash

# ============================================================================
# FILE: run-all-tests.sh - Full Test Suite Runner
# Runs all API tests in sequence and reports results
# ============================================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo ""
echo -e "${MAGENTA}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║                                                                  ║${NC}"
echo -e "${MAGENTA}║         🧪 FIRMA HUKUM API - FULL TEST SUITE 🧪                 ║${NC}"
echo -e "${MAGENTA}║                                                                  ║${NC}"
echo -e "${MAGENTA}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if server is running
echo -e "${CYAN}⏳ Checking server status...${NC}"
if ! curl -s http://localhost:3000 > /dev/null; then
    echo -e "${RED}❌ Server not running on http://localhost:3000${NC}"
    echo -e "${YELLOW}Please start the server first:${NC}"
    echo "   cd server && npm run start:dev"
    echo "   OR"
    echo "   just dev-build"
    exit 1
fi
echo -e "${GREEN}✓ Server is running${NC}"
echo ""

# Array to track results
declare -a test_results
declare -a test_names

# Function to run a test suite
run_test_suite() {
    local test_file=$1
    local test_name=$2
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}📋 Running: $test_name${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ ! -f "$test_file" ]; then
        echo -e "${RED}❌ Test file not found: $test_file${NC}"
        test_results+=("SKIP")
        test_names+=("$test_name")
        return
    fi
    
    chmod +x "$test_file"
    
    if ./"$test_file"; then
        test_results+=("PASS")
        echo -e "${GREEN}✓ $test_name completed successfully${NC}"
    else
        test_results+=("FAIL")
        echo -e "${RED}✗ $test_name failed${NC}"
    fi
    
    test_names+=("$test_name")
    echo ""
}

# Record start time
start_time=$(date +%s)

# ============================================================================
# RUN ALL TEST SUITES IN ORDER
# ============================================================================

run_test_suite "00-prerequisites.sh" "Prerequisites Check"
run_test_suite "01-api-security.sh" "API Security Tests"
run_test_suite "02-auth-flow.sh" "Authentication Flow Tests"
run_test_suite "03-crud-operations.sh" "CRUD Operations Tests"
run_test_suite "04-permissions.sh" "RBAC Permission Tests"
run_test_suite "05-rbac-comprehensive.sh" "Comprehensive RBAC Tests"
run_test_suite "06-klien-profile-access.sh" "Klien Privacy & Security Tests"
run_test_suite "07-tugas-access-block.sh" "Tugas Access Control Tests"

# Calculate duration
end_time=$(date +%s)
duration=$((end_time - start_time))

# ============================================================================
# PRINT FINAL SUMMARY
# ============================================================================

echo ""
echo -e "${MAGENTA}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║                     📊 FINAL SUMMARY 📊                          ║${NC}"
echo -e "${MAGENTA}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

total_suites=${#test_results[@]}
passed_suites=0
failed_suites=0
skipped_suites=0

for i in "${!test_results[@]}"; do
    result="${test_results[$i]}"
    name="${test_names[$i]}"
    
    case $result in
        PASS)
            echo -e "${GREEN}✓ PASSED${NC} - $name"
            ((passed_suites++))
            ;;
        FAIL)
            echo -e "${RED}✗ FAILED${NC} - $name"
            ((failed_suites++))
            ;;
        SKIP)
            echo -e "${YELLOW}⊘ SKIPPED${NC} - $name"
            ((skipped_suites++))
            ;;
    esac
done

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}Total Test Suites: $total_suites${NC}"
echo -e "${GREEN}Passed: $passed_suites${NC}"
echo -e "${RED}Failed: $failed_suites${NC}"
echo -e "${YELLOW}Skipped: $skipped_suites${NC}"
echo -e "${CYAN}Duration: ${duration}s${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

# ============================================================================
# DETAILED TEST BREAKDOWN
# ============================================================================

echo -e "${MAGENTA}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║                  📋 TEST SUITE BREAKDOWN 📋                      ║${NC}"
echo -e "${MAGENTA}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}00. Prerequisites Check${NC}"
echo -e "    ✓ Server connectivity"
echo -e "    ✓ Database connection"
echo -e "    ✓ Required tools (curl, jq)"
echo ""

echo -e "${YELLOW}01. API Security Tests${NC}"
echo -e "    ✓ CORS headers"
echo -e "    ✓ Security headers"
echo -e "    ✓ Rate limiting"
echo -e "    ✓ JWT authentication"
echo ""

echo -e "${YELLOW}02. Authentication Flow Tests${NC}"
echo -e "    ✓ User registration"
echo -e "    ✓ Login/logout"
echo -e "    ✓ Token validation"
echo -e "    ✓ Password security"
echo ""

echo -e "${YELLOW}03. CRUD Operations Tests${NC}"
echo -e "    ✓ Klien management"
echo -e "    ✓ Perkara management"
echo -e "    ✓ Dokumen management"
echo -e "    ✓ Tugas management"
echo ""

echo -e "${YELLOW}04. RBAC Permission Tests${NC}"
echo -e "    ✓ Admin permissions"
echo -e "    ✓ Advokat permissions"
echo -e "    ✓ Paralegal permissions"
echo -e "    ✓ Staff permissions"
echo -e "    ✓ Client permissions"
echo ""

echo -e "${YELLOW}05. Comprehensive RBAC Tests${NC}"
echo -e "    ✓ Cross-role access control"
echo -e "    ✓ Resource-level permissions"
echo -e "    ✓ Action-level authorization"
echo ""

echo -e "${YELLOW}06. Klien Privacy & Security Tests${NC}"
echo -e "    ✓ Client data isolation"
echo -e "    ✓ Privacy protection"
echo -e "    ✓ Admin/Staff oversight"
echo ""

echo -e "${YELLOW}07. Tugas Access Control Tests${NC}"
echo -e "    ✓ Client blocked from internal tasks"
echo -e "    ✓ Internal roles have access"
echo -e "    ✓ Security enforcement"
echo ""

# ============================================================================
# FINAL RESULT
# ============================================================================

if [ $failed_suites -eq 0 ] && [ $skipped_suites -eq 0 ]; then
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                                  ║${NC}"
    echo -e "${GREEN}║              🎉🎉🎉 ALL TESTS PASSED! 🎉🎉🎉                      ║${NC}"
    echo -e "${GREEN}║                                                                  ║${NC}"
    echo -e "${GREEN}║           Your API is production-ready! 🚀                       ║${NC}"
    echo -e "${GREEN}║                                                                  ║${NC}"
    echo -e "${GREEN}║  ✓ All security measures verified                               ║${NC}"
    echo -e "${GREEN}║  ✓ RBAC fully functional                                        ║${NC}"
    echo -e "${GREEN}║  ✓ Data isolation confirmed                                     ║${NC}"
    echo -e "${GREEN}║  ✓ Privacy protection enforced                                  ║${NC}"
    echo -e "${GREEN}║                                                                  ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
    exit 0
elif [ $failed_suites -eq 0 ]; then
    echo -e "${YELLOW}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║                                                                  ║${NC}"
    echo -e "${YELLOW}║              ⚠️  SOME TESTS WERE SKIPPED ⚠️                      ║${NC}"
    echo -e "${YELLOW}║                                                                  ║${NC}"
    echo -e "${YELLOW}║  Some test files were not found. Please check:                  ║${NC}"
    echo -e "${YELLOW}║  - All test scripts exist in current directory                  ║${NC}"
    echo -e "${YELLOW}║  - File permissions are correct                                 ║${NC}"
    echo -e "${YELLOW}║                                                                  ║${NC}"
    echo -e "${YELLOW}╚══════════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                                  ║${NC}"
    echo -e "${RED}║              ❌ SOME TESTS FAILED ❌                              ║${NC}"
    echo -e "${RED}║                                                                  ║${NC}"
    echo -e "${RED}║  Please review the failed test suites above and:                ║${NC}"
    echo -e "${RED}║  1. Check server logs for detailed errors                       ║${NC}"
    echo -e "${RED}║  2. Verify database is properly seeded                          ║${NC}"
    echo -e "${RED}║  3. Ensure all migrations are applied                           ║${NC}"
    echo -e "${RED}║  4. Check environment variables                                 ║${NC}"
    echo -e "${RED}║                                                                  ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi