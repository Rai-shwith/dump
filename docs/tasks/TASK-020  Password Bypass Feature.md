# TASK-020 — Password Bypass Feature

## Objective
Implement a "Bypass password for me" feature for clipboard creators to save and bypass their own passwords locally.

## Scope
- Update `CreatePage.tsx`: Add a checkbox "Bypass password for me" for protected clipboards. If checked, save the raw password in `localStorage` alongside the owner token. If not checked, do not save the owner token at all.
- Update `ViewPage.tsx`:
  - When bypassing the lock using the owner token, display a toast notification (using `react-hot-toast` or similar) to inform the user that the password was bypassed.
  - Show a "Show Password" button which reveals the raw password (retrieved from `localStorage`).

## Prerequisites
- TASK-018, TASK-019 completed (or this can be done anytime before/after).

## Architectural Decisions
- See D-019 in `DECISIONS.md`.

## Notes
- Needs clarification on the exact `localStorage` key schema (e.g. merging into a JSON object for `ownerTokens.<code>` or keeping it separate like `ownerPasswords.<code>`).
- Needs clarification on the notification library to install (`react-hot-toast` etc).
