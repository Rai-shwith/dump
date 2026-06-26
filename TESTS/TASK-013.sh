#!/bin/bash
set -e

API_URL="http://127.0.0.1:8787/api"

echo "=== Test 1: Each reserved keyword ==="
KEYWORDS=("admin" "api" "raw" "json" "create" "edit" "delete" "settings" "help" "docs" "host")

for KEYWORD in "${KEYWORDS[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $API_URL/clipboard -H "Content-Type: application/json" -d "{\"code\": \"$KEYWORD\", \"content\": \"test\", \"mode\": \"public\"}")
  echo "Testing keyword '$KEYWORD': status $STATUS (expect 400)"
  if [[ "$STATUS" != "400" ]]; then
    echo "Failed: Keyword '$KEYWORD' allowed"
    exit 1
  fi
done
echo "Passed: All reserved keywords blocked"

echo "=== Test 2: Short code ==="
STATUS_SHORT=$(curl -s -o /dev/null -w "%{http_code}" -X POST $API_URL/clipboard -H "Content-Type: application/json" -d '{"code": "ab", "content": "test", "mode": "public"}')
echo "Testing short code 'ab': status $STATUS_SHORT (expect 400)"
if [[ "$STATUS_SHORT" != "400" ]]; then
  echo "Failed: Short code 'ab' allowed"
  exit 1
fi
echo "Passed: Short code blocked"

echo "=== Test 3: Invalid characters ==="
STATUS_INVALID=$(curl -s -o /dev/null -w "%{http_code}" -X POST $API_URL/clipboard -H "Content-Type: application/json" -d '{"code": "test!", "content": "test", "mode": "public"}')
echo "Testing invalid chars 'test!': status $STATUS_INVALID (expect 400)"
if [[ "$STATUS_INVALID" != "400" ]]; then
  echo "Failed: Invalid chars allowed"
  exit 1
fi
echo "Passed: Invalid chars blocked"

echo "=== Test 4: Valid code ==="
STATUS_VALID=$(curl -s -o /dev/null -w "%{http_code}" -X POST $API_URL/clipboard -H "Content-Type: application/json" -d '{"code": "test-ok_1", "content": "test", "mode": "public"}')
echo "Testing valid code 'test-ok_1': status $STATUS_VALID (expect 201 or 409)"
if [[ "$STATUS_VALID" != "201" && "$STATUS_VALID" != "409" ]]; then
  echo "Failed: Valid code returned status $STATUS_VALID"
  exit 1
fi
echo "Passed: Valid code processed correctly"

echo "All tests passed!"
