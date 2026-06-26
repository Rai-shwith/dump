# TASK-017 — Frontend Read Clipboard Page

## Objective
Build the view clipboard page. Displays content, handles locked state, handles one-time view warning.

## Scope
- ViewPage.jsx fully functional
- Fetch clipboard on mount
- Show content or password prompt
- Show expiration in local timezone
- Show delete and edit buttons (wired in TASK-018)

## Prerequisites
- TASK-015, TASK-016 completed
- Backend running locally

## Files Allowed to Change
- apps/dump-web/src/pages/ViewPage.jsx

## Files That Must Not Be Changed
- All other files
- docs/ (except AGENTS.md at the end)

## Suggested AI Model
Gemini 2.5 Pro

## Coding Prompt

Build ViewPage.jsx for the Dump frontend.
Read docs/API.md (GET /api/clipboard/:code) before writing code.
Use only plain HTML elements. No UI library. No styling required.

On mount:
1. Extract code from URL params.
2. Get owner token from getOwnerToken(code).
3. Call GET /api/clipboard/:code with headers:
   - X-Owner-Token if available

Handle response:
- 404: show "Clipboard not found or expired"
- 200 with locked: true: show password input form
- 200 with content: show clipboard content

Password prompt state:
- Show a password input and submit button
- On submit: re-fetch GET /api/clipboard/:code with X-Clipboard-Password header
- If 403: show "Incorrect password"
- If 200: show content

Content display state:
- Show content in a <pre> or <textarea readonly>
- Show code, mode, expiresAt (formatted with formatLocalTime), isOneTimeView
- If isOneTimeView: show a warning "This clipboard will be deleted after viewing"
  (show before content is fetched — show on the locked/loading state before confirm)
  Actually: show warning after content loads since it is already deleted by then.
  Message: "This was a one-time view clipboard. It has been permanently deleted."
- Show isStarred status
- Show "Star" button if mode is public and not starred
- Show "Unstar" button if mode is public and starred
- Show "Edit" button (disabled/placeholder for now — TASK-018)
- Show "Delete" button (disabled/placeholder for now — TASK-018)

Star/unstar:
- POST /api/clipboard/:code/star → update isStarred state
- DELETE /api/clipboard/:code/star → update isStarred state

## Manual Testing Instructions

Test 1 — View public clipboard:
  Navigate to /:code → content displayed

Test 2 — View nonexistent clipboard:
  → "Clipboard not found or expired" message

Test 3 — View locked clipboard:
  → password prompt shown
  Enter wrong password → error shown
  Enter correct password → content shown

Test 4 — View with owner token (no prompt):
  (owner token in localStorage from creation)
  → content shown without password prompt

Test 5 — One-time view message:
  Navigate to one-time view clipboard
  → content shown with deletion message

Test 6 — Star/unstar:
  Click star → isStarred updates

## Expected Behavior
Correct state shown for all clipboard types.
Password prompt works.
Owner token bypasses prompt automatically.

## AI Workflow
0. At anypoint if any ambiguity or doubt arises. *Stop Coding*. Ask questions, clarify, then proceed. DO NOT ASSUME.
1. Complete the task requirements.
2. Create a test file in TESTS/ named after the task (e.g. TESTS/TASK-017.sh) using the Manual Testing Instructions.
3. Execute the test file. Run npm run lint. Fix any errors if tests fail do not create walkarounds to bypass linter.
4. Report the test results to the user and WAIT for their explicit approval.
5. Do NOT commit changes and do NOT update AGENTS.md "Completed Tasks" until the user approves.
6. Once approved, commit the changes including the test script.

## Commit Suggestion
feat(frontend): implement view clipboard page

## How to Update AGENTS.md After Completion
In the Current Project State section:
- Move TASK-017 from Not Started to Completed Tasks
- Add summary: "View clipboard page functional with auth, locked state, and star toggle"