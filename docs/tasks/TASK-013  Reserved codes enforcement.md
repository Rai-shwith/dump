# TASK-013 — Reserved Codes and Validation Hardening

## Objective
Finalize validate.js with all code validation rules.
Ensure reserved keyword enforcement is consistent across create.

## Scope
- Complete validate.js
- Confirm all validation is called in handleCreate

## Prerequisites
- TASK-003 completed

## Files Allowed to Change
- workers/dump-worker/src/utils/validate.js
- workers/dump-worker/src/handlers/clipboard.js (validation calls only)

## Files That Must Not Be Changed
- All other files
- docs/ (except GEMINI.md at the end)

## Suggested AI Model
Gemini 2.5 Flash

## Coding Prompt

Finalize validation in workers/dump-worker/src/utils/validate.js.
Read docs/DECISIONS.md (D-011) before writing code.

Ensure the following are exported and correct:

  RESERVED_KEYWORDS
  - ["admin","api","raw","json","create","edit","delete","settings","help","docs","host"]

  isValidCode(code)
  - Must match /^[a-z0-9_-]{4,}$/
  - Input is already lowercased before calling this

  isReservedCode(code)
  - Case insensitive check against RESERVED_KEYWORDS
  - Input is lowercased so direct array include is fine

  generateCode()
  - 8 chars, a-z and 0-9 only
  - Cryptographically random preferred

  validateCodeString(code)
  - Combines isValidCode and isReservedCode
  - Returns { valid: false, error: "..." } or { valid: true }

Confirm in handleCreate that validateCodeString is called and errors returned correctly.

## Manual Testing Instructions

Test 1 — Each reserved keyword:
  Try creating clipboard with code = "admin", "api", "raw" etc.
  → all return 400

Test 2 — Short code:
  code = "ab"
  → 400

Test 3 — Invalid characters:
  code = "test!"
  → 400

Test 4 — Valid code:
  code = "test-ok_1"
  → 201

## Expected Behavior
All invalid codes rejected with clear error messages.
All reserved keywords blocked.

## Commit Suggestion
feat(worker): finalize code validation and reserved keyword enforcement

## How to Update GEMINI.md After Completion
In the Current Project State section:
- Move TASK-013 from Not Started to Completed Tasks
- Add summary: "Code validation and reserved keywords enforced in utils/validate.js"
