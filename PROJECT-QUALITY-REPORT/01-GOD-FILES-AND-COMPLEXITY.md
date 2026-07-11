# God Files and Complexity Analysis

This report highlights monolithic files, overly complex functions, and architectural hotspots that require decomposition.

## 1. `apps/dump-web/src/components/ui/sidebar.tsx` (744 lines)
**Classification: UI Monolith / God File**

* **The Problem**: This file contains the `SidebarProvider`, context definitions, custom hooks (`useSidebar`), and over a dozen sub-components (`Sidebar`, `SidebarHeader`, `SidebarMenu`, `SidebarMenuItem`, etc.). It drastically exceeds the hard limit of 400 lines specified in the project's rules.
* **Complexity Drivers**: Grouping context state management, responsive logic (mobile vs. desktop sheets), and extensive class variance authority (cva) definitions into a single file makes it difficult to navigate and maintain.
* **Recommendation**: Break this file apart. 
  - Move context and hooks to `apps/dump-web/src/hooks/useSidebar.ts`.
  - Split sub-components into their own files within a `apps/dump-web/src/components/ui/sidebar/` directory.

## 2. `workers/dump-worker/src/handlers/clipboard.ts` (403 lines)
**Classification: Logic-Heavy Handler (Layer Violation)**

* **The Problem**: Just over the 400-line hard limit, this file is the central hub for the backend. It violates the core architectural rule: *"Route handlers are thin. Logic goes in services/."*
* **Complexity Drivers**:
  - Contains inline validation functions (`validateCreateContentAndCode`, `validateCreateModeAndExpiration`, `validateUpdateFields`).
  - Manages password and token hashing directly alongside request handling.
  - Mixes KV operations (`getMeta`, `setContent`) with HTTP response formatting.
  - Deep nesting in functions like `handleCreate` and `handleUpdate` due to conditional authorization and validation checks.
* **Recommendation**: 
  - Move validation functions to `workers/dump-worker/src/utils/validate.ts` or a dedicated validation service.
  - Create a `ClipboardService` in `workers/dump-worker/src/services/` to handle the orchestration of KV operations, hashing, and authorization.
  - The handler should only parse the request, call the service, and return the formatted HTTP response.

## 3. `apps/dump-web/src/components/CreateForm.tsx` (300 lines)
**Classification: Fat Component**

* **The Problem**: Exceeds the 250-line hard limit for React components. It mixes UI rendering with complex form state, business logic (expiry parsing), and API side-effects.
* **Complexity Drivers**:
  - Manages 10+ distinct state variables (`code`, `content`, `mode`, `password`, `expiry`, etc.).
  - The `submit` function is massive, handling form validation, blob size calculation, timezone conversions (`toUTC`, `presetToISO`), API calls, local storage updates, and global star updates.
* **Recommendation**: 
  - Extract the state and submission logic into a custom hook (e.g., `useCreateForm.ts`).
  - The component should solely be responsible for rendering inputs and passing values to the hook.

## 4. `apps/dump-web/src/components/ContentView.tsx` (254 lines)
**Classification: Fat Component**

* **The Problem**: Just over the 250-line hard limit. Similar to `CreateForm`, it handles too much orchestration.
* **Complexity Drivers**:
  - Interacts directly with local storage utilities (`getOwnerToken`, `getBypassPassword`).
  - Contains multiple async action handlers (`doDelete`, `toggleStar`, `copy`, `share`).
  - Manages complex conditional rendering based on ownership, mode, and one-time view status.
* **Recommendation**:
  - Extract the action handlers and authorization state derived from local storage into a custom hook (e.g., `useClipboardActions.ts`).
