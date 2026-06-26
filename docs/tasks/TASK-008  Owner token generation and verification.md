# TASK-008 — Owner Token Hashing

## Objective
Replace plaintext owner token storage and comparison with SHA-256 hashed storage.

## Scope
- Update handleCreate to hash the owner token before storing
- Update handleRead, handleUpdate, handleDelete to hash before comparing

## Prerequisites
- TASK-007 completed (hashToken is already implemented in hash.js)

## Files Allowed to Change
- workers/dump-worker/src/handlers/clipboard.js

## Files That Must Not Be Changed
- All other files
- docs/ (except AGENTS.md at the end)

## Suggested AI Model
Gemini 2.5 Pro

## Coding Prompt

Update owner token handling in workers/dump-worker/src/handlers/clipboard.js.
Read docs/DECISIONS.md (D-005) before writing code.

In handleCreate:
  - Replace: ownerTokenHash: ownerToken
    With: ownerTokenHash: await hashToken(ownerToken)

In handleRead, handleUpdate, handleDelete wherever owner token is compared:
  - Replace: ownerToken === meta.ownerTokenHash
    With: await hashToken(ownerToken) === meta.ownerTokenHash

Import hashToken from utils/hash.js.

## Manual Testing Instructions

Test 1 — Create clipboard, verify KV meta ownerTokenHash is a hex string:
  npx wrangler kv key get --binding=CLIPBOARD_KV "clip:<code>:meta"
  → ownerTokenHash should be a 64-char hex string, not a UUID

Test 2 — Read clipboard with owner token (bypassing view password):
  → expect 200

Test 3 — Update clipboard with owner token:
  → expect 200

Test 4 — Delete clipboard with owner token:
  → expect 200

Test 5 — Use wrong owner token:
  → expect 403

## Expected Behavior
Owner tokens never stored as plaintext.
All owner token flows work correctly after hashing.

## AI Workflow
0. At anypoint if any ambiguity or doubt arises. *Stop Coding*. Ask questions, clarify, then proceed. DO NOT ASSUME.
1. Complete the task requirements.
2. Create a test file in TESTS/ named after the task (e.g. TESTS/TASK-008.sh) using the Manual Testing Instructions.
3. Execute the test file. Run npm run lint. Fix any errors if tests fail do not create walkarounds to bypass linter.
4. Report the test results to the user and WAIT for their explicit approval.
5. Do NOT commit changes and do NOT update AGENTS.md "Completed Tasks" until the user approves.
6. Once approved, commit the changes including the test script.

## Commit Suggestion
feat(worker): implement SHA-256 owner token hashing

## How to Update AGENTS.md After Completion
In the Current Project State section:
- Move TASK-008 from Not Started to Completed Tasks
- Add summary: "Owner token hashed with SHA-256 before KV storage"
