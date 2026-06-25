# TASK-001 — Worker Init and Routing Scaffold

## Objective
Initialize the Cloudflare Worker project and set up a basic request router.
No business logic yet. Just a working worker that routes requests to placeholder handlers.

## Scope
- Initialize workers/dump-worker with wrangler
- Create index.js with a basic fetch handler and URL router
- Create placeholder handler files
- Create placeholder middleware file
- Confirm worker runs locally with wrangler dev

## Prerequisites
- Cloudflare account exists
- Wrangler CLI installed globally (npm install -g wrangler)
- KV namespace created in Cloudflare dashboard (or via wrangler)
- wrangler login completed

## Files Allowed to Change
- workers/dump-worker/ (entire directory, new files only at this stage)

## Files That Must Not Be Changed
- apps/
- docs/ (except GEMINI.md at the end)

## Suggested AI Model
Gemini 2.5 Pro

## Coding Prompt

You are initializing a Cloudflare Worker for the Dump clipboard service.

Do the following:

1. Create workers/dump-worker/package.json:
   - name: dump-worker
   - type: module
   - No dependencies needed yet

2. Create workers/dump-worker/wrangler.toml:
   - name: dump-worker
   - main: src/index.js
   - compatibility_date: use today's date
   - Add a KV namespace binding:
     - binding name: CLIPBOARD_KV
     - id: placeholder (user will fill in the real KV namespace ID)
     - preview_id: placeholder (user will fill in the preview KV namespace ID)

3. Create workers/dump-worker/src/index.js:
   - ES module format with a default export fetch handler
   - Parse the URL and METHOD from the request
   - Route the following paths to placeholder handler functions:
     - POST /api/clipboard → handleCreate
     - GET /api/clipboard/:code → handleRead
     - GET /api/clipboard/:code/raw → handleRaw
     - PUT /api/clipboard/:code → handleUpdate
     - DELETE /api/clipboard/:code → handleDelete
     - POST /api/clipboard/:code/star → handleStar
     - DELETE /api/clipboard/:code/star → handleUnstar
     - GET /api/starred → handleGetStarred
     - OPTIONS * → return 200 with CORS headers (preflight)
   - Return 404 JSON for unmatched routes
   - Each placeholder handler returns a JSON response:
     { "message": "handler name — not implemented yet" }

4. Create workers/dump-worker/src/handlers/clipboard.js:
   - Export named async functions: handleCreate, handleRead, handleRaw,
     handleUpdate, handleDelete
   - Each returns a placeholder JSON Response as above

5. Create workers/dump-worker/src/handlers/starred.js:
   - Export named async functions: handleStar, handleUnstar, handleGetStarred
   - Each returns a placeholder JSON Response as above

6. Create workers/dump-worker/src/middleware/cors.js:
   - Export a named function: addSecurityHeaders(response)
   - For now just returns the response unmodified (placeholder)

7. Create workers/dump-worker/src/utils/hash.js — empty file with a comment:
   "SHA-256 hashing utilities — implemented in TASK-007"

8. Create workers/dump-worker/src/utils/validate.js — empty file with a comment:
   "Validation utilities — implemented in TASK-013"

9. Create workers/dump-worker/src/utils/kv.js — empty file with a comment:
   "KV helper utilities — implemented in TASK-002"

10. Create workers/dump-worker/src/utils/expiry.js — empty file with a comment:
    "Expiry utilities — implemented in TASK-010"

Do not implement any business logic yet.
All handlers return placeholder responses only.
Use ES modules (import/export) throughout.
No TypeScript.

## Manual Testing Instructions

1. cd workers/dump-worker
2. Run: npx wrangler dev
3. Test each route with curl or a REST client:

   curl http://localhost:8787/api/clipboard -X POST
   → expect: { "message": "handleCreate — not implemented yet" }

   curl http://localhost:8787/api/clipboard/test123 -X GET
   → expect: { "message": "handleRead — not implemented yet" }

   curl http://localhost:8787/api/clipboard/test123/raw -X GET
   → expect: { "message": "handleRaw — not implemented yet" }

   curl http://localhost:8787/api/clipboard/test123 -X PUT
   → expect: { "message": "handleUpdate — not implemented yet" }

   curl http://localhost:8787/api/clipboard/test123 -X DELETE
   → expect: { "message": "handleDelete — not implemented yet" }

   curl http://localhost:8787/api/clipboard/test123/star -X POST
   → expect: { "message": "handleStar — not implemented yet" }

   curl http://localhost:8787/api/clipboard/test123/star -X DELETE
   → expect: { "message": "handleUnstar — not implemented yet" }

   curl http://localhost:8787/api/starred -X GET
   → expect: { "message": "handleGetStarred — not implemented yet" }

   curl http://localhost:8787/api/unknown -X GET
   → expect: 404 JSON response

   curl http://localhost:8787/api/clipboard -X OPTIONS
   → expect: 200 response

4. Confirm no errors in wrangler dev console.

## Expected Behavior
- Worker starts without errors
- Every defined route returns a placeholder JSON response
- Unknown routes return 404
- OPTIONS returns 200

## Commit Suggestion
feat(worker): initialize worker scaffold with routing and placeholder handlers

## How to Update GEMINI.md After Completion
In the Current Project State section:
- Move TASK-001 from Not Started to Completed Tasks
- Add summary: "Worker initialized with routing scaffold and placeholder handlers"
