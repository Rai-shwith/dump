#!/bin/bash
set -e

API_URL="http://127.0.0.1:8787/api"

echo "=== Test 1: Raw read public clipboard ==="
CREATE_RES=$(curl -s -X POST $API_URL/clipboard -H "Content-Type: application/json" -d '{"content": "raw content test", "mode": "public"}')
CODE1=$(echo $CREATE_RES | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
echo "Created code: $CODE1"

RAW_RES=$(curl -s -D - $API_URL/clipboard/$CODE1/raw)
if echo "$RAW_RES" | grep -qi "content-type: text/plain"; then
  echo "Passed: Content-Type is text/plain"
else
  echo "Failed: Content-Type is not text/plain"
  exit 1
fi
if echo "$RAW_RES" | tail -n 1 | grep -q "raw content test"; then
  echo "Passed: Content is plain text"
else
  echo "Failed: Content mismatch"
  exit 1
fi

echo "=== Test 2: Raw read with view password ==="
if [[ "$OSTYPE" == "darwin"* ]]; then
  NEXT_MONTH=$(date -v+30d -u +"%Y-%m-%dT%H:%M:%SZ")
else
  NEXT_MONTH=$(date -u -d "+30 days" +"%Y-%m-%dT%H:%M:%SZ")
fi
CREATE_RES2=$(curl -s -X POST $API_URL/clipboard -H "Content-Type: application/json" -d "{\"content\": \"protected raw content\", \"mode\": \"protected\", \"passwordMode\": \"view\", \"password\": \"secret123\", \"expiresAt\": \"$NEXT_MONTH\"}")
CODE2=$(echo $CREATE_RES2 | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
echo "Created protected code: $CODE2"

RAW_LOCKED=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/clipboard/$CODE2/raw)
echo "Status without password: $RAW_LOCKED (expect 403)"
if [[ "$RAW_LOCKED" == "403" ]]; then echo "Passed"; else echo "Failed"; exit 1; fi

RAW_UNLOCKED=$(curl -s -H "X-Clipboard-Password: secret123" $API_URL/clipboard/$CODE2/raw)
if [[ "$RAW_UNLOCKED" == "protected raw content" ]]; then
  echo "Passed: Expected content returned"
else
  echo "Failed: Content mismatch: $RAW_UNLOCKED"
  exit 1
fi

echo "=== Test 3: Raw read expired clipboard ==="
if [[ "$OSTYPE" == "darwin"* ]]; then
  EXPIRES_AT=$(date -v+2S -u +"%Y-%m-%dT%H:%M:%SZ")
else
  EXPIRES_AT=$(date -u -d "+2 seconds" +"%Y-%m-%dT%H:%M:%SZ")
fi
CREATE_RES3=$(curl -s -X POST $API_URL/clipboard -H "Content-Type: application/json" -d "{\"content\": \"expiring raw\", \"mode\": \"public\", \"expiresAt\": \"$EXPIRES_AT\"}")
CODE3=$(echo $CREATE_RES3 | grep -o '"code":"[^"]*"' | cut -d'"' -f4)

echo "Waiting 3 seconds for expiration..."
sleep 3
RAW_EXP=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/clipboard/$CODE3/raw)
echo "Status: $RAW_EXP (expect 404)"
if [[ "$RAW_EXP" == "404" ]]; then echo "Passed"; else echo "Failed"; exit 1; fi

echo "=== Test 4: Raw one-time view ==="
CREATE_RES4=$(curl -s -X POST $API_URL/clipboard -H "Content-Type: application/json" -d '{"content": "one time raw", "mode": "public", "isOneTimeView": true}')
CODE4=$(echo $CREATE_RES4 | grep -o '"code":"[^"]*"' | cut -d'"' -f4)

RAW_FIRST=$(curl -s $API_URL/clipboard/$CODE4/raw)
if [[ "$RAW_FIRST" == "one time raw" ]]; then
  echo "Passed: First request returned content"
else
  echo "Failed: First request returned: $RAW_FIRST"
  exit 1
fi

RAW_SECOND=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/clipboard/$CODE4/raw)
echo "Status on second request: $RAW_SECOND (expect 404)"
if [[ "$RAW_SECOND" == "404" ]]; then echo "Passed"; else echo "Failed"; exit 1; fi

echo "All tests passed!"
