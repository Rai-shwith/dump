#!/bin/bash
set -e

API_URL="http://127.0.0.1:8787/api/clipboard"

echo "=== Test 1: Expiration in 2 seconds ==="
if [[ "$OSTYPE" == "darwin"* ]]; then
  EXPIRES_AT=$(date -v+2S -u +"%Y-%m-%dT%H:%M:%SZ")
else
  EXPIRES_AT=$(date -u -d "+2 seconds" +"%Y-%m-%dT%H:%M:%SZ")
fi

echo "Creating clipboard expiring at $EXPIRES_AT"
CREATE_RES=$(curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"short lived\", \"mode\": \"public\", \"expiresAt\": \"$EXPIRES_AT\"}")

CODE=$(echo $CREATE_RES | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
echo "Created code: $CODE"

echo "Reading immediately..."
READ_RES=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/$CODE)
echo "Status: $READ_RES (expect 200)"

echo "Waiting 3 seconds..."
sleep 3

echo "Reading again..."
READ_RES2=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/$CODE)
echo "Status: $READ_RES2 (expect 404)"


echo "=== Test 2: Past expiration ==="
CREATE_RES2=$(curl -s -o /dev/null -w "%{http_code}" -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"past\", \"mode\": \"public\", \"expiresAt\": \"2020-01-01T00:00:00Z\"}")
echo "Status: $CREATE_RES2 (expect 400)"

echo "=== Test 3: Expiration > 1 year ==="
if [[ "$OSTYPE" == "darwin"* ]]; then
  FAR_FUTURE=$(date -v+400d -u +"%Y-%m-%dT%H:%M:%SZ")
else
  FAR_FUTURE=$(date -u -d "+400 days" +"%Y-%m-%dT%H:%M:%SZ")
fi

CREATE_RES3=$(curl -s -o /dev/null -w "%{http_code}" -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"future\", \"mode\": \"reserved\", \"expiresAt\": \"$FAR_FUTURE\"}")
echo "Status: $CREATE_RES3 (expect 400)"

echo "=== Test 4: Permanent public clipboard ==="
CREATE_RES4=$(curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"permanent\", \"mode\": \"public\"}")
CODE4=$(echo $CREATE_RES4 | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
echo "Created code: $CODE4"

echo "Reading permanent clipboard..."
READ_RES4=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/$CODE4)
echo "Status: $READ_RES4 (expect 200)"

echo "All tests completed."
