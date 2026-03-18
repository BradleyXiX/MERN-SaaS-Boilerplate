#!/bin/bash

# Rate Limiting Test Script

BASE_URL="http://localhost:5000/api/auth"
TEST_EMAIL="test@example.com"
TEST_PASSWORD="Test@1234"

echo "=== Testing Rate Limiting ==="
echo ""

# Test 1: Login Rate Limiting (max 5 requests per 15 minutes)
echo "Test 1: Testing Login Rate Limiting (Limit: 5 requests/15 min per IP)"
echo "---"

for i in {1..7}; do
  echo "Request $i:"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)
  
  echo "Status: $HTTP_CODE"
  echo "Response: $BODY"
  echo ""
  
  if [ "$i" -eq 5 ]; then
    echo "Waiting for next request (after limit)..."
    sleep 1
  fi
done

echo ""
echo "Test 2: Testing Registration Rate Limiting (Limit: 5 requests/15 min per IP)"
echo "---"

for i in {1..6}; do
  echo "Request $i:"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"user$i@example.com\",\"password\":\"Test@1234\",\"confirmPassword\":\"Test@1234\"}")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)
  
  echo "Status: $HTTP_CODE"
  echo "Response: $BODY"
  echo ""
done

echo ""
echo "Test 3: Testing Password Reset Rate Limiting (Limit: 3 requests/1 hour per IP)"
echo "---"

for i in {1..4}; do
  echo "Request $i:"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/forgot-password" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\"}")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)
  
  echo "Status: $HTTP_CODE"
  echo "Response: $BODY"
  echo ""
done

echo "=== Rate Limiting Tests Complete ==="
