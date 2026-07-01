# TASK-022 — Frontend Docs Section

## Objective
Create a beautiful, simple, and layman-friendly documentation section in the frontend that integrates seamlessly with the existing application design.

## Scope
- **Navbar Update (`Navbar.tsx`)**:
  - Add a `/docs` text link (styled as a button with a subtle texture or outline) next to the theme toggle.
  - Add a GitHub icon link pointing to `https://github.com/Rai-shwith/dump` (opening in a new tab) next to the docs button.
- **Routing (`App.tsx`)**:
  - Add a `/docs` route pointing to a new `DocsPage.tsx` page.
- **Docs Page (`DocsPage.tsx`)**:
  - Create a clean page layout matching the existing max width and spacing of the homepage.
  - **Header**: Minimalist title ("docs") with description.
  - **Core Features Grid**: A grid of cards explaining the three main pillars:
    - **Quick Share ⚡**: Paste text and share via custom/random code.
    - **Security Options 🔒**: Public vs Protected mode (lock view or edit).
    - **Self-Destruct (One-Time View) 💣**: Deletes after first read.
  - **FAQ Section**: Implement a series of layman questions using the pre-installed Radix UI `Accordion` component:
    - Why is there no sign-up or email?
    - How does "Bypass password for me" work?
    - Can I recover a deleted clipboard or lost password?
    - How long do clipboards last?
  - **CLI / Developer Section**: A small, clean section/card detailing programmatic access via the `/raw` endpoint using `curl` and custom headers.

## Prerequisites
- TASK-020, TASK-021 completed.

## Architectural Decisions
- See D-011 (Reserved Keywords), D-012 (Raw Endpoint), D-019 (Password Bypass) in `DECISIONS.md`.

## Notes
- Ensure complete light/dark mode styling consistency via CSS variables (`--border-color`, `--surface-raised`, etc.).
- Ensure responsiveness (3-column grid collapses to a single column on small screens).
