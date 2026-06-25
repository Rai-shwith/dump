# AI_RULES.md

These are the non-negotiable rules for all AI coding agents working on this project.
Read this file completely before writing a single line of code.

---

## General Behavior

- Read GEMINI.md first on every task, without exception.
- Read the referenced files in GEMINI.md before starting work.
- Never modify files outside the "Files allowed to change" list in the task.
- Never add features not described in the current task.
- Never refactor code outside the current task scope.
- Never install packages not explicitly listed in the task.
- Ask for clarification before proceeding if the task is ambiguous.
- Write the simplest code that satisfies the task. No cleverness for its own sake.

---

## Code Style

- Use ES modules (import/export) everywhere.
- No TypeScript. Plain JavaScript only.
- No default exports in utility files. Use named exports.
- Use async/await. No raw promise chains.
- Keep functions small and single-purpose.
- No commented-out code in final output.
- No console.log left in production paths. Use it only inside explicitly debug-marked blocks.

---

## Worker Rules

- Every handler must return a Response object.
- Every response must go through the security headers middleware.
- Never read from KV more times than necessary in a single request.
- Always lowercase the clipboard code before any KV operation.
- Always check expiration before returning any clipboard data.
- Never reveal whether an expired clipboard previously existed. Always return 404.
- Never return passwordHash or ownerTokenHash in any API response.
- Never log passwords, tokens, or hashes anywhere.

---

## KV Rules

- Only two keys per clipboard: clip:<code>:meta and clip:<code>:content.
- Never create additional KV keys without a documented decision in DECISIONS.md.
- Always parse KV values with JSON.parse. Never assume raw string is safe to return.
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

## Frontend Rules

- Never store sensitive data beyond ownerTokens in localStorage.
- Owner tokens are stored as: localStorage.setItem("ownerTokens.<code>", token)
- Always convert expiration datetime to UTC before sending to the API.
- Always convert UTC expiration from API to local timezone before displaying.
- Never display passwordHash, ownerTokenHash, or any internal metadata to users.
- Always include noindex/nofollow meta tags on every page.

---

## Task Discipline

- Complete one task fully before moving to the next.
- After completing a task, update GEMINI.md as described at the end of the task file.
- Run the manual testing checklist before marking a task complete.
- Never skip the manual testing checklist.
- Make the suggested commit after each task.

---

## What AI Must Never Do

- Never add authentication or user accounts.
- Never add features outside V1 scope.
- Never modify docs/ files except GEMINI.md (and only as instructed per task).
- Never change the KV key structure without a new DECISIONS.md entry.
- Never expose internal errors or stack traces in API responses.
- Never add analytics, tracking, or logging beyond what tasks require.
- Never add a database. KV is the only storage in V1.