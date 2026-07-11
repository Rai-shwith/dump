# Coupling and Dependencies Analysis

This report analyzes how different modules and layers interact within the codebase, identifying tight coupling and architectural boundary violations.

## 1. Backend Layer Violations (Worker)

The `dump-worker` architecture defines a clear separation of concerns:
`Routes -> Handlers -> Services -> Utils/KV`.

However, the current implementation shows tight coupling between the Handlers and the Utils/KV layer, bypassing the Services layer entirely.

* **Coupling Point**: `workers/dump-worker/src/handlers/clipboard.ts` imports directly from `../utils/kv`, `../utils/validate`, `../utils/hash`, and `../utils/expiry`.
* **Issue**: The handler is orchestrating business logic (e.g., checking if a code exists, hashing tokens, saving to KV, returning specific HTTP status codes based on validation). This makes the business logic tightly coupled to the HTTP request/response cycle, making it impossible to reuse this logic outside of an HTTP context (e.g., in a background cron job or internal worker binding) or to unit test the business logic independently of the Hono framework.
* **Resolution**: Introduce an abstraction layer (Service). The handler should pass DTOs (Data Transfer Objects) to a `ClipboardService`, which executes the business logic and returns a result object.

## 2. Frontend Component & Logic Entanglement

The React frontend explicitly states in its rules: *"Components are presentational. Hooks and services hold logic."*

* **Coupling Point**: `apps/dump-web/src/components/CreateForm.tsx` and `ContentView.tsx` import directly from `../services/clipboardApi` and `../utils/tokens`.
* **Issue**: The UI components are tightly coupled to the implementation details of data fetching and local storage management. If the API signature changes or if the storage mechanism swaps from `localStorage` to IndexedDB, the UI components must be heavily modified.
* **Resolution**: The `pages/` layer or dedicated `hooks/` should import the services and utilities. The `components/` should accept data and callbacks as props. 
  - Example: `ContentView` should receive `onDelete`, `onToggleStar`, and `canEdit` as props, rather than computing them internally via `getOwnerToken()`.

## 3. Dependency Graph Insights (Graphify Analysis)

A BFS dependency traversal using Graphify mapping `handlers/clipboard.ts` reveals a highly centralized, star-shaped dependency graph where the handler acts as an orchestration bottleneck:

* **High Coupling (Outbound)**: `clipboard.ts` acts as a God node in the backend, importing heavily from `utils/kv.ts` (e.g., `getMeta`, `setMeta`, `deleteClipboard`, `setContent`, `getContent`), `utils/expiry.ts`, `utils/validate.ts`, and `utils/hash.ts`.
* **Missing Middle Layer**: The traversal confirms a missing service layer. The route handlers are directly calling lower-level utility and KV primitives rather than delegating to domain-specific services.
* **Positive aspect**: There are no obvious circular dependencies (e.g., components importing pages, or services importing components), which adheres well to the AI_RULES.md.
* **Positive aspect**: Types are well-centralized in `src/types/`, preventing cross-module type pollution.
* **Improvement Area**: The `utils` folders in both backend and frontend are becoming catch-alls. For example, `frontend/src/utils/tokens.ts` handles local storage logic, which acts more like a side-effecting service than a pure utility. Pure utilities (like `time.ts`) and side-effecting utilities should be separated.
