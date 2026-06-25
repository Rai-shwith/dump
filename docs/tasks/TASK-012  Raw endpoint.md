# TASK-012 — Raw Endpoint Verification

## Objective
Verify handleRaw is complete, returns plain text, and is correctly wired in the router.

## Scope
- Confirm handleRaw is exported and called from index.js for GET /api/clipboard/:code/raw
- Confirm Content-Type is text/plain
- Confirm auth and one-time view rules apply

## Prerequisites
- TASK-009 completed (handleRaw implemented there)

## Files Allowed to Change
- workers/dump-worker/src/index.js (routing only if raw is not wired)
- workers/dump-worker/src/handlers/clipboard.js (minor fix only if needed)

## Files That Must Not Be Changed
- All other files
- docs/ (except GEMINI.md at the end)

## Suggested AI Model
Gemini 2.5 Flash

## Coding Prompt

Verify and finalize the raw endpoint.
Read docs/API.md (GET /api/clipboard/:code/raw).

1. Confirm GET /api/clipboard/:code/raw routes to handleRaw in index.js.
2. Confirm handleRaw returns Content-Type: text/plain.
3. Confirm auth rules (X-Owner-Token, X-Clipboard-Password) apply.
4. Confirm one-time view deletion applies.
5. Confirm expiration check applies.
6. If any of the above are missing, fix them. Otherwise this task is a no-op.

## Manual Testing Instructions

Test 1 — Raw read public clipboard:
  curl http://localhost:8787/api/clipboard/<code>/raw
  → expect plain text content, no JSON wrapper
  → Content-Type header should be text/plain

Test 2 — Raw read with view password:
  curl -H "X-Clipboard-Password: <pass>" http://localhost:8787/api/clipboard/<code>/raw
  → expect plain text

Test 3 — Raw read expired clipboard:
  → expect 404

Test 4 — Raw one-time view:
  First request → plain text returned
  Second request → 404

## Expected Behavior
Raw endpoint returns plain text with correct headers and enforces all same rules as JSON read.

## Commit Suggestion
feat(worker): verify and finalize raw clipboard endpoint

## How to Update GEMINI.md After Completion
In the Current Project State section:
- Move TASK-012 from Not Started to Completed Tasks
- Add summary: "Raw endpoint verified and finalized"
