# TASK-009 — One-Time View Verification

## Objective
Verify and harden the one-time view deletion flow end-to-end.
Ensure deletion happens after content is returned, not before.
Ensure raw endpoint also triggers deletion.

## Scope
- Audit handleRead one-time view logic
- Implement handleRaw and include one-time view deletion there too
- Verify starred cleanup on one-time view deletion

## Prerequisites
- TASK-001 through TASK-008 completed

## Files Allowed to Change
- workers/dump-worker/src/handlers/clipboard.js

## Files That Must Not Be Changed
- All other files
- docs/ (except AGENTS.md at the end)

## Suggested AI Model
Gemini 2.5 Pro

## Coding Prompt

Implement handleRaw and audit one-time view logic in handlers/clipboard.js.
Read docs/API.md (GET /api/clipboard/:code/raw) and docs/DECISIONS.md (D-008).

handleRaw steps:
1. Extract code from URL. Lowercase it.
2. Read meta. If null return 404.
3. Expiration check. If expired return 404 as plain text.
4. Same auth logic as handleRead (owner token bypass, view password check).
5. Read content. If null return 404.
6. Build plain text response:
   return new Response(content, {
     status: 200,
     headers: { "Content-Type": "text/plain" }
   })
7. If isOneTimeView: delete clipboard and remove from starred AFTER
   building the response object but before returning.
   The deletion must happen before return so the response still sends.

For handleRead audit:
- Verify deletion happens after content is fetched and response object is built.
- Deletion must not prevent the response from being returned.
- Order must be: fetch content → build response → delete → return response.

One-time view deletion sequence (both handleRead and handleRaw):
  const starred = await getStarred(env)
  const filtered = starred.filter(c => c !== code)
  if (filtered.length !== starred.length) {
    await setStarred(env, filtered)
  }
  await deleteClipboard(env, code)

## Manual Testing Instructions

Test 1 — One-time view via GET:
  Create clipboard with isOneTimeView true
  First GET → expect 200 with content
  Second GET → expect 404

Test 2 — One-time view via raw:
  Create clipboard with isOneTimeView true
  First GET /raw → expect 200 plain text
  Second GET /raw → expect 404

Test 3 — One-time view starred:
  Create clipboard with isOneTimeView true
  Star it via POST /api/clipboard/<code>/star
  Read it → expect 200
  GET /api/starred → code should not appear

Test 4 — One-time view with view password:
  Create protected one-time view clipboard
  Unlock with correct password → expect 200 with content
  Second read → expect 404
  (Password verification alone without content read does NOT delete)

## Expected Behavior
Clipboard deleted after first content read.
Deletion does not prevent response from being returned.
Raw endpoint follows same rules.

## Commit Suggestion
feat(worker): implement and harden one-time view deletion flow

## How to Update AGENTS.md After Completion
In the Current Project State section:
- Move TASK-009 from Not Started to Completed Tasks
- Add summary: "One-time view deletion hardened, handleRaw implemented"
