#!/bin/bash
set -e

BASE_URL="http://localhost:8787/api/clipboard"

echo "=== Test 1: Clipboard with ONLY View Password ==="
CREATE_RESP=$(curl -s -X POST $BASE_URL -H "Content-Type: application/json" -d '{
  "content": "View-only secret content",
  "mode": "protected",
  "viewPassword": "viewpassword123",
  "expiresAt": "2027-01-01T00:00:00.000Z"
}')
CODE1=$(echo $CREATE_RESP | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
OWNER1=$(echo $CREATE_RESP | grep -o '"ownerToken":"[^"]*"' | cut -d'"' -f4)

echo "Created clipboard: $CODE1"

# 1a: Read without password -> must return locked: true, requiresViewPassword: true
LOCKED_RESP=$(curl -s $BASE_URL/$CODE1)
if [[ "$LOCKED_RESP" != *"\"locked\":true"* ]] || [[ "$LOCKED_RESP" != *"\"requiresViewPassword\":true"* ]]; then
  echo "Failed 1a: Expected locked response, got $LOCKED_RESP"
  exit 1
fi
echo "1a passed: Correctly locked with requiresViewPassword: true"

# 1b: Read with wrong password -> must return 403
WRONG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "X-Clipboard-View-Password: wrong" $BASE_URL/$CODE1)
if [ "$WRONG_STATUS" != "403" ]; then
  echo "Failed 1b: Expected 403 for wrong password, got $WRONG_STATUS"
  exit 1
fi
echo "1b passed: 403 on wrong view password"

# 1c: Read with correct password (X-Clipboard-View-Password) -> 200 and content
READ_RESP=$(curl -s -H "X-Clipboard-View-Password: viewpassword123" $BASE_URL/$CODE1)
if [[ "$READ_RESP" != *"View-only secret content"* ]] || [[ "$READ_RESP" != *"\"hasViewPassword\":true"* ]] || [[ "$READ_RESP" != *"\"hasEditPassword\":false"* ]]; then
  echo "Failed 1c: Expected unlocked content with flags, got $READ_RESP"
  exit 1
fi
echo "1c passed: Successfully unlocked with view password"

# 1d: Update without edit password -> succeeds because no edit password was set
UPD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PUT $BASE_URL/$CODE1 -H "Content-Type: application/json" -d '{"content": "Updated public view content"}')
if [ "$UPD_STATUS" != "200" ]; then
  echo "Failed 1d: Expected 200 for update without edit password, got $UPD_STATUS"
  exit 1
fi
echo "1d passed: Content updated freely without edit password"

# 1e: Delete without edit password -> succeeds because no edit password was set
DEL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE $BASE_URL/$CODE1)
if [ "$DEL_STATUS" != "200" ]; then
  echo "Failed 1e: Expected 200 for delete, got $DEL_STATUS"
  exit 1
fi
echo "1e passed: Deleted freely without edit password"

echo ""
echo "=== Test 2: Clipboard with ONLY Edit Password ==="
CREATE_RESP2=$(curl -s -X POST $BASE_URL -H "Content-Type: application/json" -d '{
  "content": "Edit-only protected content",
  "mode": "protected",
  "editPassword": "editpassword456",
  "expiresAt": "2027-01-01T00:00:00.000Z"
}')
CODE2=$(echo $CREATE_RESP2 | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
OWNER2=$(echo $CREATE_RESP2 | grep -o '"ownerToken":"[^"]*"' | cut -d'"' -f4)

# 2a: Read without password -> 200 immediately! (public view, hasEditPassword: true, hasViewPassword: false)
READ_RESP2=$(curl -s $BASE_URL/$CODE2)
if [[ "$READ_RESP2" != *"Edit-only protected content"* ]] || [[ "$READ_RESP2" != *"\"hasEditPassword\":true"* ]] || [[ "$READ_RESP2" != *"\"hasViewPassword\":false"* ]]; then
  echo "Failed 2a: Expected public view with hasEditPassword: true, got $READ_RESP2"
  exit 1
fi
echo "2a passed: Publicly viewable immediately"

# 2b: Update without password -> 403
NO_PW_UPD=$(curl -s -o /dev/null -w "%{http_code}" -X PUT $BASE_URL/$CODE2 -H "Content-Type: application/json" -d '{"content": "Hacked content"}')
if [ "$NO_PW_UPD" != "403" ]; then
  echo "Failed 2b: Expected 403 on update without edit password, got $NO_PW_UPD"
  exit 1
fi
echo "2b passed: 403 on update without edit password"

# 2c: Update with wrong password -> 403
WRONG_UPD=$(curl -s -o /dev/null -w "%{http_code}" -X PUT $BASE_URL/$CODE2 -H "Content-Type: application/json" -H "X-Clipboard-Edit-Password: wrong" -d '{"content": "Hacked content"}')
if [ "$WRONG_UPD" != "403" ]; then
  echo "Failed 2c: Expected 403 on update with wrong edit password, got $WRONG_UPD"
  exit 1
fi
echo "2c passed: 403 on update with wrong edit password"

# 2d: Update with correct password (X-Clipboard-Edit-Password) -> 200
CORRECT_UPD=$(curl -s -o /dev/null -w "%{http_code}" -X PUT $BASE_URL/$CODE2 -H "Content-Type: application/json" -H "X-Clipboard-Edit-Password: editpassword456" -d '{"content": "Legit updated content"}')
if [ "$CORRECT_UPD" != "200" ]; then
  echo "Failed 2d: Expected 200 on update with correct edit password, got $CORRECT_UPD"
  exit 1
fi
echo "2d passed: Successfully updated with edit password"

# 2e: Delete with correct edit password -> 200
DEL_RESP2=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE $BASE_URL/$CODE2 -H "X-Clipboard-Edit-Password: editpassword456")
if [ "$DEL_RESP2" != "200" ]; then
  echo "Failed 2e: Expected 200 on delete with correct edit password, got $DEL_RESP2"
  exit 1
fi
echo "2e passed: Successfully deleted with edit password"

echo ""
echo "=== Test 3: Clipboard with BOTH View and Edit Passwords ==="
CREATE_RESP3=$(curl -s -X POST $BASE_URL -H "Content-Type: application/json" -d '{
  "content": "Dual password secret content",
  "mode": "protected",
  "viewPassword": "viewpass1",
  "editPassword": "editpass2",
  "expiresAt": "2027-01-01T00:00:00.000Z"
}')
CODE3=$(echo $CREATE_RESP3 | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
OWNER3=$(echo $CREATE_RESP3 | grep -o '"ownerToken":"[^"]*"' | cut -d'"' -f4)

# 3a: Read requires viewPassword
LOCKED_RESP3=$(curl -s $BASE_URL/$CODE3)
if [[ "$LOCKED_RESP3" != *"\"locked\":true"* ]]; then
  echo "Failed 3a: Expected locked, got $LOCKED_RESP3"
  exit 1
fi
echo "3a passed: Locked behind view password"

# 3b: Unlock with view password
UNLOCKED3=$(curl -s -H "X-Clipboard-View-Password: viewpass1" $BASE_URL/$CODE3)
if [[ "$UNLOCKED3" != *"\"hasViewPassword\":true"* ]] || [[ "$UNLOCKED3" != *"\"hasEditPassword\":true"* ]]; then
  echo "Failed 3b: Expected both flags true, got $UNLOCKED3"
  exit 1
fi
echo "3b passed: Unlocked and both flags reported true"

# 3c: Update with viewPassword -> 403 because editPassword is required
TRY_VIEW_PW=$(curl -s -o /dev/null -w "%{http_code}" -X PUT $BASE_URL/$CODE3 -H "Content-Type: application/json" -H "X-Clipboard-Edit-Password: viewpass1" -d '{"content": "Failed"}')
if [ "$TRY_VIEW_PW" != "403" ]; then
  echo "Failed 3c: Expected 403 when using view password as edit password, got $TRY_VIEW_PW"
  exit 1
fi
echo "3c passed: Cannot edit using view password"

# 3d: Update with editPassword -> 200
CORRECT_UPD3=$(curl -s -o /dev/null -w "%{http_code}" -X PUT $BASE_URL/$CODE3 -H "Content-Type: application/json" -H "X-Clipboard-Edit-Password: editpass2" -d '{"content": "Dual updated"}')
if [ "$CORRECT_UPD3" != "200" ]; then
  echo "Failed 3d: Expected 200, got $CORRECT_UPD3"
  exit 1
fi
echo "3d passed: Successfully updated using edit password"

echo ""
echo "=== Test 4: Owner Token Bypass ==="
# 4a: Read using X-Owner-Token without view password -> 200
OWNER_READ=$(curl -s -H "X-Owner-Token: $OWNER3" $BASE_URL/$CODE3)
if [[ "$OWNER_READ" != *"Dual updated"* ]]; then
  echo "Failed 4a: Owner token failed to bypass view password"
  exit 1
fi
echo "4a passed: Owner token bypassed view password"

# 4b: Update using X-Owner-Token without edit password -> 200
OWNER_UPD=$(curl -s -o /dev/null -w "%{http_code}" -X PUT $BASE_URL/$CODE3 -H "Content-Type: application/json" -H "X-Owner-Token: $OWNER3" -d '{"content": "Owner updated"}')
if [ "$OWNER_UPD" != "200" ]; then
  echo "Failed 4b: Owner token failed to bypass edit password on update, got $OWNER_UPD"
  exit 1
fi
echo "4b passed: Owner token bypassed edit password"

# 4c: Delete using X-Owner-Token -> 200
OWNER_DEL=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE $BASE_URL/$CODE3 -H "X-Owner-Token: $OWNER3")
if [ "$OWNER_DEL" != "200" ]; then
  echo "Failed 4c: Owner token failed to delete, got $OWNER_DEL"
  exit 1
fi
echo "4c passed: Owner token deleted clipboard"

echo ""
echo "=== Test 5: Legacy Compatibility ==="
LEGACY_CREATE=$(curl -s -X POST $BASE_URL -H "Content-Type: application/json" -d '{
  "content": "Legacy view clipboard",
  "mode": "protected",
  "passwordMode": "view",
  "password": "legacypw",
  "expiresAt": "2027-01-01T00:00:00.000Z"
}')
LEGACY_CODE=$(echo $LEGACY_CREATE | grep -o '"code":"[^"]*"' | cut -d'"' -f4)
LEGACY_LOCKED=$(curl -s $BASE_URL/$LEGACY_CODE)
if [[ "$LEGACY_LOCKED" != *"\"locked\":true"* ]]; then
  echo "Failed 5: Expected legacy clipboard to be locked, got $LEGACY_LOCKED"
  exit 1
fi
LEGACY_UNLOCKED=$(curl -s -H "X-Clipboard-Password: legacypw" $BASE_URL/$LEGACY_CODE)
if [[ "$LEGACY_UNLOCKED" != *"Legacy view clipboard"* ]]; then
  echo "Failed 5: Expected legacy unlock, got $LEGACY_UNLOCKED"
  exit 1
fi
# Cleanup
curl -s -X DELETE $BASE_URL/$LEGACY_CODE > /dev/null
echo "5 passed: Legacy mode/password works seamlessly"

echo ""
echo "=== Test 6: Verify Endpoint & Protected Clipboard Starring ==="
CREATE_RESP6=$(curl -s -X POST $BASE_URL -H "Content-Type: application/json" -d '{
  "content": "Verify and star test",
  "mode": "protected",
  "editPassword": "secreteditpassword",
  "expiresAt": "2027-01-01T00:00:00.000Z"
}')
CODE6=$(echo $CREATE_RESP6 | grep -o '"code":"[^"]*"' | cut -d'"' -f4)

# 6a: Test verify with wrong password -> 403
VERIFY_WRONG=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/$CODE6/verify -H "X-Clipboard-Edit-Password: wrongpassword")
if [ "$VERIFY_WRONG" != "403" ]; then
  echo "Failed 6a: Expected 403 on wrong verify password, got $VERIFY_WRONG"
  exit 1
fi
echo "6a passed: 403 on wrong verify password"

# 6b: Test verify with correct password -> 200
VERIFY_CORRECT=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/$CODE6/verify -H "X-Clipboard-Edit-Password: secreteditpassword")
if [ "$VERIFY_CORRECT" != "200" ]; then
  echo "Failed 6b: Expected 200 on correct verify password, got $VERIFY_CORRECT"
  exit 1
fi
echo "6b passed: 200 on correct verify password"

# 6c: Star protected clipboard -> 200
STAR_RESP=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/$CODE6/star)
if [ "$STAR_RESP" != "200" ]; then
  echo "Failed 6c: Expected 200 when starring protected clipboard, got $STAR_RESP"
  exit 1
fi
echo "6c passed: Protected clipboard can be starred"

# Cleanup
curl -s -X DELETE $BASE_URL/$CODE6 -H "X-Clipboard-Edit-Password: secreteditpassword" > /dev/null

echo ""
echo "ALL TESTS PASSED SUCCESSFULLY!"
