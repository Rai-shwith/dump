# TASK-018 — Frontend Edit and Delete Flows

## Objective
Wire up edit and delete functionality on the view page.

## Scope
- Edit button opens inline edit form on ViewPage
- Delete button calls DELETE endpoint and redirects home
- Auth headers sent correctly

## Prerequisites
- TASK-017 completed

## Files Allowed to Change
- apps/dump-web/src/pages/ViewPage.jsx

## Files That Must Not Be Changed
- All other files
- docs/ (except AGENTS.md at the end)

## Suggested AI Model
Gemini 2.5 Pro

## Coding Prompt

Add edit and delete functionality to ViewPage.jsx.
Read docs/API.md (PUT and DELETE /api/clipboard/:code) before writing code.

Delete flow:
1. Delete button click:
   - Build headers: X-Owner-Token if available
   - If protected clipboard and no owner token: prompt for password
     Show a simple window.prompt or inline input for password
     Add X-Clipboard-Password header
   - Call DELETE /api/clipboard/:code
   - If 200: navigate to "/"
   - If 403: show "Incorrect password or unauthorized"
   - If 404: show "Already deleted"

Edit flow:
1. Edit button click: show inline edit form below content
2. Edit form fields:
   - Textarea pre-filled with current content
   - Expiration select (same options as create)
   - Submit and Cancel buttons
3. On submit:
   - Build headers: X-Owner-Token if available, X-Clipboard-Password if needed
   - Build body with only changed fields
   - PUT /api/clipboard/:code
   - If 200: update displayed content and expiration, hide edit form
   - If 403: show auth error
   - If 400: show validation error

For edit password clipboards without owner token:
  Show password input at top of edit form.
  Include X-Clipboard-Password in PUT request.

## Manual Testing Instructions

Test 1 — Delete public clipboard:
  View clipboard → click delete → redirected to home

Test 2 — Delete protected clipboard with owner token:
  → deleted without password prompt

Test 3 — Delete protected clipboard without owner token:
  → password prompt shown
  Wrong password → error
  Correct password → deleted

Test 4 — Edit content:
  Click edit → change content → submit
  → content updated on page

Test 5 — Edit expiration:
  Change expiration → submit
  → expiration updated and displayed correctly in local timezone

## Expected Behavior
Delete and edit flows work correctly for all clipboard modes.
Auth handled correctly per mode.

## Commit Suggestion
feat(frontend): implement edit and delete flows on view page

## How to Update AGENTS.md After Completion
In the Current Project State section:
- Move TASK-018 from Not Started to Completed Tasks
- Add summary: "Edit and delete flows implemented on view page"
