#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║           🔧 SETUP TEST ENVIRONMENT 🔧                           ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Cleanup database
echo -e "${BLUE}Step 1: Cleaning up database...${NC}"
node cleanup-db.js
echo ""

# Step 2: Create admin user
echo -e "${BLUE}Step 2: Creating admin user...${NC}"
node create-admin.js
echo ""

# Step 3: Make scripts executable (if tests folder exists)
echo -e "${BLUE}Step 3: Making test scripts executable...${NC}"
if [ -d "tests" ] && [ "$(ls -A tests/*.sh 2>/dev/null)" ]; then
  chmod +x tests/*.sh
  chmod +x run-all-tests.sh 2>/dev/null
  echo -e "${GREEN}✓ Scripts are executable${NC}"
else
  echo -e "${YELLOW}⚠ No test scripts found in tests/ folder${NC}"
  echo -e "${YELLOW}  Create test scripts first, then run: chmod +x tests/*.sh${NC}"
fi
echo ""

echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ SETUP COMPLETE! ✅                               ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Admin credentials:${NC}"
echo "  📧 Email:    admin@perari.id"
echo "  🔑 Password: Admin123!"
echo ""
echo -e "${CYAN}Next steps:${NC}"
if [ -f "run-all-tests.sh" ]; then
  echo "  ./run-all-tests.sh    # Run all tests"
else
  echo "  npm run dev           # Start development server"
  echo "  npm test              # Run tests"
fi
echo ""