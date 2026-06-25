# TASK-004 — Read Clipboard Endpoint

## Objective
Implement GET /api/clipboard/:code.
Returns clipboard content with auth checks and locked state for view-password clipboards.

## Scope
- Implement handleRead in handlers/clipboard.js
- Basic expiration check (string comparison for now, TASK-010 will formalize)
- Password and owner token check (plaintext comparison for now)
- Locked response for view-password clipboards
- One-time view deletion after returning content

## Prerequisites
- TASK-001, TASK-002, TASK-003 completed

## Files Allowed to Change
- workers/dump-worker/src/handlers/clipboard.js

## Files That Must Not Be Changed
- All other files
- docs/ (except AGENTS.md at the end)

## Suggested AI Model
Gemini 2.5 Pro

## Coding Prompt

Implement handleRead in workers/dump-worker/src/handlers/clipboard.js.
Read docs/API.md (GET /api/clipboard/:code) and docs/DECISIONS.md before writing code.

Steps:

1. Extract code from URL. Lowercase it.

2. Read meta via getMeta(env, code). If null return 404.

3. Expiration check:
   - If meta.expiresAt is not null:
     - If new Date(meta.expiresAt) <= new Date() → return 404
   - Never reveal that the clipboard existed.

4. Extract headers:
   - ownerToken from X-Owner-Token header
   - password from X-Clipboard-Password header

5. Owner token check:
   - If ownerToken provided and ownerToken === meta.ownerTokenHash
     (plaintext comparison for now — TASK-008 will replace with hash compare)
   - If match: mark as authorized (bypass all password checks)

6. Password check (only if not authorized via owner token):
   - If meta.passwordMode === "view":
     - If no password provided: return 200 { "locked": true, "passwordMode": "view" }
     - If password provided and password !== meta.passwordHash: return 403
     - If password matches: mark as authorized

7. Read content via getContent(env, code). If null return 404.

8. Build response object:
   {
     code, content, mode, passwordMode, expiresAt,
     isOneTimeView, isStarred, createdAt
   }

9. One-time view deletion:
   - If meta.isOneTimeView is true:
     - Delete clipboard: deleteClipboard(env, code)
     - Remove from starred list if present:
       - getStarred(env)
       - filter out code
       - setStarred(env, filtered)
       - if clipboard was starred, also update isStarred on the removed entry
         (no need since it is deleted — skip)

10. Return 200 with the response object.

Note: passwordMode "edit" means anyone can view, password only required for editing.
So if passwordMode is "edit", skip all password checks for reading.

## Manual Testing Instructions

Test 1 — Read existing clipboard:
  (create one first with TASK-003)
  curl http://localhost:8787/api/clipboard/<code>
  → expect 200 with content

Test 2 — Read nonexistent clipboard:
  curl http://localhost:8787/api/clipboard/doesnotexist
  → expect 404

Test 3 — Read view-password clipboard without password:
  (create protected clipboard with passwordMode view)
  curl http://localhost:8787/api/clipboard/<code>
  → expect 200 { "locked": true, "passwordMode": "view" }

Test 4 — Read with wrong password:
  curl -H "X-Clipboard-Password: wrong" http://localhost:8787/api/clipboard/<code>
  → expect 403

Test 5 — Read with correct password:
  curl -H "X-Clipboard-Password: correct" http://localhost:8787/api/clipboard/<code>
  → expect 200 with content

Test 6 — Read with owner token:
  curl -H "X-Owner-Token: <token>" http://localhost:8787/api/clipboard/<code>
  → expect 200 with content bypassing password

Test 7 — One-time view:
  (create with isOneTimeView true)
  First read → expect 200 with content
  Second read → expect 404

## Expected Behavior
Correct content returned for valid requests.
Locked response for view-password clipboards without credentials.
One-time view clipboards deleted after first read.

## Commit Suggestion
feat(worker): implement read clipboard endpoint

## How to Update AGENTS.md After Completion
In the Current Project State section:
- Move TASK-004 from Not Started to Completed Tasks
- Add summary: "GET /api/clipboard/:code implemented with auth checks and one-time view"
