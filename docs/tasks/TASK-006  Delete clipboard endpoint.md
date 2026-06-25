# TASK-006 — Delete Clipboard Endpoint

## Objective
Implement DELETE /api/clipboard/:code.

## Scope
- Implement handleDelete in handlers/clipboard.js
- Auth enforcement per mode
- Remove from starred list on deletion

## Prerequisites
- TASK-001 through TASK-005 completed

## Files Allowed to Change
- workers/dump-worker/src/handlers/clipboard.js

## Files That Must Not Be Changed
- All other files
- docs/ (except GEMINI.md at the end)

## Suggested AI Model
Gemini 2.5 Pro

## Coding Prompt

Implement handleDelete in workers/dump-worker/src/handlers/clipboard.js.
Read docs/API.md (DELETE /api/clipboard/:code) and docs/DECISIONS.md before writing code.

Steps:

1. Extract code from URL. Lowercase it.

2. Read meta. If null return 404.

3. Expiration check. If expired return 404.

4. Authorization:
   - If mode is public or reserved: anyone can delete, no auth check.
   - If mode is protected:
     - If owner token provided and matches → authorized
     - Else if password provided and matches passwordHash → authorized
       (regardless of passwordMode — any valid password allows deletion)
     - Else → return 403

5. Delete clipboard:
   - deleteClipboard(env, code)

6. Remove from starred list:
   - getStarred(env)
   - filter out code
   - setStarred(env, filtered)

7. Return 200 { "success": true }

## Manual Testing Instructions

Test 1 — Delete public clipboard:
  curl -X DELETE http://localhost:8787/api/clipboard/<code>
  → expect 200
  → GET same code → expect 404

Test 2 — Delete protected clipboard without credentials:
  curl -X DELETE http://localhost:8787/api/clipboard/<code>
  → expect 403

Test 3 — Delete protected clipboard with owner token:
  curl -X DELETE http://localhost:8787/api/clipboard/<code> \
    -H "X-Owner-Token: <token>"
  → expect 200

Test 4 — Delete starred clipboard:
  (star the clipboard first)
  curl -X DELETE http://localhost:8787/api/clipboard/<code>
  → expect 200
  → GET /api/starred → code should not appear

## Expected Behavior
Clipboard deleted from KV.
Removed from starred list.
Auth rules enforced for protected clipboards.

## Commit Suggestion
feat(worker): implement delete clipboard endpoint

## How to Update GEMINI.md After Completion
In the Current Project State section:
- Move TASK-006 from Not Started to Completed Tasks
- Add summary: "DELETE /api/clipboard/:code implemented with auth and starred cleanup"
