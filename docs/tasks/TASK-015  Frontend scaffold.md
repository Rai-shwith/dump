# TASK-015 — Frontend Scaffold

## Objective
Initialize the React + Vite frontend with basic routing, global layout, and utility setup.
No real pages yet. Just a working scaffold that compiles and runs.

## Scope
- Vite app already created by developer
- Set up React Router with placeholder page components
- Set up localStorage utility for owner tokens
- Set up API base URL config
- Set up robots.txt
- Set up noindex meta tag in index.html

## Prerequisites
- TASK-001 through TASK-014 completed (backend stable)
- npm create vite@latest already run inside apps/dump-web

## Files Allowed to Change
- apps/dump-web/ (entire directory)

## Files That Must Not Be Changed
- workers/
- docs/ (except GEMINI.md at the end)

## Suggested AI Model
Gemini 2.5 Pro

## Coding Prompt

Set up the React + Vite frontend scaffold for Dump.
Read docs/ARCHITECTURE.md (Frontend section) before writing code.

1. Install dependencies:
   - react-router-dom

2. Create apps/dump-web/public/robots.txt:
   User-agent: *
   Disallow: /

3. Update apps/dump-web/index.html:
   - Add <meta name="robots" content="noindex,nofollow"> in <head>

4. Create apps/dump-web/src/utils/api.js:
   - Export: const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8787/api"
   - Export async function apiFetch(path, options):
     - Calls fetch(API_BASE + path, options)
     - Returns response object (caller handles parsing)

5. Create apps/dump-web/src/utils/tokens.js:
   - Export getOwnerToken(code): localStorage.getItem("ownerTokens." + code)
   - Export setOwnerToken(code, token): localStorage.setItem("ownerTokens." + code, token)
   - Export removeOwnerToken(code): localStorage.removeItem("ownerTokens." + code)

6. Create apps/dump-web/src/utils/codegen.js:
   - Export generateCode():
     const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
     Generate 8 random characters from chars using crypto.getRandomValues
     Return the string

7. Create apps/dump-web/src/utils/time.js:
   - Export formatLocalTime(utcString):
     If null return "Never"
     Return new Date(utcString).toLocaleString()
   - Export toUTCString(localDateTimeString):
     Return new Date(localDateTimeString).toISOString()

8. Create placeholder page components (just return a <div> with page name):
   - apps/dump-web/src/pages/HomePage.jsx
   - apps/dump-web/src/pages/CreatePage.jsx
   - apps/dump-web/src/pages/ViewPage.jsx
   - apps/dump-web/src/pages/NotFoundPage.jsx

9. Update apps/dump-web/src/App.jsx:
   - Set up React Router with routes:
     / → HomePage
     /new → CreatePage
     /:code → ViewPage
     * → NotFoundPage

10. Create apps/dump-web/.env.local (for development):
    VITE_API_BASE=http://localhost:8787/api

## Manual Testing Instructions

1. cd apps/dump-web && npm install && npm run dev
2. Open http://localhost:5173 → should show HomePage placeholder
3. Navigate to http://localhost:5173/new → CreatePage placeholder
4. Navigate to http://localhost:5173/abc123 → ViewPage placeholder
5. Navigate to http://localhost:5173/nonexistent/route → NotFoundPage
6. Check browser console — no errors
7. View page source — robots meta tag present

## Expected Behavior
App compiles and runs without errors.
All routes render correct placeholder components.
Utility functions exported correctly.

## Commit Suggestion
feat(frontend): initialize scaffold with routing and utilities

## How to Update GEMINI.md After Completion
In the Current Project State section:
- Move TASK-015 from Not Started to Completed Tasks
- Add summary: "Frontend scaffold initialized with routing, utilities, and placeholder pages"
