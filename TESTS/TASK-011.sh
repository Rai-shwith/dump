#!/bin/bash
set -e

API_URL="http://127.0.0.1:8787/api"

echo "=== Test 1: Star a public clipboard ==="
CREATE_RES=$(curl -s -X POST $API_URL/clipboard -H "Content-Type: application/json" -d "{\"content\": \"star test\", \"mode\": \"public\"}")
CODE1=$(echo $CREATE_RES | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
echo "Created code: $CODE1"

STAR_RES=$(curl -s -X POST $API_URL/clipboard/$CODE1/star)
echo "Star response: $STAR_RES"

GET_STARRED=$(curl -s $API_URL/starred)
echo "Starred list: $GET_STARRED"
if echo $GET_STARRED | grep -q $CODE1; then echo "Passed"; else echo "Failed"; fi

echo "=== Test 2: Star same clipboard again ==="
STAR_RES2=$(curl -s -X POST $API_URL/clipboard/$CODE1/star)
echo "Star response (again): $STAR_RES2"

echo "=== Test 3: Star non-public clipboard ==="
if [[ "$OSTYPE" == "darwin"* ]]; then
  NEXT_MONTH=$(date -v+30d -u +"%Y-%m-%dT%H:%M:%SZ")
else
  NEXT_MONTH=$(date -u -d "+30 days" +"%Y-%m-%dT%H:%M:%SZ")
fi
CREATE_RES2=$(curl -s -X POST $API_URL/clipboard -H "Content-Type: application/json" -d "{\"content\": \"no star\", \"mode\": \"reserved\", \"expiresAt\": \"$NEXT_MONTH\"}")
CODE2=$(echo $CREATE_RES2 | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
STAR_RES3=$(curl -s -o /dev/null -w "%{http_code}" -X POST $API_URL/clipboard/$CODE2/star)
echo "Status: $STAR_RES3 (expect 400)"

echo "=== Test 4: Star 6th clipboard (oldest dropped) ==="
# We already have $CODE1 starred. We need 5 more to push it out.
for i in {1..5}; do
  RES=$(curl -s -X POST $API_URL/clipboard -H "Content-Type: application/json" -d "{\"content\": \"fill $i\", \"mode\": \"public\"}")
  C=$(echo $RES | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
  curl -s -X POST $API_URL/clipboard/$C/star > /dev/null
done
STARRED_LIST2=$(curl -s $API_URL/starred)
echo "Starred list: $STARRED_LIST2"
if echo $STARRED_LIST2 | grep -q $CODE1; then echo "Failed, oldest not dropped"; else echo "Passed, oldest dropped"; fi

RAW_RES=$(curl -s $API_URL/clipboard/$CODE1)
echo "Original clipboard state (expect isStarred: false): $RAW_RES"

echo "=== Test 5: Unstar ==="
# Get the first code from the current starred list
TOP_CODE=$(echo $STARRED_LIST2 | grep -o '"code":"[^"]*"' | head -n 1 | cut -d'"' -f4)
echo "Unstarring $TOP_CODE"
UNSTAR_RES=$(curl -s -X DELETE $API_URL/clipboard/$TOP_CODE/star)
echo "Unstar response: $UNSTAR_RES"
STARRED_LIST3=$(curl -s $API_URL/starred)
echo "Starred list after unstar: $STARRED_LIST3"
if echo $STARRED_LIST3 | grep -q $TOP_CODE; then echo "Failed, still present"; else echo "Passed, removed"; fi

echo "=== Test 6: Lazy cleanup ==="
if [[ "$OSTYPE" == "darwin"* ]]; then
  EXPIRES_AT=$(date -v+2S -u +"%Y-%m-%dT%H:%M:%SZ")
else
  EXPIRES_AT=$(date -u -d "+2 seconds" +"%Y-%m-%dT%H:%M:%SZ")
fi
CREATE_RES_EXP=$(curl -s -X POST $API_URL/clipboard -H "Content-Type: application/json" -d "{\"content\": \"expiring star\", \"mode\": \"public\", \"expiresAt\": \"$EXPIRES_AT\"}")
EXP_CODE=$(echo $CREATE_RES_EXP | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
curl -s -X POST $API_URL/clipboard/$EXP_CODE/star > /dev/null

echo "Waiting 3 seconds for expiration..."
sleep 3
STARRED_LIST4=$(curl -s $API_URL/starred)
echo "Starred list after expiration: $STARRED_LIST4"
if echo $STARRED_LIST4 | grep -q $EXP_CODE; then echo "Failed, still present"; else echo "Passed, cleaned up"; fi

echo "All tests completed."
