#!/bin/bash
set -e

BASE_URL="http://localhost:8787/api/clipboard"

echo "Running Test 1 - Create clipboard, verify ownerToken logic"
CREATE_RESP=$(curl -s -X POST $BASE_URL -H "Content-Type: application/json" -d '{"content":"test 8", "mode":"protected", "passwordMode":"view", "password":"testpassword", "expiresAt":"2027-01-01T00:00:00.000Z"}')
CODE=$(echo $CREATE_RESP | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
OWNER_TOKEN=$(echo $CREATE_RESP | grep -o '"ownerToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$CODE" ] || [ -z "$OWNER_TOKEN" ]; then 
  echo "Failed to create clipboard or missing ownerToken"
  exit 1
fi

echo "Created clipboard with code: $CODE"
echo "Owner token: $OWNER_TOKEN"

echo "Running Test 2 - Read clipboard with owner token (bypassing view password)"
GET_RESP=$(curl -s -w "\n%{http_code}" -X GET $BASE_URL/$CODE -H "X-Owner-Token: $OWNER_TOKEN")
STATUS=$(echo "$GET_RESP" | tail -n1)
if [ "$STATUS" != "200" ]; then echo "Test 2 Failed: Expected 200, got $STATUS"; exit 1; fi
echo "Test 2 Passed"

echo "Running Test 3 - Update clipboard with owner token"
UPDATE_RESP=$(curl -s -w "\n%{http_code}" -X PUT $BASE_URL/$CODE -H "Content-Type: application/json" -H "X-Owner-Token: $OWNER_TOKEN" -d '{"content":"updated content"}')
STATUS=$(echo "$UPDATE_RESP" | tail -n1)
if [ "$STATUS" != "200" ]; then echo "Test 3 Failed: Expected 200, got $STATUS"; exit 1; fi
echo "Test 3 Passed"

echo "Running Test 5 - Use wrong owner token"
WRONG_RESP=$(curl -s -w "\n%{http_code}" -X GET $BASE_URL/$CODE -H "X-Owner-Token: wrong-token-123")
STATUS=$(echo "$WRONG_RESP" | tail -n1)
BODY=$(echo "$WRONG_RESP" | head -n1)
if [[ "$BODY" != *"\"locked\":true"* ]]; then
  echo "Test 5 Failed: Expected locked response, got $BODY"
  exit 1
fi
echo "Test 5 Passed"

echo "Running Test 4 - Delete clipboard with owner token"
DELETE_RESP=$(curl -s -w "\n%{http_code}" -X DELETE $BASE_URL/$CODE -H "X-Owner-Token: $OWNER_TOKEN")
STATUS=$(echo "$DELETE_RESP" | tail -n1)
if [ "$STATUS" != "200" ]; then echo "Test 4 Failed: Expected 200, got $STATUS"; exit 1; fi
echo "Test 4 Passed"

echo "All tests passed successfully!"
