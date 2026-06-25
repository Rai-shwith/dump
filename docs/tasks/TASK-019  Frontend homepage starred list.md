# TASK-019 — Frontend Homepage Starred List

## Objective
Build the homepage showing the global starred clipboard list.

## Scope
- HomePage.jsx fetches and displays starred clipboards
- Link to create new clipboard
- Links to each starred clipboard

## Prerequisites
- TASK-015 through TASK-018 completed

## Files Allowed to Change
- apps/dump-web/src/pages/HomePage.jsx

## Files That Must Not Be Changed
- All other files
- docs/ (except GEMINI.md at the end)

## Suggested AI Model
Gemini 2.5 Flash

## Coding Prompt

Build HomePage.jsx for the Dump frontend.
Read docs/API.md (GET /api/starred) before writing code.
Use plain HTML elements. No UI library. No styling required.

On mount:
1. Call GET /api/starred
2. Display list of starred clipboards

For each starred clipboard show:
- Clickable link to /:code
- code
- expiresAt formatted with formatLocalTime (or "Never" if null)
- isOneTimeView badge if true

Also show:
- "Create new clipboard" link to /new
- "No starred clipboards yet" if list is empty
- Loading state while fetching
- Error state if fetch fails

## Manual Testing Instructions

Test 1 — Homepage with no starred clipboards:
  → "No starred clipboards yet" shown

Test 2 — Homepage with starred clipboards:
  Star some public clipboards
  → they appear on homepage with correct info

Test 3 — Click starred clipboard link:
  → navigate to view page

Test 4 — Create link:
  → navigate to /new

## Expected Behavior
Starred clipboards displayed correctly.
Links work.
Empty and error states handled.

## Commit Suggestion
feat(frontend): implement homepage with starred clipboard list

## How to Update GEMINI.md After Completion
In the Current Project State section:
- Move TASK-019 from Not Started to Completed Tasks
- Add summary: "Homepage implemented with global starred clipboard list"
  Update In Progress to: None
  Update Not Started to: None
  Add a final note: "V1 functional implementation complete. Ready for Lovable UI polish phase."
```

---

That's all 19 task files plus all 5 doc files. Everything is ready.

**Quick summary of what you now have:**

- `DECISIONS.md` — 15 finalized decisions, source of truth for all agents
- `ARCHITECTURE.md` — full system structure and request flows
- `API.md` — complete API contract with all endpoints, headers, errors
- `AI_RULES.md` — non-negotiable rules for every agent
- `GEMINI.md` — agent context file, updated after each task
- `TASK-001` to `TASK-014` — backend tasks in dependency order
- `TASK-015` to `TASK-019` — frontend tasks after backend is stable

Start Gemini on TASK-001 and work sequentially. Each task is independently testable before moving to the next.