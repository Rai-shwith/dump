# TASK-015 — Frontend Scaffold

## Objective
Set up the React + Vite + TypeScript frontend with routing, typed utilities, and correct folder structure.
No real pages yet. A working scaffold that compiles without errors.

## Scope
- Vite app already created by developer (with TypeScript template)
- Install React Router
- Set up folder structure including services/, types/, constants/
- Set up typed utility files
- Set up robots.txt and noindex meta
- Create placeholder page components

## Prerequisites
- TASK-001 through TASK-014 completed (backend stable)
- npm create vite@latest dump-web -- --template react-ts already run inside apps/

## Files Allowed to Change
- apps/dump-web/ (entire directory)

## Files That Must Not Be Changed
- workers/
- docs/ (except GEMINI.md at the end)

## Suggested AI Model
Gemini 2.5 Pro

## Coding Prompt

Set up the React + Vite + TypeScript frontend scaffold for Dump.
Read docs/ARCHITECTURE.md (Frontend section) and docs/AI_RULES.md before writing code.
Follow all rules in AI_RULES.md strictly.

1. Confirm tsconfig.json has strict: true. If not, add it.

2. Install dependencies:
   npm install react-router-dom
   npm install -D @types/react-router-dom

3. Create apps/dump-web/public/robots.txt:
   ```
   User-agent: *
   Disallow: /
   ```

4. Update apps/dump-web/index.html:
   Add in <head>:
   ```html
   <meta name="robots" content="noindex,nofollow">
   ```

5. Create apps/dump-web/src/types/index.ts:
   ```typescript
   export type ClipboardMode = "public" | "reserved" | "protected";
   export type PasswordMode = "view" | "edit";

   export interface ClipboardMeta {
     code: string;
     mode: ClipboardMode;
     passwordMode: PasswordMode | null;
     expiresAt: string | null;
     isOneTimeView: boolean;
     isStarred: boolean;
     createdAt: string;
   }

   export interface ClipboardContent extends ClipboardMeta {
     content: string;
   }

   export interface LockedResponse {
     locked: true;
     passwordMode: PasswordMode;
   }

   export interface StarredEntry {
     code: string;
     createdAt: string;
     expiresAt: string | null;
     isOneTimeView: boolean;
   }

   export interface CreateClipboardRequest {
     code?: string;
     content: string;
     mode: ClipboardMode;
     passwordMode?: PasswordMode;
     password?: string;
     expiresAt?: string | null;
     isOneTimeView?: boolean;
   }

   export interface CreateClipboardResponse {
     code: string;
     ownerToken: string;
     expiresAt: string | null;
     isOneTimeView: boolean;
   }
   ```

6. Create apps/dump-web/src/constants/index.ts:
   ```typescript
   export const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8787/api";

   export const EXPIRY_PRESETS = [
     { label: "1 minute",  ms: 60 * 1000 },
     { label: "5 minutes", ms: 5 * 60 * 1000 },
     { label: "15 minutes", ms: 15 * 60 * 1000 },
     { label: "1 hour",    ms: 60 * 60 * 1000 },
     { label: "1 day",     ms: 24 * 60 * 60 * 1000 },
     { label: "1 week",    ms: 7 * 24 * 60 * 60 * 1000 },
     { label: "1 month",   ms: 30 * 24 * 60 * 60 * 1000 },
     { label: "1 year",    ms: 365 * 24 * 60 * 60 * 1000 },
   ] as const;

   export const MAX_CONTENT_BYTES = 262144;
   export const MIN_CODE_LENGTH = 4;
   export const DEFAULT_CODE_LENGTH = 8;
   ```

7. Create apps/dump-web/src/services/clipboardApi.ts:
   (API call functions — no React imports)
   ```typescript
   import { API_BASE } from "../constants";
   import type {
     ClipboardContent, LockedResponse, CreateClipboardRequest,
     CreateClipboardResponse
   } from "../types";

   interface ReadHeaders {
     ownerToken?: string;
     password?: string;
   }

   export async function createClipboard(
     body: CreateClipboardRequest
   ): Promise<CreateClipboardResponse> {
     const res = await fetch(`${API_BASE}/clipboard`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(body),
     });
     if (!res.ok) {
       const err = await res.json() as { error: string };
       throw new Error(err.error);
     }
     return res.json() as Promise<CreateClipboardResponse>;
   }

   export async function readClipboard(
     code: string,
     headers: ReadHeaders
   ): Promise<ClipboardContent | LockedResponse> {
     const reqHeaders: Record<string, string> = {};
     if (headers.ownerToken) reqHeaders["X-Owner-Token"] = headers.ownerToken;
     if (headers.password) reqHeaders["X-Clipboard-Password"] = headers.password;
     const res = await fetch(`${API_BASE}/clipboard/${code}`, { headers: reqHeaders });
     if (!res.ok) {
       const err = await res.json() as { error: string };
       throw new Error(err.error);
     }
     return res.json() as Promise<ClipboardContent | LockedResponse>;
   }

   export async function deleteClipboard(
     code: string,
     headers: ReadHeaders
   ): Promise<void> {
     const reqHeaders: Record<string, string> = {};
     if (headers.ownerToken) reqHeaders["X-Owner-Token"] = headers.ownerToken;
     if (headers.password) reqHeaders["X-Clipboard-Password"] = headers.password;
     const res = await fetch(`${API_BASE}/clipboard/${code}`, {
       method: "DELETE",
       headers: reqHeaders,
     });
     if (!res.ok) {
       const err = await res.json() as { error: string };
       throw new Error(err.error);
     }
   }
   ```

8. Create apps/dump-web/src/utils/tokens.ts:
   ```typescript
   export function getOwnerToken(code: string): string | null {
     return localStorage.getItem(`ownerTokens.${code}`);
   }

   export function setOwnerToken(code: string, token: string): void {
     localStorage.setItem(`ownerTokens.${code}`, token);
   }

   export function removeOwnerToken(code: string): void {
     localStorage.removeItem(`ownerTokens.${code}`);
   }
   ```

9. Create apps/dump-web/src/utils/codegen.ts:
   ```typescript
   const CHARSET = "abcdefghijklmnopqrstuvwxyz0123456789";

   export function generateCode(length = 8): string {
     const values = new Uint8Array(length);
     crypto.getRandomValues(values);
     return Array.from(values)
       .map((v) => CHARSET[v % CHARSET.length])
       .join("");
   }
   ```

10. Create apps/dump-web/src/utils/time.ts:
    ```typescript
    export function formatLocalTime(utcString: string | null): string {
      if (!utcString) return "Never";
      return new Date(utcString).toLocaleString();
    }

    export function toUTCString(localDateTimeString: string): string {
      return new Date(localDateTimeString).toISOString();
    }

    export function addMilliseconds(ms: number): string {
      return new Date(Date.now() + ms).toISOString();
    }
    ```

11. Create placeholder page components (return a single <div> with the page name):
    - apps/dump-web/src/pages/HomePage.tsx
    - apps/dump-web/src/pages/CreatePage.tsx
    - apps/dump-web/src/pages/ViewPage.tsx
    - apps/dump-web/src/pages/NotFoundPage.tsx

12. Update apps/dump-web/src/App.tsx:
    Set up React Router:
    ```tsx
    import { BrowserRouter, Routes, Route } from "react-router-dom";
    import HomePage from "./pages/HomePage";
    import CreatePage from "./pages/CreatePage";
    import ViewPage from "./pages/ViewPage";
    import NotFoundPage from "./pages/NotFoundPage";

    export default function App() {
      return (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/new" element={<CreatePage />} />
            <Route path="/:code" element={<ViewPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      );
    }
    ```

13. Create apps/dump-web/.env.local:
    ```
    VITE_API_BASE=http://localhost:8787/api
    ```

## Manual Testing Instructions

1. cd apps/dump-web && npm install && npm run build
   → Must compile with zero TypeScript errors

2. npm run dev
   → Open http://localhost:5173 → HomePage placeholder
   → /new → CreatePage placeholder
   → /abc123 → ViewPage placeholder
   → /anything/else → NotFoundPage

3. Check browser console → zero errors
4. View page source → robots meta tag present
5. Confirm public/robots.txt is served at /robots.txt

## Expected Behavior
- Zero TypeScript errors on build
- All routes render correct placeholder components
- Typed utilities exported and importable
- services/clipboardApi.ts compiles correctly

## Commit Suggestion
feat(frontend): initialize TypeScript scaffold with routing, types, and service layer

## How to Update GEMINI.md After Completion
In the Current Project State section:
- Move TASK-015 from Not Started to Completed Tasks
- Add summary: "Frontend scaffold initialized with TypeScript, routing, types, services, and utilities"