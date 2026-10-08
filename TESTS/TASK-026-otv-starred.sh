#!/bin/bash
set -e

BASE_URL="http://localhost:8787/api"

echo "=== Test 1: Create public one-time view clipboard ==="
RESP1=$(curl -s -X POST $BASE_URL/clipboard -H "Content-Type: application/json" -d '{
  "content": "Secret OTV content",
  "mode": "public",
  "isOneTimeView": true
}')

CODE1=$(echo $RESP1 | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
IS_OTV1=$(echo $RESP1 | grep -o '"isOneTimeView":true')
if [ -z "$CODE1" ] || [ -z "$IS_OTV1" ]; then
  echo "Failed 1: Could not create public OTV clipboard. Response: $RESP1"
  exit 1
fi
echo "Created OTV clipboard: $CODE1"

echo "=== Test 2: Star the OTV clipboard ==="
STAR_RESP1=$(curl -s -X POST $BASE_URL/clipboard/$CODE1/star)
if [[ "$STAR_RESP1" != *"\"success\":true"* ]] || [[ "$STAR_RESP1" != *"\"isStarred\":true"* ]]; then
  echo "Failed 2: Could not star OTV clipboard. Response: $STAR_RESP1"
  exit 1
fi
echo "Successfully starred OTV clipboard: $CODE1"

echo "=== Test 3: Verify OTV clipboard appears in global starred list ==="
STARRED_LIST=$(curl -s $BASE_URL/starred)
if [[ "$STARRED_LIST" != *"$CODE1"* ]] || [[ "$STARRED_LIST" != *"\"isOneTimeView\":true"* ]]; then
  echo "Failed 3: OTV clipboard not found in starred list. Response: $STARRED_LIST"
  exit 1
fi
echo "OTV clipboard present in starred list with isOneTimeView: true"

echo "=== Test 4: Read OTV clipboard (burn it) ==="
READ_RESP=$(curl -s $BASE_URL/clipboard/$CODE1)
if [[ "$READ_RESP" != *"Secret OTV content"* ]]; then
  echo "Failed 4: Could not read content. Response: $READ_RESP"
  exit 1
fi
echo "Successfully read content: $READ_RESP"

echo "=== Test 5: Verify OTV clipboard is deleted and removed from starred ==="
READ_AFTER=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/clipboard/$CODE1)
if [ "$READ_AFTER" != "404" ]; then
  echo "Failed 5a: Expected 404 after one-time view read, got $READ_AFTER"
  exit 1
fi
echo "Confirmed clipboard is 404"

STARRED_AFTER=$(curl -s $BASE_URL/starred)
if [[ "$STARRED_AFTER" == *"$CODE1"* ]]; then
  echo "Failed 5b: OTV clipboard still in starred list after being burned. Response: $STARRED_AFTER"
  exit 1
fi
echo "Confirmed clipboard is removed from global starred list"

echo "=== Test 6: Create protected one-time view clipboard and star it ==="
RESP2=$(curl -s -X POST $BASE_URL/clipboard -H "Content-Type: application/json" -d '{
  "content": "Protected OTV content",
  "mode": "protected",
  "viewPassword": "mypassword123",
  "isOneTimeView": true
}')

CODE2=$(echo $RESP2 | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
if [ -z "$CODE2" ]; then
  echo "Failed 6a: Could not create protected OTV clipboard. Response: $RESP2"
  exit 1
fi

STAR_RESP2=$(curl -s -X POST $BASE_URL/clipboard/$CODE2/star)
if [[ "$STAR_RESP2" != *"\"success\":true"* ]]; then
  echo "Failed 6b: Could not star protected OTV clipboard. Response: $STAR_RESP2"
  exit 1
fi
echo "Successfully starred protected OTV clipboard: $CODE2"

# Read with view password -> burns it
READ_PROT=$(curl -s -H "X-Clipboard-View-Password: mypassword123" $BASE_URL/clipboard/$CODE2)
if [[ "$READ_PROT" != *"Protected OTV content"* ]]; then
  echo "Failed 6c: Could not read protected content. Response: $READ_PROT"
  exit 1
fi

# Verify removed from starred
STARRED_AFTER2=$(curl -s $BASE_URL/starred)
if [[ "$STARRED_AFTER2" == *"$CODE2"* ]]; then
  echo "Failed 6d: Protected OTV clipboard still in starred after reading. Response: $STARRED_AFTER2"
  exit 1
fi
echo "Confirmed protected OTV clipboard burned and removed from starred"

echo "ALL OTV STARRED TESTS PASSED!"
