# TASK-011 — Starred Global List

## Objective
Implement the star and unstar endpoints and the global starred list endpoint.

## Scope
- Implement handleStar, handleUnstar, handleGetStarred in handlers/starred.js
- Lazy cleanup of expired clipboards in handleGetStarred

## Prerequisites
- TASK-001 through TASK-010 completed

## Files Allowed to Change
- workers/dump-worker/src/handlers/starred.js

## Files That Must Not Be Changed
- All other files
- docs/ (except GEMINI.md at the end)

## Suggested AI Model
Gemini 2.5 Pro

## Coding Prompt

Implement starred handlers in workers/dump-worker/src/handlers/starred.js.
Read docs/API.md (star endpoints) and docs/DECISIONS.md (D-009) before writing code.

handleStar(request, env, ctx, code):
1. Lowercase code.
2. getMeta(env, code). If null return 404.
3. Expiration check with isExpired(meta). If expired return 404.
4. If meta.mode !== "public" return 400 { "error": "Only public clipboards can be starred" }
5. If meta.isStarred is true return 200 { "success": true, "isStarred": true } (idempotent)
6. getStarred(env) → array of codes
7. If code already in array: return 200 idempotent (defensive check)
8. Prepend code to array: [code, ...existing]
9. If array.length > 5:
   - Drop last element (oldest): dropped = array.pop()
   - Read meta of dropped clipboard
   - If dropped meta exists: set dropped.isStarred = false, write back
10. setStarred(env, array)
11. Update meta.isStarred = true, write back via setMeta
12. Return 200 { "success": true, "isStarred": true }

handleUnstar(request, env, ctx, code):
1. Lowercase code.
2. getMeta(env, code). If null return 404.
3. Expiration check. If expired return 404.
4. getStarred(env)
5. Filter out code from array.
6. setStarred(env, filtered)
7. Update meta.isStarred = false, write back.
8. Return 200 { "success": true, "isStarred": false }

handleGetStarred(request, env, ctx):
1. getStarred(env) → array of codes
2. For each code:
   - getMeta(env, code)
   - If meta is null or isExpired(meta): mark for removal
   - Else: include in result with fields: code, createdAt, expiresAt, isOneTimeView
3. If any codes were removed: setStarred(env, cleaned array)
4. Return 200 { "starred": [...] }

## Manual Testing Instructions

Test 1 — Star a public clipboard:
  POST /api/clipboard/<code>/star
  → expect 200 isStarred true
  GET /api/starred → code appears

Test 2 — Star same clipboard again (idempotent):
  → expect 200 isStarred true, no duplicate in list

Test 3 — Star non-public clipboard:
  → expect 400

Test 4 — Star 6th clipboard (oldest dropped):
  Star 5 clipboards
  Star a 6th
  GET /api/starred → 5 entries, first starred clipboard dropped
  GET /api/clipboard/<dropped>/raw (or json) → isStarred should be false

Test 5 — Unstar:
  DELETE /api/clipboard/<code>/star
  GET /api/starred → code not present

Test 6 — Lazy cleanup:
  Star a clipboard with short expiration
  Wait for it to expire
  GET /api/starred → expired clipboard not returned, list cleaned

## Expected Behavior
Starring and unstarring work correctly.
Max 5 entries enforced.
Expired clipboards lazily removed from starred list.

## Commit Suggestion
feat(worker): implement starred global list endpoints

## How to Update GEMINI.md After Completion
In the Current Project State section:
- Move TASK-011 from Not Started to Completed Tasks
- Add summary: "Star/unstar/getStarred endpoints implemented with lazy expiry cleanup"
