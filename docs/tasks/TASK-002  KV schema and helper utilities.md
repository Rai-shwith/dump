# TASK-002 — KV Schema and Helper Utilities

## Objective
Implement the KV helper utilities that all handlers will use to read and write clipboard data.
Establish the canonical KV key structure across the codebase.

## Scope
- Implement kv.js with all read/write/delete helpers
- No handler logic yet. Utilities only.

## Prerequisites
- TASK-001 completed
- Worker runs locally

## Files Allowed to Change
- workers/dump-worker/src/utils/kv.js

## Files That Must Not Be Changed
- All handler files
- index.js
- Any other utility file
- docs/ (except GEMINI.md at the end)

## Suggested AI Model
Gemini 2.5 Pro

## Coding Prompt

You are implementing KV helper utilities for the Dump clipboard Worker.
Read docs/DECISIONS.md (D-003) and docs/ARCHITECTURE.md before writing any code.

Implement the following named exports in workers/dump-worker/src/utils/kv.js:

KV key constants (export these as constants):
  META_KEY(code) → returns "clip:<code>:meta"
  CONTENT_KEY(code) → returns "clip:<code>:content"
  STARRED_KEY → string constant "app:starred"

Helper functions (all async, all accept env as first argument):

  getMeta(env, code)
  - Reads clip:<code>:meta from CLIPBOARD_KV
  - Returns parsed JSON object or null if not found

  getContent(env, code)
  - Reads clip:<code>:content from CLIPBOARD_KV
  - Returns raw string or null if not found

  setMeta(env, code, metaObject, expirationTtl)
  - Writes JSON.stringify(metaObject) to clip:<code>:meta
  - If expirationTtl is provided (seconds), pass it to KV put options
  - If expirationTtl is null, write without TTL

  setContent(env, code, contentString, expirationTtl)
  - Writes contentString to clip:<code>:content
  - Same TTL logic as setMeta

  deleteMeta(env, code)
  - Deletes clip:<code>:meta from CLIPBOARD_KV

  deleteContent(env, code)
  - Deletes clip:<code>:content from CLIPBOARD_KV

  deleteClipboard(env, code)
  - Deletes both meta and content keys
  - Calls deleteMeta and deleteContent

  getStarred(env)
  - Reads app:starred from CLIPBOARD_KV
  - Returns parsed JSON array or empty array if not found

  setStarred(env, codesArray)
  - Writes JSON.stringify(codesArray) to app:starred
  - No TTL

Rules:
- Use named exports only
- All functions are async
- Never throw uncaught errors — wrap KV calls in try/catch and return null on failure
  for get operations, and rethrow for write operations
- env is the Worker environment object containing CLIPBOARD_KV binding
- Do not import anything from other project files yet

## Manual Testing Instructions
This utility file has no standalone test.
Verify it is syntactically correct by confirming wrangler dev still starts without errors after the file is written.

  cd workers/dump-worker
  npx wrangler dev

No errors in console = pass.

## Expected Behavior
- kv.js exports all named functions and constants
- Worker still starts cleanly

## Commit Suggestion
feat(worker): implement KV helper utilities

## How to Update GEMINI.md After Completion
In the Current Project State section:
- Move TASK-002 from Not Started to Completed Tasks
- Add summary: "KV helper utilities implemented in utils/kv.js"
