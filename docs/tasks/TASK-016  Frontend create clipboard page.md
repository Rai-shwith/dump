# TASK-016 — Frontend Create Clipboard Page

## Objective
Build the create clipboard page. Functional but unstyled.
User can create a clipboard and be redirected to the view page.

## Scope
- CreatePage.jsx fully functional
- Form: content, code, mode, password, expiration
- On success: store owner token, redirect to /:code

## Prerequisites
- TASK-015 completed
- Backend running locally

## Files Allowed to Change
- apps/dump-web/src/pages/CreatePage.jsx

## Files That Must Not Be Changed
- All other files
- docs/ (except GEMINI.md at the end)

## Suggested AI Model
Gemini 2.5 Pro

## Coding Prompt

Build CreatePage.jsx for the Dump frontend.
Read docs/API.md (POST /api/clipboard) and docs/DECISIONS.md before writing code.
Use only plain HTML elements. No UI library. No styling required.

Fields to include in the form:
1. Textarea for content (required)
2. Text input for code (optional, show generated code as placeholder)
   - Show a "Regenerate" button next to it
3. Select for mode: public, reserved, protected
4. If mode is protected:
   - Select for passwordMode: view, edit
   - Password input
5. Expiration select with options:
   - 1 minute, 5 minutes, 15 minutes, 1 hour, 1 day, 1 week, 1 month, 1 year
   - Infinite (only shown when mode is public)
   - One-Time View
   - Custom (shows a datetime-local input)
6. Submit button

On submit:
1. Build request body:
   - code: input value (trimmed, lowercased) or empty string (worker generates)
   - content: textarea value
   - mode: selected mode
   - passwordMode: if protected
   - password: if protected
   - expiresAt: if preset selected, calculate UTC timestamp
     Use toUTCString from utils/time.js for custom
   - isOneTimeView: true if one-time view selected
2. Call apiFetch("/clipboard", { method: "POST", body: JSON.stringify(body),
   headers: { "Content-Type": "application/json" } })
3. If 201: setOwnerToken(code, ownerToken), navigate to "/" + code
4. If error: show error message from response body

Expiration calculation for presets (in milliseconds from now):
  1 minute: 60 * 1000
  5 minutes: 5 * 60 * 1000
  15 minutes: 15 * 60 * 1000
  1 hour: 3600 * 1000
  1 day: 86400 * 1000
  1 week: 7 * 86400 * 1000
  1 month: 30 * 86400 * 1000
  1 year: 365 * 86400 * 1000

For Infinite: expiresAt = null, isOneTimeView = false
For One-Time View: isOneTimeView = true, expiresAt = null

## Manual Testing Instructions

1. Open http://localhost:5173/new
2. Create a basic public clipboard → redirected to view page (placeholder for now)
3. Create with custom code → code appears in URL
4. Create protected clipboard → fill password fields
5. Create one-time view clipboard → verify isOneTimeView in network request
6. Create with custom expiration → datetime picker appears
7. Try to create with no content → error shown

## Expected Behavior
Clipboard created successfully via API.
Owner token stored in localStorage.
User redirected to clipboard URL on success.
Errors displayed on failure.

## Commit Suggestion
feat(frontend): implement create clipboard page

## How to Update GEMINI.md After Completion
In the Current Project State section:
- Move TASK-016 from Not Started to Completed Tasks
- Add summary: "Create clipboard page functional"
