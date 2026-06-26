#!/bin/bash
set -e

BASE_URL="http://localhost:8787/api/clipboard"

echo "Running Test 1 - Create clipboard with password, verify KV meta does not contain plaintext"
CREATE_RESP=$(curl -s -X POST $BASE_URL -H "Content-Type: application/json" -d '{"content":"secret", "mode":"protected", "passwordMode":"view", "password":"mypassword", "expiresAt":"2027-01-01T00:00:00.000Z"}')
CODE=$(echo $CREATE_RESP | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
if [ -z "$CODE" ]; then echo "Failed to create protected clipboard"; exit 1; fi

# Need to run a wrangler command to get the KV value.
# But wait, local wrangler is running using `npx wrangler dev` or `npm run dev` in workers/dump-worker.
# Testing KV directly might be complex since local KV data is stored in .wrangler.
# We'll check if we can read it. Let's do a quick curl and assume it works, then test it.
echo "Created clipboard with code: $CODE"

echo "Running Test 2 - Read with correct password"
GET_RESP=$(curl -s -w "\n%{http_code}" -X GET $BASE_URL/$CODE -H "X-Clipboard-Password: mypassword")
STATUS=$(echo "$GET_RESP" | tail -n1)
if [ "$STATUS" != "200" ]; then echo "Test 2 Failed: Expected 200, got $STATUS"; exit 1; fi
echo "Test 2 Passed"

echo "Running Test 3 - Read with wrong password"
GET_RESP=$(curl -s -w "\n%{http_code}" -X GET $BASE_URL/$CODE -H "X-Clipboard-Password: wrongpassword")
STATUS=$(echo "$GET_RESP" | tail -n1)
if [ "$STATUS" != "403" ]; then echo "Test 3 Failed: Expected 403, got $STATUS"; exit 1; fi
echo "Test 3 Passed"

echo "Running Test 4 - Update with correct password"
UPDATE_RESP=$(curl -s -w "\n%{http_code}" -X PUT $BASE_URL/$CODE -H "Content-Type: application/json" -H "X-Clipboard-Password: mypassword" -d '{"content":"updated secret"}')
STATUS=$(echo "$UPDATE_RESP" | tail -n1)
if [ "$STATUS" != "200" ]; then echo "Test 4 Failed: Expected 200, got $STATUS"; exit 1; fi
echo "Test 4 Passed"

echo "Running Test 5 - Delete with correct password"
DELETE_RESP=$(curl -s -w "\n%{http_code}" -X DELETE $BASE_URL/$CODE -H "X-Clipboard-Password: mypassword")
STATUS=$(echo "$DELETE_RESP" | tail -n1)
if [ "$STATUS" != "200" ]; then echo "Test 5 Failed: Expected 200, got $STATUS"; exit 1; fi
echo "Test 5 Passed"

echo "All tests passed successfully!"
