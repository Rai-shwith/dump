# TASK-003 — Create Clipboard Endpoint

## Objective
Implement POST /api/clipboard.
A clipboard can be created with content, mode, optional password, and expiration.

## Scope
- Implement handleCreate in handlers/clipboard.js
- Implement code generation (random 8 chars) in handlers/clipboard.js
- Basic input validation (code format, length, reserved keywords, content size)
- KV writes for meta and content
- Return owner token in response

## Prerequisites
- TASK-001 completed
- TASK-002 completed
- TASK-007 and TASK-008 are NOT done yet — use placeholder hashing for now:
  store password and owner token as plaintext temporarily.
  These will be replaced in TASK-007 and TASK-008.

## Files Allowed to Change
- workers/dump-worker/src/handlers/clipboard.js
- workers/dump-worker/src/utils/validate.js

## Files That Must Not Be Changed
- index.js
- kv.js
- hash.js
- expiry.js
- docs/ (except GEMINI.md at the end)

## Suggested AI Model
Gemini 2.5 Pro

## Coding Prompt

You are implementing the POST /api/clipboard endpoint for the Dump clipboard Worker.
Read docs/API.md and docs/DECISIONS.md before writing code.

In workers/dump-worker/src/utils/validate.js implement:

  RESERVED_KEYWORDS
  - Exported constant array:
    ["admin", "api", "raw", "json", "create", "edit", "delete",
     "settings", "help", "docs", "host"]

  isValidCode(code)
  - Returns true if code matches /^[a-z0-9_-]{4,}$/
  - Returns false otherwise

  isReservedCode(code)
  - Returns true if code is in RESERVED_KEYWORDS
  - Returns false otherwise

  generateCode()
  - Returns a random 8-character lowercase string using only a-z and 0-9
  - Use crypto.randomUUID() and strip hyphens, take first 8 chars,
    or generate using Math.random() with character set — your choice
    as long as output is always 8 chars of a-z0-9

In workers/dump-worker/src/handlers/clipboard.js implement handleCreate:

  Input: Request object, env object, ctx object

  Steps:
  1. Parse JSON body. Return 400 if body is invalid JSON.

  2. Extract fields: code, content, mode, passwordMode, password,
     expiresAt, isOneTimeView

  3. Validate content:
     - Required. Return 400 if missing or empty.
     - Max size: 256KB (check content.length <= 262144). Return 400 if exceeded.

  4. Validate and normalize code:
     - If code not provided, generate one using generateCode()
     - Lowercase the code
     - Validate with isValidCode(). Return 400 if invalid.
     - Check isReservedCode(). Return 400 if reserved.

  5. Validate mode:
     - Must be one of: public, reserved, protected
     - Default to public if not provided
     - If protected: password and passwordMode are required. Return 400 if missing.
     - If passwordMode provided: must be view or edit. Return 400 otherwise.

  6. Validate expiration:
     - isOneTimeView and expiresAt cannot both be set. Return 400 if both present.
     - If mode is reserved or protected: expiresAt is required. Return 400 if missing.
     - If expiresAt provided: parse it, validate it is a future date.
       Return 400 if it is in the past.
       Return 400 if it exceeds 1 year from now.
     - If mode is public and no expiresAt and no isOneTimeView: permanent clipboard.

  7. Check code availability:
     - Call getMeta(env, code)
     - If meta exists: return 409 { "error": "Code already exists" }

  8. Generate owner token:
     - const ownerToken = crypto.randomUUID()
     - For now store it as plaintext in meta as ownerTokenHash (TASK-008 will hash it)

  9. Handle password:
     - For now store password as plaintext in meta as passwordHash
       (TASK-007 will hash it)

  10. Build metadata object:
      {
        code,
        mode,
        passwordHash: password or null,
        passwordMode: passwordMode or null,
        ownerTokenHash: ownerToken,
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt or null,
        isOneTimeView: isOneTimeView or false,
        isStarred: false
      }

  11. Calculate TTL for KV (optional optimization — skip for now, use null TTL):
      KV TTL can be added in TASK-010.

  12. Write to KV:
      - setMeta(env, code, meta, null)
      - setContent(env, code, content, null)

  13. Return 201:
      {
        "code": code,
        "ownerToken": ownerToken,
        "expiresAt": expiresAt or null,
        "isOneTimeView": isOneTimeView or false
      }

Error responses must follow { "error": "..." } format.
Do not implement password hashing yet.
Do not implement owner token hashing yet.
Both will be replaced in later tasks.

## Manual Testing Instructions

Start worker: npx wrangler dev

Test 1 — Create basic public clipboard:
  curl -X POST http://localhost:8787/api/clipboard \
    -H "Content-Type: application/json" \
    -d '{"content": "hello world", "mode": "public"}'
  → expect 201 with code, ownerToken, expiresAt null, isOneTimeView false

Test 2 — Create with custom code:
  curl -X POST http://localhost:8787/api/clipboard \
    -H "Content-Type: application/json" \
    -d '{"code": "mytest", "content": "hello", "mode": "public"}'
  → expect 201 with code "mytest"

Test 3 — Duplicate code:
  (run test 2 again)
  → expect 409

Test 4 — Reserved keyword:
  curl -X POST http://localhost:8787/api/clipboard \
    -H "Content-Type: application/json" \
    -d '{"code": "admin", "content": "hello", "mode": "public"}'
  → expect 400

Test 5 — Invalid code characters:
  curl -X POST http://localhost:8787/api/clipboard \
    -H "Content-Type: application/json" \
    -d '{"code": "ab!c", "content": "hello", "mode": "public"}'
  → expect 400

Test 6 — Protected without password:
  curl -X POST http://localhost:8787/api/clipboard \
    -H "Content-Type: application/json" \
    -d '{"content": "hello", "mode": "protected"}'
  → expect 400

Test 7 — Reserved without expiration:
  curl -X POST http://localhost:8787/api/clipboard \
    -H "Content-Type: application/json" \
    -d '{"code": "mycode1", "content": "hello", "mode": "reserved"}'
  → expect 400

Test 8 — isOneTimeView with expiresAt:
  curl -X POST http://localhost:8787/api/clipboard \
    -H "Content-Type: application/json" \
    -d '{"content":"hello","mode":"public","isOneTimeView":true,"expiresAt":"2099-01-01T00:00:00Z"}'
  → expect 400

## Expected Behavior
Clipboard is created and stored in KV.
Owner token returned in response.
All validation errors return correct status codes and error messages.

## Commit Suggestion
feat(worker): implement create clipboard endpoint

## How to Update GEMINI.md After Completion
In the Current Project State section:
- Move TASK-003 from Not Started to Completed Tasks
- Add summary: "POST /api/clipboard implemented with validation and KV writes"
