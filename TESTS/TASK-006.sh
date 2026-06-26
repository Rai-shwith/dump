#!/bin/bash
set -e

BASE_URL="http://localhost:8787/api/clipboard"

echo "Running Test 1 - Delete public clipboard"
CREATE_RESP=$(curl -s -X POST $BASE_URL -H "Content-Type: application/json" -d '{"content":"test1", "mode":"public"}')
CODE=$(echo $CREATE_RESP | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
if [ -z "$CODE" ]; then echo "Failed to create public clipboard"; exit 1; fi

DELETE_RESP=$(curl -s -w "\n%{http_code}" -X DELETE $BASE_URL/$CODE)
STATUS=$(echo "$DELETE_RESP" | tail -n1)
if [ "$STATUS" != "200" ]; then echo "Test 1 Failed: Expected 200, got $STATUS"; exit 1; fi

GET_RESP=$(curl -s -w "\n%{http_code}" -X GET $BASE_URL/$CODE)
STATUS=$(echo "$GET_RESP" | tail -n1)
if [ "$STATUS" != "404" ]; then echo "Test 1 Failed: Expected 404 on GET, got $STATUS"; exit 1; fi
echo "Test 1 Passed"

echo "Running Test 2 - Delete protected clipboard without credentials"
CREATE_RESP=$(curl -s -X POST $BASE_URL -H "Content-Type: application/json" -d '{"content":"test2", "mode":"protected", "passwordMode":"view", "password":"password", "expiresAt":"2027-01-01T00:00:00.000Z"}')
CODE=$(echo $CREATE_RESP | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
if [ -z "$CODE" ]; then echo "Failed to create protected clipboard"; exit 1; fi

DELETE_RESP=$(curl -s -w "\n%{http_code}" -X DELETE $BASE_URL/$CODE)
STATUS=$(echo "$DELETE_RESP" | tail -n1)
if [ "$STATUS" != "403" ]; then echo "Test 2 Failed: Expected 403, got $STATUS"; exit 1; fi
echo "Test 2 Passed"

echo "Running Test 3 - Delete protected clipboard with owner token"
OWNER_TOKEN=$(echo $CREATE_RESP | grep -o '"ownerToken":"[^"]*"' | cut -d'"' -f4)
if [ -z "$OWNER_TOKEN" ]; then echo "Failed to get owner token"; exit 1; fi

DELETE_RESP=$(curl -s -w "\n%{http_code}" -X DELETE $BASE_URL/$CODE -H "X-Owner-Token: $OWNER_TOKEN")
STATUS=$(echo "$DELETE_RESP" | tail -n1)
if [ "$STATUS" != "200" ]; then echo "Test 3 Failed: Expected 200, got $STATUS"; exit 1; fi
echo "Test 3 Passed"

echo "Test 4 is skipped since star endpoints are not implemented yet (TASK-011)."
echo "All tests passed successfully!"
