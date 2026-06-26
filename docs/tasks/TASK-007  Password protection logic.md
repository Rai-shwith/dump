# TASK-007 — Password Hashing

## Objective
Replace plaintext password storage with SHA-256(password + pepper) using SubtleCrypto.
Update all password comparison logic accordingly.

## Scope
- Implement hashPassword in utils/hash.js
- Replace plaintext password storage in handleCreate and handleUpdate
- Replace plaintext password comparison in handleRead, handleUpdate, handleDelete

## Prerequisites
- TASK-001 through TASK-006 completed
- PASSWORD_PEPPER secret set via: npx wrangler secret put PASSWORD_PEPPER

## Files Allowed to Change
- workers/dump-worker/src/utils/hash.js
- workers/dump-worker/src/handlers/clipboard.js

## Files That Must Not Be Changed
- All other files
- docs/ (except AGENTS.md at the end)

## Suggested AI Model
Gemini 2.5 Pro

## Coding Prompt

Implement password hashing for the Dump Worker.
Read docs/DECISIONS.md (D-004) before writing code.

In workers/dump-worker/src/utils/hash.js implement:

  async hashPassword(password, pepper)
  - Concatenates password + pepper
  - Encodes to UTF-8 using TextEncoder
  - Hashes with SubtleCrypto: crypto.subtle.digest("SHA-256", data)
  - Converts ArrayBuffer to hex string
  - Returns hex string

  async hashToken(token)
  - Same as hashPassword but no pepper (just hashes the token string)
  - Used for owner token hashing (TASK-008 will call this)

Now update handlers/clipboard.js:

In handleCreate:
  - Replace: ownerTokenHash: ownerToken
    With: ownerTokenHash: await hashToken(ownerToken)
    Wait — do NOT do owner token yet. That is TASK-008.
  - Replace plaintext password storage:
    passwordHash: password
    With: passwordHash: password ? await hashPassword(password, env.PASSWORD_PEPPER) : null

In handleRead:
  - Replace plaintext password comparison:
    password !== meta.passwordHash
    With: await hashPassword(password, env.PASSWORD_PEPPER) !== meta.passwordHash

In handleUpdate:
  - Replace plaintext password comparison with hash compare
  - Replace plaintext password storage with hash on update

In handleDelete:
  - Replace plaintext password comparison with hash compare

All hash comparisons must use the pattern:
  const hash = await hashPassword(providedPassword, env.PASSWORD_PEPPER)
  if (hash !== meta.passwordHash) { return 403 }

## Manual Testing Instructions

Test 1 — Create clipboard with password, verify KV meta does not contain plaintext:
  Create protected clipboard
  Check wrangler KV UI or wrangler kv key get to verify passwordHash is a hex string, not plaintext

Test 2 — Read with correct password:
  → expect 200 with content

Test 3 — Read with wrong password:
  → expect 403

Test 4 — Update with correct password:
  → expect 200

Test 5 — Delete with correct password:
  → expect 200

## Expected Behavior
Passwords never stored or compared as plaintext.
All existing password flows work correctly with hashing.

## AI Workflow
1. Complete the task requirements.
2. Create a test file in TESTS/ named after the task (e.g. TESTS/TASK-007.sh) using the Manual Testing Instructions.
3. Execute the test file. Fix any errors if tests fail.
4. Report the test results to the user and WAIT for their explicit approval.
5. Do NOT commit changes and do NOT update AGENTS.md "Completed Tasks" until the user approves.
6. Once approved, commit the changes including the test script.

## Commit Suggestion
feat(worker): implement SHA-256 password hashing with pepper

## How to Update AGENTS.md After Completion
In the Current Project State section:
- Move TASK-007 from Not Started to Completed Tasks
- Add summary: "SHA-256 password hashing implemented in utils/hash.js"
