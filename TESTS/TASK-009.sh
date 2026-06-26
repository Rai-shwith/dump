#!/bin/bash
set -e

API_URL="http://localhost:8787/api"

echo "Starting TASK-009 Tests..."

echo "--- Test 1: One-time view via GET ---"
RES1=$(curl -s -X POST $API_URL/clipboard -H "Content-Type: application/json" -d '{"content": "hello world", "mode": "public", "isOneTimeView": true}')
CODE1=$(echo $RES1 | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
if [ -z "$CODE1" ]; then echo "Failed to create clipboard"; exit 1; fi
echo "Created: $CODE1"

GET1=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/clipboard/$CODE1)
if [ "$GET1" != "200" ]; then echo "Test 1 Failed: First GET returned $GET1, expected 200"; exit 1; fi

GET2=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/clipboard/$CODE1)
if [ "$GET2" != "404" ]; then echo "Test 1 Failed: Second GET returned $GET2, expected 404"; exit 1; fi
echo "Test 1 Passed"

echo "--- Test 2: One-time view via raw ---"
RES2=$(curl -s -X POST $API_URL/clipboard -H "Content-Type: application/json" -d '{"content": "hello raw", "mode": "public", "isOneTimeView": true}')
CODE2=$(echo $RES2 | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
echo "Created: $CODE2"

RAW1=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/clipboard/$CODE2/raw)
if [ "$RAW1" != "200" ]; then echo "Test 2 Failed: First GET /raw returned $RAW1, expected 200"; exit 1; fi

RAW2=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/clipboard/$CODE2/raw)
if [ "$RAW2" != "404" ]; then echo "Test 2 Failed: Second GET /raw returned $RAW2, expected 404"; exit 1; fi
echo "Test 2 Passed"

echo "--- Test 3: One-time view starred ---"
RES3=$(curl -s -X POST $API_URL/clipboard -H "Content-Type: application/json" -d '{"content": "star test", "mode": "public", "isOneTimeView": true}')
CODE3=$(echo $RES3 | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
echo "Created: $CODE3"

curl -s -X POST $API_URL/clipboard/$CODE3/star > /dev/null

GET3=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/clipboard/$CODE3)
if [ "$GET3" != "200" ]; then echo "Test 3 Failed: Read returned $GET3, expected 200"; exit 1; fi

STARRED_CHECK=$(curl -s $API_URL/starred)
if echo "$STARRED_CHECK" | grep -q "$CODE3"; then echo "Test 3 Failed: Code $CODE3 still in starred list"; exit 1; fi
echo "Test 3 Passed"

echo "--- Test 4: One-time view with view password ---"
RES4=$(curl -s -X POST $API_URL/clipboard -H "Content-Type: application/json" -d '{"content": "protected", "mode": "protected", "passwordMode": "view", "password": "mypassword", "isOneTimeView": true}')
CODE4=$(echo $RES4 | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
echo "Created: $CODE4"

# Attempt read without password (should return locked state 200, but content not read, so not deleted)
LOCKED_GET=$(curl -s $API_URL/clipboard/$CODE4)
if ! echo "$LOCKED_GET" | grep -q '"locked":true'; then echo "Test 4 Failed: Expected locked response"; exit 1; fi

# Unlock with password (should return 200 and delete)
UNLOCK_GET=$(curl -s -o /dev/null -w "%{http_code}" -H "X-Clipboard-Password: mypassword" $API_URL/clipboard/$CODE4)
if [ "$UNLOCK_GET" != "200" ]; then echo "Test 4 Failed: Unlock GET returned $UNLOCK_GET, expected 200"; exit 1; fi

# Second read with password (should return 404)
UNLOCK_GET2=$(curl -s -o /dev/null -w "%{http_code}" -H "X-Clipboard-Password: mypassword" $API_URL/clipboard/$CODE4)
if [ "$UNLOCK_GET2" != "404" ]; then echo "Test 4 Failed: Second unlock GET returned $UNLOCK_GET2, expected 404"; exit 1; fi
echo "Test 4 Passed"

echo "All tests passed successfully!"
