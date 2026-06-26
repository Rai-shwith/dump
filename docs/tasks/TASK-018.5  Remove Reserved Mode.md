# TASK-018.5 — Remove Reserved Mode

## Objective
Remove the "reserved" clipboard mode entirely from the system. It was deemed redundant and flawed, so the system will now only support `public` and `protected` modes.

## Scope
1. **Documentation**:
   - `docs/DECISIONS.md`: Remove D-010 (Reserved Codes) and update D-006 (Clipboard Modes).
   - `docs/API.md`: Remove `reserved` from endpoints and definitions.
2. **Backend**:
   - `workers/dump-worker/src/types/index.ts`: Remove `reserved` from `ClipboardMode`.
   - `workers/dump-worker/src/utils/validate.ts` (or equivalent): Ensure validation only permits `public` or `protected`.
3. **Frontend**:
   - `apps/dump-web/src/types/index.ts`: Remove `reserved` from `ClipboardMode`.
   - `apps/dump-web/src/pages/CreatePage.tsx`: Remove the "Reserved" option from the mode dropdown.

## Prerequisites
- TASK-018 completed

## Files Allowed to Change
- docs/DECISIONS.md
- docs/API.md
- workers/dump-worker/src/types/index.ts
- workers/dump-worker/src/utils/* (validation logic)
- workers/dump-worker/src/routes/* (if mode is checked directly in the route)
- apps/dump-web/src/types/index.ts
- apps/dump-web/src/pages/CreatePage.tsx

## Suggested AI Model
Gemini 2.5 Pro

## Coding Prompt

Systematically remove all traces of the "reserved" clipboard mode from the codebase and documentation.
1. Update `DECISIONS.md` to remove the dedicated section for Reserved Codes, and update the Clipboard Modes table so it only has `public` and `protected`.
2. Update `API.md` to remove `reserved` from the valid `mode` types and any other endpoint notes.
3. In `workers/dump-worker`, remove `reserved` from `src/types/index.ts` (the `ClipboardMode` type).
4. Update `workers/dump-worker/src/utils/validate.ts` (and anywhere else) to ensure `"reserved"` is no longer considered a valid mode.
5. In `apps/dump-web`, remove `reserved` from `src/types/index.ts` (the `ClipboardMode` type).
6. In `apps/dump-web/src/pages/CreatePage.tsx`, remove the "Reserved" option from the `<select>` dropdown for the clipboard mode, and any specific logic checking for `mode === "reserved"`.

## AI Workflow
0. At any point if any ambiguity or doubt arises. *Stop Coding*. Ask questions, clarify, then proceed. DO NOT ASSUME.
1. Complete the task requirements systematically.
2. Run backend and frontend linters/typechecks (`npm run lint` or `npm run typecheck` if available).
3. Report the completion to the user and WAIT for their explicit approval.
4. Do NOT commit changes and do NOT update AGENTS.md "Completed Tasks" until the user approves.
5. Once approved, commit the changes.

## Commit Suggestion
refactor: remove reserved clipboard mode entirely
