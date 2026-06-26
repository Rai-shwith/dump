# AI_RULES.md

These are the non-negotiable rules for all AI coding agents working on this project.
Read this file completely before writing a single line of code.

---

## General Behavior

- Read AGENTS.md first on every task, without exception.
- Read the referenced files in AGENTS.md before starting work.
- Never modify files outside the "Files allowed to change" list in the task.
- Never add features not described in the current task.
- Never refactor code outside the current task scope.
- Never install packages not explicitly listed in the task.
- Ask for clarification before proceeding if the task is ambiguous.
- Write the simplest code that satisfies the task. No cleverness for its own sake.
- Never manually add packages to dependencies or devDependencies in package.json.
- Always initialize packages using `npm init`.
- Always install packages using `npm install` or `npm install -D`.
- Never manually specify dependency versions.
- Let npm update package.json and package-lock.json automatically.
- It is acceptable to modify package.json metadata fields (name, private, type, scripts, description, engines).
- package-lock.json is the source of truth for dependency versions.
- Prefer installing dependencies incrementally as features are implemented.
- If there is 'Manual Testing Instructions' are provided then create a appropriate .sh file under TESTS/ Folder and run it to verify the implementation. 

---

## Language

- All source files are TypeScript. No plain .js files in any src/ directory.
- Frontend files: .ts for pure logic, .tsx for React components.
- Worker files: .ts throughout.
- Strict mode is enabled in all tsconfig.json files. Never disable strict.
- Never use `any` as a type. Use `unknown` and narrow, or define a proper type.
- Never use type assertions (`as SomeType`) unless absolutely necessary and commented.
- All function parameters and return types must be explicitly typed.
- Shared types live in src/types/index.ts in each package. Import from there.
- Constants and magic values live in src/constants/index.ts. Never inline them.

---

## Code Size Limits

These limits exist to keep AI-generated code auditable and testable.

| Unit | Soft Limit | Hard Limit |
|------|-----------|------------|
| File | 250 lines | 400 lines |
| Function | 40 lines | 60 lines |
| React component | 150 lines | 250 lines |
| Nesting depth | 3 levels | — |
| Function parameters | 5 | — |

- When a file approaches the soft limit, split it before adding more code.
- When modifying a file already near the hard limit, refactor first, then add.
- Never append to a file that exceeds the hard limit. Split it first.
- Prefer creating new files over growing existing ones.
- If a function is approaching 60 lines, extract helpers into the same file or a util file.

---

## Code Style

- Use ES modules (import/export) everywhere.
- No default exports in utility, service, or type files. Use named exports.
- Default exports are acceptable for React page components (React Router convention).
- Use async/await. No raw promise chains.
- Keep functions small and single-purpose.
- Maximum nesting depth: 3 levels. Flatten with early returns.
- Maximum function parameters: 5. Use an options object if more are needed.
- No commented-out code in final output.
- No console.log in production paths. Use it only inside explicitly debug-marked blocks.
- Avoid circular imports. If A imports B and B imports A, restructure.
- Prefer using existing libraries over custom implementations when the library is lightweight and well-maintained.
- Avoid writing utility code that already exists in a standard library or established package.
---

## Architecture Rules — Worker

- Route handlers in routes/ must be thin. Extract logic to services/.
- Services in services/ contain business logic and call utils/.
- Utils in utils/ are pure functions. No business logic. No side effects beyond what the function name implies.
- Types are defined in src/types/index.ts and imported where needed.
- Constants are defined in src/constants/index.ts. Never hardcode magic values inline.
- Every handler must return a Hono Response (c.json() or c.text()).
- Every response must go through the security middleware.
- Never read from KV more times than necessary in a single request.
- Always lowercase the clipboard code before any KV operation.
- Always check expiration before returning any clipboard data.
- Never reveal whether an expired clipboard previously existed. Always return 404.
- Never return passwordHash or ownerTokenHash in any API response.
- Never log passwords, tokens, or hashes anywhere.
- Use Hono for routing and middleware. Do not implement manual request routing unless explicitly required.
- Route definitions live in routes/ and should remain thin.
- Prefer extracting business logic into services/ instead of handlers/routes.
---

## Architecture Rules — Frontend

- Components in components/ are presentational. They receive props and render UI.
- Business logic lives in hooks/ and services/.
- Services in services/ must not import React.
- Hooks in hooks/ may use React hooks but must not contain JSX.
- Components must not import pages/.
- Pages orchestrate hooks, services, and components. They are the only layer allowed to do so.
- Shared types live in src/types/. Import from there, do not redefine locally.
- Constants live in src/constants/. Do not inline magic values in components.
- Never store sensitive data beyond ownerTokens in localStorage.
- Owner tokens are stored as: localStorage.setItem("ownerTokens.<code>", token)
- Always convert expiration datetime to UTC before sending to the API.
- Always convert UTC expiration from API to local timezone before displaying.
- Never display passwordHash, ownerTokenHash, or any internal metadata to users.
- Always include noindex/nofollow meta tags on every page.

---

## KV Rules

- Only two keys per clipboard: clip:<code>:meta and clip:<code>:content.
- Never create additional KV keys without a documented decision in DECISIONS.md.
- Always parse KV values with JSON.parse. Never assume raw string is safe to return directly.
- When deleting a clipboard, always delete both meta and content keys.
- When deleting a clipboard, always check and update app:starred.

---

## Security Rules

- Never return raw passwords, tokens, or hashes in responses.
- Always hash passwords as SHA-256(password + pepper) using SubtleCrypto.
- Always hash owner tokens as SHA-256(token) before storing in KV.
- Pepper is always read from env.PASSWORD_PEPPER. Never hardcode it.
- Never trust client-provided timestamps without validation.
- Always validate clipboard codes against the allowed character set and reserved keywords.
- Reject any code shorter than 4 characters.

---

## Package Management

- Every package (apps/dump-web, workers/dump-worker, future packages/) owns its own package.json.
- Do not create a root package.json unless explicitly requested.
- Do not add workspace tooling unless explicitly requested.
- Dependencies must be installed from inside the package directory they belong to.

---

## Task Discipline

- Complete one task fully before moving to the next.
- After completing a task, update AGENTS.md as described at the end of the task file.
- Run the manual testing checklist before marking a task complete.
- Never skip the manual testing checklist.
- Always run `npm run lint` in the relevant package directory (e.g., `workers/dump-worker`) after making code changes.
- If the linter reports errors for code size or nesting limits (`max-lines`, `max-lines-per-function`, `max-depth`, `max-params`), you MUST restructure your code to fix them before completing the task.
- Make the suggested commit after each task.

---

## What AI Must Never Do

- Never add authentication or user accounts.
- Never add features outside V1 scope.
- Never modify docs/ files except AGENTS.md (and only as instructed per task).
- Never change the KV key structure without a new DECISIONS.md entry.
- Never expose internal errors or stack traces in API responses.
- Never add analytics, tracking, or logging beyond what tasks require.
- Never add a database. KV is the only storage in V1.
- Never use `any` as a TypeScript type.
- Never disable TypeScript strict mode or add @ts-ignore without an explanation comment.
- Never use workarounds like eslint-disable or eslint-disable-next-line to avoid fixing ESLint errors. You MUST refactor the code to properly resolve the issues.
- Never create a file that exceeds 400 lines. Split it first.
- Never append code to a file already over the hard limit without refactoring first.
- Never manually edit dependency versions inside package.json.
- Never pre-install large dependency sets "just in case".
- Never add a package unless it is required by the current task.
- Never introduce a monorepo workspace setup unless explicitly requested.
