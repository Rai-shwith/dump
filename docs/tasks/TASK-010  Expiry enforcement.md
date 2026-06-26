# TASK-010 — Expiry Enforcement

## Objective
Centralize and harden expiration logic in utils/expiry.js.
Replace ad-hoc expiration checks in handlers with utility functions.

## Scope
- Implement expiry utilities in utils/expiry.js
- Replace inline expiration checks in all handlers with utility calls

## Prerequisites
- TASK-001 through TASK-009 completed

## Files Allowed to Change
- workers/dump-worker/src/utils/expiry.js
- workers/dump-worker/src/handlers/clipboard.js

## Files That Must Not Be Changed
- All other files
- docs/ (except AGENTS.md at the end)

## Suggested AI Model
Gemini 2.5 Pro

## Coding Prompt

Implement expiry utilities and centralize expiration checks.
Read docs/DECISIONS.md (D-007) before writing code.

In workers/dump-worker/src/utils/expiry.js implement:

  isExpired(meta)
  - If meta.expiresAt is null: return false (permanent)
  - If meta.isOneTimeView is true: return false (not time-based)
  - If new Date(meta.expiresAt) <= new Date(): return true
  - Else return false

  calculateExpiresAt(expiresAtString)
  - Parses the ISO string
  - Returns the Date object or null if input is null

  validateExpiresAt(expiresAt, createdAt, maxYears = 1)
  - Returns { valid: false, error: "..." } if:
    - expiresAt is in the past
    - expiresAt is more than maxYears years from createdAt
  - Returns { valid: true } if all checks pass

  ttlSeconds(expiresAt)
  - If expiresAt is null: return null
  - Returns Math.floor((new Date(expiresAt) - Date.now()) / 1000)
  - If result <= 0: return 1 (minimum 1 second)

Now update handlers/clipboard.js:
- Replace all inline expiration checks with isExpired(meta)
- In handleCreate and handleUpdate, use validateExpiresAt for validation
- In setMeta and setContent calls, pass ttlSeconds(meta.expiresAt) as the TTL
  so KV auto-expires the keys (this is an optimization, not required for correctness)

## Manual Testing Instructions

Test 1 — Create clipboard with expiration 1 minute from now:
  expiresAt = new Date(Date.now() + 60000).toISOString()
  Create clipboard
  Read immediately → expect 200
  Wait 61 seconds
  Read again → expect 404

Test 2 — Create clipboard with past expiration:
  expiresAt = "2020-01-01T00:00:00Z"
  → expect 400

Test 3 — Create clipboard with expiration more than 1 year:
  expiresAt = new Date(Date.now() + 400 * 24 * 3600 * 1000).toISOString()
  → expect 400 for reserved/protected mode

Test 4 — Permanent public clipboard (no expiresAt):
  Create with mode public, no expiresAt
  Read → expect 200 always

## Expected Behavior
Expiration logic centralized.
All handlers use isExpired() consistently.
KV TTL set on write for time-based expiration.

## AI Workflow
1. Complete the task requirements.
2. Create a test file in TESTS/ named after the task (e.g. TESTS/TASK-010.sh) using the Manual Testing Instructions.
3. Execute the test file. Fix any errors if tests fail.
4. Report the test results to the user and WAIT for their explicit approval.
5. Do NOT commit changes and do NOT update AGENTS.md "Completed Tasks" until the user approves.
6. Once approved, commit the changes including the test script.

## Commit Suggestion
feat(worker): centralize expiry logic in utils/expiry.js

## How to Update AGENTS.md After Completion
In the Current Project State section:
- Move TASK-010 from Not Started to Completed Tasks
- Add summary: "Expiry logic centralized in utils/expiry.js, KV TTL applied on write"
