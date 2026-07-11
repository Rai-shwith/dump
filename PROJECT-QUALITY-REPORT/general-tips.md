# General Refactoring Tips & Migration Strategy

Based on the audit of the `dump` codebase, here is an actionable, step-by-step refactoring roadmap tailored to this specific React/Vite/Worker stack.

## 1. Backend: The Thin Handler Refactor

**Goal**: Adhere to the "Route handlers are thin" rule and reduce the size of `clipboard.ts`.

**Step-by-Step Execution**:
1. **Create a Service**: Create `workers/dump-worker/src/services/ClipboardService.ts`.
2. **Extract Logic**: Move the core orchestration from `handlers/clipboard.ts` into the new service. 
   - Create methods like `createClipboard(payload: CreatePayload, env: Env)`, `getClipboard(code: string, env: Env, authInfo: AuthContext)`.
3. **Move Validation**: Extract the inline `validateCreate...` functions in the handler to `workers/dump-worker/src/utils/validation/clipboardValidation.ts`.
4. **Refactor Handler**: Update `handlers/clipboard.ts` to solely parse the `Request`, call the appropriate `ClipboardService` method, and format the output into a standard Hono `Response`.

## 2. Frontend: The Hook Extraction Pattern

**Goal**: Adhere to the "Components are presentational" rule and reduce component size (< 150 lines).

**Step-by-Step Execution for `CreateForm.tsx`**:
1. **Create Hook**: Create `apps/dump-web/src/hooks/useCreateClipboard.ts`.
2. **Migrate State**: Move all `useState` calls (code, content, mode, etc.) into this hook.
3. **Migrate Logic**: Move the `submit`, `regenCode`, and `handleCodeChange` functions into the hook.
4. **Return Interface**: Have the hook return the state variables and the functions needed by the UI: `return { formState, formActions, isSubmitting, errors }`.
5. **Update UI**: Refactor `CreateForm.tsx` to consume this hook. The component should now only contain JSX and be well under the 150-line soft limit.

## 3. Dealing with the UI Monolith (`sidebar.tsx`)

**Goal**: Bring the file under the 400-line hard limit.

**Step-by-Step Execution**:
1. **Create Directory**: `apps/dump-web/src/components/ui/sidebar/`.
2. **Extract Context**: Move `SidebarContext`, `useSidebar`, and `SidebarProvider` to `sidebar/SidebarProvider.tsx`.
3. **Extract Core**: Move the main `Sidebar` component to `sidebar/SidebarCore.tsx`.
4. **Extract Parts**: Break the rest into logical files: `SidebarMenu.tsx` (containing Menu, MenuItem, MenuButton), `SidebarTrigger.tsx`, etc.
5. **Re-export**: Create `apps/dump-web/src/components/ui/sidebar/index.ts` to export all these components so existing imports in the app don't break.

## 4. Addressing Local Storage "Utils"

**Goal**: Differentiate pure functions from side-effects.

**Step-by-Step Execution**:
1. `utils/tokens.ts` (frontend) interacts with `localStorage`. This is technically a side-effect, not a pure utility.
2. Consider renaming this to `services/storageService.ts` or `services/authStorage.ts` to better reflect its nature, leaving the `utils/` folder strictly for pure, deterministic functions (like time formatting and math).

## Final Note
Do not attempt all these refactors in a single PR. Prioritize the Backend layer violation (the Worker handler) first, as it poses the highest risk to data integrity and future feature development. Then, tackle the Frontend hook extractions.
