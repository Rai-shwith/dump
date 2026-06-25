# TASK-001 — Worker Init and Hono Routing Scaffold

## Objective
Initialize the Cloudflare Worker project using Hono and TypeScript.
Set up the Hono app, define all routes pointing to placeholder handlers,
establish the folder structure, and confirm the worker runs locally.

## Scope
- Initialize workers/dump-worker with wrangler and Hono
- Create index.ts with Hono app and all routes
- Create placeholder route files, service stubs, utility stubs, types, and constants
- Confirm worker runs locally with wrangler dev

## Prerequisites
- Cloudflare account exists
- Wrangler CLI installed globally (npm install -g wrangler)
- KV namespace created in Cloudflare dashboard (or via wrangler kv namespace create)
- wrangler login completed

## Files Allowed to Change
- workers/dump-worker/ (entire directory, new files only at this stage)

## Files That Must Not Be Changed
- apps/
- docs/ (except GEMINI.md at the end)

## Suggested AI Model
Gemini 2.5 Pro

## Coding Prompt

You are initializing a Cloudflare Worker for the Dump clipboard service using Hono and TypeScript.
Read docs/ARCHITECTURE.md and docs/AI_RULES.md before writing any code.

Follow all rules in AI_RULES.md strictly. Pay attention to:
- TypeScript strict mode everywhere
- No `any` types
- Named exports in all utility and type files
- File size limits (soft 250 lines, hard 400 lines)
- Constants in constants/, types in types/

Steps:

1. Create workers/dump-worker/package.json:
   ```json
   {
     "name": "dump-worker",
     "version": "0.1.0",
     "private": true,
     "scripts": {
       "dev": "wrangler dev",
       "deploy": "wrangler deploy",
       "lint": "eslint src --ext .ts"
     },
     "dependencies": {
       "hono": "^4.0.0"
     },
     "devDependencies": {
       "@cloudflare/workers-types": "^4.0.0",
       "typescript": "^5.0.0",
       "wrangler": "^3.0.0"
     }
   }
   ```

2. Create workers/dump-worker/tsconfig.json:
   ```json
   {
     "compilerOptions": {
       "target": "ES2022",
       "module": "ES2022",
       "moduleResolution": "bundler",
       "strict": true,
       "lib": ["ES2022"],
       "types": ["@cloudflare/workers-types"],
       "noUnusedLocals": true,
       "noUnusedParameters": true,
       "noImplicitReturns": true
     },
     "include": ["src/**/*.ts"]
   }
   ```

3. Create workers/dump-worker/wrangler.toml:
   ```toml
   name = "dump-worker"
   main = "src/index.ts"
   compatibility_date = "2024-01-01"

   [[kv_namespaces]]
   binding = "CLIPBOARD_KV"
   id = "REPLACE_WITH_REAL_KV_ID"
   preview_id = "REPLACE_WITH_PREVIEW_KV_ID"
   ```

4. Create workers/dump-worker/src/types/index.ts:
   Define and export the following interfaces:
   ```typescript
   export interface Env {
     CLIPBOARD_KV: KVNamespace;
     PASSWORD_PEPPER: string;
   }

   export type ClipboardMode = "public" | "reserved" | "protected";
   export type PasswordMode = "view" | "edit";

   export interface ClipboardMeta {
     code: string;
     mode: ClipboardMode;
     passwordHash: string | null;
     passwordMode: PasswordMode | null;
     ownerTokenHash: string;
     createdAt: string;
     expiresAt: string | null;
     isOneTimeView: boolean;
     isStarred: boolean;
   }

   export interface StarredEntry {
     code: string;
     createdAt: string;
     expiresAt: string | null;
     isOneTimeView: boolean;
   }

   export interface ApiError {
     error: string;
   }

   export interface ApiSuccess {
     success: boolean;
   }
   ```

5. Create workers/dump-worker/src/constants/index.ts:
   ```typescript
   export const RESERVED_KEYWORDS: readonly string[] = [
     "admin", "api", "raw", "json", "create", "edit",
     "delete", "settings", "help", "docs", "host",
   ];

   export const ALLOWED_ORIGINS: readonly string[] = [
     "https://dump.ashwithrai.me",
     "http://localhost:5173",
   ];

   export const MAX_CONTENT_BYTES = 262144; // 256KB
   export const MAX_CODE_LENGTH_MIN = 4;
   export const DEFAULT_CODE_LENGTH = 8;
   export const MAX_STARRED = 5;
   export const MAX_EXPIRY_YEARS = 1;
   export const STARRED_KEY = "app:starred";
   ```

6. Create workers/dump-worker/src/index.ts:
   - Import Hono and create a typed app: `new Hono<{ Bindings: Env }>()`
   - Import route registration functions from routes/clipboard.ts and routes/starred.ts
   - Register all routes:
     - POST   /api/clipboard
     - GET    /api/clipboard/:code
     - GET    /api/clipboard/:code/raw
     - PUT    /api/clipboard/:code
     - DELETE /api/clipboard/:code
     - POST   /api/clipboard/:code/star
     - DELETE /api/clipboard/:code/star
     - GET    /api/starred
   - Add a 404 fallback: c.json({ error: "Not found" }, 404)
   - Export the Hono app as default

7. Create workers/dump-worker/src/routes/clipboard.ts:
   - Export named functions: registerClipboardRoutes(app: Hono<{ Bindings: Env }>)
   - Each route returns: c.json({ message: "not implemented" }, 501)
   - Routes to register: POST /, GET /:code, GET /:code/raw, PUT /:code, DELETE /:code

8. Create workers/dump-worker/src/routes/starred.ts:
   - Export: registerStarredRoutes(app: Hono<{ Bindings: Env }>)
   - Routes: POST /:code/star, DELETE /:code/star, GET / (for /api/starred)
   - Each returns 501 placeholder

9. Create workers/dump-worker/src/services/clipboardService.ts:
   Add a single comment: "Clipboard business logic — implemented across TASK-003 to TASK-009"
   Export an empty object or placeholder to satisfy imports: export {};

10. Create workers/dump-worker/src/services/starredService.ts:
    Add a single comment: "Starred business logic — implemented in TASK-011"
    Export: export {};

11. Create stub files with explanatory comments (one line each):
    - src/utils/hash.ts       → "SHA-256 hashing utilities — implemented in TASK-007"
    - src/utils/validate.ts   → "Validation utilities — implemented in TASK-013"
    - src/utils/kv.ts         → "KV helper utilities — implemented in TASK-002"
    - src/utils/expiry.ts     → "Expiry utilities — implemented in TASK-010"
    - src/middleware/security.ts → "Security headers and CORS middleware — implemented in TASK-014"

    Each stub must still be valid TypeScript (add `export {};` to each).

## Manual Testing Instructions

1. cd workers/dump-worker && npm install
2. Run: npx wrangler dev
3. Confirm no TypeScript errors on startup

Test each route:
  curl -X POST http://localhost:8787/api/clipboard
  → expect 501 { "message": "not implemented" }

  curl http://localhost:8787/api/clipboard/test123
  → expect 501

  curl http://localhost:8787/api/clipboard/test123/raw
  → expect 501

  curl -X PUT http://localhost:8787/api/clipboard/test123
  → expect 501

  curl -X DELETE http://localhost:8787/api/clipboard/test123
  → expect 501

  curl -X POST http://localhost:8787/api/clipboard/test123/star
  → expect 501

  curl -X DELETE http://localhost:8787/api/clipboard/test123/star
  → expect 501

  curl http://localhost:8787/api/starred
  → expect 501

  curl http://localhost:8787/api/unknown
  → expect 404 { "error": "Not found" }

4. No TypeScript errors in wrangler dev output.

## Expected Behavior
- Worker starts without errors
- All defined routes return 501
- Unknown routes return 404
- TypeScript compiles cleanly in strict mode

## Commit Suggestion
feat(worker): initialize Hono + TypeScript worker scaffold with typed routes

## How to Update GEMINI.md After Completion
In the Current Project State section:
- Move TASK-001 from Not Started to Completed Tasks
- Add summary: "Hono + TypeScript worker initialized with typed scaffold and route stubs"
