# TASK-005 — Update Clipboard Endpoint

## Objective
Implement PUT /api/clipboard/:code.
Allows updating content, expiration, and password of an existing clipboard.

## Scope
- Implement handleUpdate in handlers/clipboard.js
- Auth check via owner token or edit password
- Partial updates (only update provided fields)

## Prerequisites
- TASK-001, TASK-002, TASK-003, TASK-004 completed

## Files Allowed to Change
- workers/dump-worker/src/handlers/clipboard.js

## Files That Must Not Be Changed
- All other files
- docs/ (except GEMINI.md at the end)

## Suggested AI Model
Gemini 2.5 Pro

## Coding Prompt

Implement handleUpdate in workers/dump-worker/src/handlers/clipboard.js.
Read docs/API.md (PUT /api/clipboard/:code) and docs/DECISIONS.md before writing code.

Steps:

1. Extract code from URL. Lowercase it.

2. Read meta. If null return 404.

3. Expiration check. If expired return 404.

4. Extract headers: X-Owner-Token, X-Clipboard-Password.

5. Authorization:
   - If owner token provided and matches meta.ownerTokenHash → authorized
   - Else if meta.passwordMode === "edit":
     - If no password → return 403
     - If password !== meta.passwordHash → return 403
     - Else → authorized
   - Else (public or reserved, no edit password) → authorized

6. Parse request body. Return 400 if invalid JSON.

7. Extract updatable fields:
   content, expiresAt, isOneTimeView, password, passwordMode

8. Validate at least one field is present. Return 400 if body is empty.

9. Validate updates:
   - If isOneTimeView and expiresAt both provided → return 400
   - If expiresAt provided:
     - Must be future date
     - Must not exceed 1 year from meta.createdAt (not from now)
     - Return 400 if violated
   - If content provided: check 256KB limit
   - Cannot change mode field. Ignore if provided.

10. Build updated meta (only change provided fields):
    - If password provided: update passwordHash (plaintext for now)
    - If passwordMode provided: update passwordMode
    - If expiresAt provided: update expiresAt
    - If isOneTimeView provided: update isOneTimeView

11. Calculate new TTL:
    - Skip for now (TASK-010). Use null.

12. Write updated meta and optionally updated content to KV.

13. Return 200:
    {
      "success": true,
      "expiresAt": updated expiresAt or existing,
      "isOneTimeView": updated or existing
    }

## Manual Testing Instructions

Test 1 — Update content:
  curl -X PUT http://localhost:8787/api/clipboard/<code> \
    -H "Content-Type: application/json" \
    -d '{"content": "updated content"}'
  → expect 200 success
  → read clipboard and verify new content

Test 2 — Update with wrong edit password:
  (create clipboard with edit password)
  curl -X PUT http://localhost:8787/api/clipboard/<code> \
    -H "Content-Type: application/json" \
    -H "X-Clipboard-Password: wrong" \
    -d '{"content": "new"}'
  → expect 403

Test 3 — Update with owner token bypassing edit password:
  curl -X PUT http://localhost:8787/api/clipboard/<code> \
    -H "Content-Type: application/json" \
    -H "X-Owner-Token: <token>" \
    -d '{"content": "new"}'
  → expect 200

Test 4 — Update expiration beyond 1 year from creation:
  → expect 400

Test 5 — Update nonexistent clipboard:
  → expect 404

## Expected Behavior
Clipboard fields updated correctly.
Auth rules enforced.
Partial updates work (only provided fields change).

## Commit Suggestion
feat(worker): implement update clipboard endpoint

## How to Update GEMINI.md After Completion
In the Current Project State section:
- Move TASK-005 from Not Started to Completed Tasks
- Add summary: "PUT /api/clipboard/:code implemented with partial updates and auth"
