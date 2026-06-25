# TASK-014 — Security Headers Middleware

## Objective
Implement the security headers and CORS middleware.
Apply it to every response in the worker.

## Scope
- Implement addSecurityHeaders in middleware/cors.js
- Apply to all responses in index.js

## Prerequisites
- TASK-001 completed

## Files Allowed to Change
- workers/dump-worker/src/middleware/cors.js
- workers/dump-worker/src/index.js

## Files That Must Not Be Changed
- All other files
- docs/ (except GEMINI.md at the end)

## Suggested AI Model
Gemini 2.5 Flash

## Coding Prompt

Implement security headers middleware for the Dump Worker.
Read docs/DECISIONS.md (D-013) and docs/API.md (Header Reference) before writing code.

In workers/dump-worker/src/middleware/cors.js implement:

  ALLOWED_ORIGINS
  - ["https://dump.ashwithrai.me", "http://localhost:5173"]

  addCorsHeaders(response, requestOrigin)
  - If requestOrigin is in ALLOWED_ORIGINS:
    - Set Access-Control-Allow-Origin: requestOrigin
    - Set Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
    - Set Access-Control-Allow-Headers: Content-Type, X-Owner-Token, X-Clipboard-Password
    - Set Vary: Origin
  - Return new Response with added headers

  addSecurityHeaders(response)
  - Add to response headers:
    - X-Content-Type-Options: nosniff
    - X-Frame-Options: DENY
    - Referrer-Policy: no-referrer
    - Content-Security-Policy: default-src 'none'
  - Return new Response with added headers

  applyMiddleware(response, requestOrigin)
  - Calls addCorsHeaders then addSecurityHeaders
  - Returns final response

In workers/dump-worker/src/index.js:
  - Import applyMiddleware
  - Wrap every handler call result with applyMiddleware(result, origin)
  - Extract origin from request.headers.get("Origin")
  - Handle OPTIONS preflight:
    return applyMiddleware(new Response(null, { status: 200 }), origin)

## Manual Testing Instructions

Test 1 — Check headers on any response:
  curl -v http://localhost:8787/api/clipboard/test
  → Response headers should include:
    X-Content-Type-Options: nosniff
    X-Frame-Options: DENY
    Referrer-Policy: no-referrer

Test 2 — CORS from allowed origin:
  curl -H "Origin: http://localhost:5173" http://localhost:8787/api/starred
  → Access-Control-Allow-Origin: http://localhost:5173

Test 3 — CORS from disallowed origin:
  curl -H "Origin: https://evil.com" http://localhost:8787/api/starred
  → No Access-Control-Allow-Origin header

Test 4 — OPTIONS preflight:
  curl -X OPTIONS -H "Origin: http://localhost:5173" http://localhost:8787/api/clipboard
  → 200 with CORS headers

## Expected Behavior
Security headers present on all responses.
CORS only allows configured origins.
OPTIONS handled correctly.

## Commit Suggestion
feat(worker): implement security headers and CORS middleware

## How to Update GEMINI.md After Completion
In the Current Project State section:
- Move TASK-014 from Not Started to Completed Tasks
- Add summary: "Security headers and CORS middleware applied to all responses"
