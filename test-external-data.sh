#!/bin/bash

# Test External Data API Endpoints
# Usage: ./test-external-data.sh

BASE_URL="http://localhost:3000/api/v1/external-data"

echo "========================================="
echo "Testing External Data API Endpoints"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test health endpoint
echo -e "${YELLOW}1. Testing Health Endpoint${NC}"
echo "GET ${BASE_URL}/health"
response=$(curl -s -w "\n%{http_code}" "${BASE_URL}/health")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" == "200" ]; then
  echo -e "${GREEN}✓ Status: $http_code${NC}"
  echo "$body" | jq '.'
else
  echo -e "${RED}✗ Status: $http_code${NC}"
  echo "$body"
fi
echo ""

# Test each category endpoint
categories=("pancasila" "uud1945" "kuhp" "kuhperdata" "kuhd" "kuhap")
count=2

for category in "${categories[@]}"; do
  echo -e "${YELLOW}${count}. Testing ${category^} Endpoint${NC}"
  echo "GET ${BASE_URL}/${category}"

  response=$(curl -s -w "\n%{http_code}" "${BASE_URL}/${category}")
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" == "200" ]; then
    echo -e "${GREEN}✓ Status: $http_code${NC}"

    # Parse and display info
    success=$(echo "$body" | jq -r '.success')
    data_length=$(echo "$body" | jq '.data | length')
    timestamp=$(echo "$body" | jq -r '.timestamp')

    echo "  Success: $success"
    echo "  Data items: $data_length"
    echo "  Timestamp: $timestamp"

    # Show first item preview
    echo "  First item preview:"
    echo "$body" | jq '.data[0]' | head -15
  else
    echo -e "${RED}✗ Status: $http_code${NC}"
    echo "$body"
  fi
  echo ""

  ((count++))
done

echo "========================================="
echo "Test Summary"
echo "========================================="
echo "Total endpoints tested: 7 (1 health + 6 categories)"
echo ""
echo "If all tests show ✓ Status: 200, the API is working correctly!"
echo ""
echo "To test the frontend, visit:"
echo "  http://localhost:3001/referensi-hukum"
echo ""
