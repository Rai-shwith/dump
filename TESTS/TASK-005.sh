#!/bin/bash
set -e

API_URL="http://localhost:8787/api/clipboard"

echo "=== Test 0: Create initial clipboards ==="
# Future date 1 month from now
if date --version >/dev/null 2>&1; then
  VALID_DATE=$(date -u -d "+1 month" +"%Y-%m-%dT%H:%M:%SZ")
else
  VALID_DATE=$(date -u -v+1m +"%Y-%m-%dT%H:%M:%SZ")
fi

RES=$(curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"initial\", \"mode\": \"protected\", \"passwordMode\": \"edit\", \"password\": \"editpwd\", \"expiresAt\": \"$VALID_DATE\"}")


CODE=$(echo $RES | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
TOKEN=$(echo $RES | grep -o '"ownerToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$CODE" ]; then
  echo "Failed to create clipboard"
  echo $RES
  exit 1
fi
echo "Created clipboard: $CODE"

echo "=== Test 1: Update content ==="
curl -s -X PUT $API_URL/$CODE \
  -H "Content-Type: application/json" \
  -H "X-Owner-Token: $TOKEN" \
  -d '{"content": "updated content"}' > /dev/null

RES_GET=$(curl -s $API_URL/$CODE -H "X-Owner-Token: $TOKEN")
echo $RES_GET | grep -q "updated content" || (echo "Test 1 failed. Output: $RES_GET" && exit 1)
echo "Test 1 passed"

echo "=== Test 2: Update with wrong edit password ==="
RES_403=$(curl -s -o /dev/null -w "%{http_code}" -X PUT $API_URL/$CODE \
  -H "Content-Type: application/json" \
  -H "X-Clipboard-Password: wrong" \
  -d '{"content": "new"}')

if [ "$RES_403" != "403" ]; then
  echo "Test 2 failed, expected 403 got $RES_403"
  exit 1
fi
echo "Test 2 passed"

echo "=== Test 3: Update with owner token bypassing edit password ==="
RES_200=$(curl -s -o /dev/null -w "%{http_code}" -X PUT $API_URL/$CODE \
  -H "Content-Type: application/json" \
  -H "X-Owner-Token: $TOKEN" \
  -d '{"content": "new owner content"}')

if [ "$RES_200" != "200" ]; then
  echo "Test 3 failed, expected 200 got $RES_200"
  exit 1
fi
echo "Test 3 passed"

echo "=== Test 4: Update expiration beyond 1 year ==="
# GNU date vs BSD date for +2 years
if date --version >/dev/null 2>&1; then
  FUTURE_DATE=$(date -u -d "+2 years" +"%Y-%m-%dT%H:%M:%SZ")
else
  FUTURE_DATE=$(date -u -v+2y +"%Y-%m-%dT%H:%M:%SZ")
fi

RES_400=$(curl -s -o /dev/null -w "%{http_code}" -X PUT $API_URL/$CODE \
  -H "Content-Type: application/json" \
  -H "X-Owner-Token: $TOKEN" \
  -d "{\"expiresAt\": \"$FUTURE_DATE\"}")

if [ "$RES_400" != "400" ]; then
  echo "Test 4 failed, expected 400 got $RES_400"
  exit 1
fi
echo "Test 4 passed"

echo "=== Test 5: Update nonexistent clipboard ==="
RES_404=$(curl -s -o /dev/null -w "%{http_code}" -X PUT $API_URL/doesnotexist123 \
  -H "Content-Type: application/json" \
  -d '{"content": "test"}')

if [ "$RES_404" != "404" ]; then
  echo "Test 5 failed, expected 404 got $RES_404"
  exit 1
fi
echo "Test 5 passed"

echo "All tests passed successfully!"
