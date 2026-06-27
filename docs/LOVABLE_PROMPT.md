# LOVABLE_PROMPT.md

> This file is the complete specification for building the Dump frontend in Lovable.
> Read every section fully before writing any code. Do not skip sections.

---

## What is Dump?

A serverless, anonymous online clipboard service. Users create clipboards at custom
short URLs, share text between devices, and optionally protect them with passwords.
No accounts. No email. No tracking. The frontend is the only user-facing layer.

**Live domain:** dump.ashwithrai.me  
**Tech stack:** React + Vite + TypeScript (strict) + Tailwind CSS + Cloudflare Pages

---

## API Reference

The full API contract is in `docs/API.md` (attached). Below is a summary for quick
reference during implementation. Always refer to `API.md` for authoritative detail.

### Base URLs

```
Production:  https://dump.ashwithrai.me/api
Local dev:   http://localhost:8787/api
```

The base URL must be set in a single config file (see Configuration section).

### Key Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/clipboard | Create clipboard |
| GET | /api/clipboard/:code | Read clipboard |
| PUT | /api/clipboard/:code | Update clipboard |
| DELETE | /api/clipboard/:code | Delete clipboard |
| POST | /api/clipboard/:code/star | Star clipboard |
| DELETE | /api/clipboard/:code/star | Unstar clipboard |
| GET | /api/starred | Get global starred list (homepage) |

### Authentication Headers

```
X-Owner-Token: <raw token>          — owner bypass, always silent
X-Clipboard-Password: <raw pass>   — for password-protected clipboards
```

Owner tokens are stored in `localStorage` under key `ownerTokens.<code>`.
They must be sent silently on every request to `/:code`. The user never sees them.

### Locked Response

When a clipboard has `passwordMode: "view"` and no valid token/password is provided:
```json
{ "locked": true, "passwordMode": "view" }
```
The frontend must detect this and show the password gate card.

### Post-Creation Response (201)

```json
{
  "code": "string",
  "ownerToken": "string",
  "expiresAt": "ISO8601 UTC | null",
  "isOneTimeView": "boolean"
}
```

Store the `ownerToken` in `localStorage.setItem("ownerTokens.<code>", token)` immediately.

---

## Architecture Rules

### Folder Structure

```
src/
├── components/        # Presentational only. No API calls. No business logic.
├── pages/             # Route-level. Orchestrates hooks + components.
├── hooks/             # Custom React hooks. May use React hooks. No JSX.
├── services/          # API call logic. No React imports. Pure async functions.
├── utils/             # Pure functions. No side effects. (time, codegen, tokens)
├── types/             # All shared TypeScript interfaces/types. Single source.
├── constants/         # App-wide constants. Never inline magic values.
├── config/
│   └── app.config.ts  # Single file for ALL runtime configuration
└── styles/
    └── colors.ts      # Single file for ALL color tokens
```

### Layer Rules (non-negotiable)

- Components never call APIs — they receive props and emit events.
- Services never import React.
- Hooks may use React hooks but must not contain JSX.
- Pages are the only layer that composes hooks, services, and components.
- All configuration lives in `src/config/app.config.ts`.
- All color tokens live in `src/styles/colors.ts` and are imported into `tailwind.config.ts`.

### Size Limits

| Unit | Soft | Hard |
|------|------|------|
| File | 250 lines | 400 lines |
| Function | 40 lines | 60 lines |
| React component | 150 lines | 250 lines |
| Nesting depth | 3 levels | — |
| Function params | 5 | — |

### TypeScript Rules

- Strict mode enabled. No `any`. No `@ts-ignore` without explanation.
- All function parameters and return types explicitly typed.
- Use `unknown` and narrow, not `any`.

---

## Configuration File

Create `src/config/app.config.ts`:

```typescript
export const APP_CONFIG = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "https://dump.ashwithrai.me/api",
  themeStorageKey: "dump-theme",
  ownerTokenPrefix: "ownerTokens",
  bypassPasswordPrefix: "bypassPasswords",
  defaultTheme: "dark" as "dark" | "light",
  codeMinLength: 4,
  codeDefaultLength: 8,
  contentMaxBytes: 256 * 1024,
  starredMaxCount: 5,
  reservedKeywords: [
    "admin", "api", "raw", "json", "create", "edit",
    "delete", "settings", "help", "docs", "host"
  ],
} as const;
```

---

## Color Tokens File

Create `src/styles/colors.ts` and import into `tailwind.config.ts`:

```typescript
export const colors = {
  surface: {
    DEFAULT: "#18181b",   // zinc-900
    raised: "#27272a",    // zinc-800
    overlay: "#3f3f46",   // zinc-700
  },
  accent: {
    DEFAULT: "#22d3ee",   // cyan-400
    hover: "#06b6d4",     // cyan-500
    muted: "#164e63",     // cyan-900
  },
  text: {
    primary: "#fafafa",
    secondary: "#a1a1aa",
    muted: "#71717a",
  },
  success: "#4ade80",
  warning: "#fbbf24",
  danger: "#f87171",
  light: {
    surface: "#ffffff",
    raised: "#f4f4f5",
    overlay: "#e4e4e7",
    text: { primary: "#18181b", secondary: "#52525b" },
  },
} as const;
```

---

## ESLint Configuration

Use flat config (`eslint.config.js`). Required rules:

```js
rules: {
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/explicit-function-return-type": "warn",
  "max-lines": ["warn", { max: 250, skipBlankLines: true, skipComments: true }],
  "max-lines-per-function": ["warn", { max: 40, skipBlankLines: true, skipComments: true }],
  "max-depth": ["warn", 3],
  "max-params": ["warn", 5],
  "no-restricted-imports": ["error", {
    patterns: [
      { group: ["../pages/*"], message: "Components must not import pages." }
    ]
  }],
}
```

---

## Dependencies

Use these specific libraries. Do not build custom equivalents:

| Purpose | Library |
|---------|---------|
| Animations | `framer-motion` |
| Toast notifications | `sonner` |
| Icons | `lucide-react` |
| Date/time picker | `react-day-picker` or `@mantine/dates` |
| Styling | Tailwind CSS v3 |
| Fonts | Geist (`@fontsource/geist-sans`, `@fontsource/geist-mono`) |
| Routing | `react-router-dom` v6 |

---

## Fonts

```css
/* In index.css */
@import "@fontsource/geist-sans/400.css";
@import "@fontsource/geist-sans/500.css";
@import "@fontsource/geist-sans/600.css";
@import "@fontsource/geist-mono/400.css";

:root { font-family: "Geist Sans", system-ui, sans-serif; }
code, pre, .font-mono { font-family: "Geist Mono", monospace; }
```

---

## Theme System

- Default theme: **dark**.
- Toggle: sun/moon icon in top-right of navbar.
- Persisted in `localStorage` under key `dump-theme`.
- On mount: read from localStorage; default to `dark` if unset.
- Apply by toggling `class="dark"` on `<html>` (Tailwind `darkMode: "class"`).
- No flash of unstyled content — set theme before React renders.

```typescript
// utils/theme.ts
export function getInitialTheme(): "dark" | "light" {
  const stored = localStorage.getItem(APP_CONFIG.themeStorageKey);
  if (stored === "light" || stored === "dark") return stored;
  return APP_CONFIG.defaultTheme;
}

export function applyTheme(theme: "dark" | "light"): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem(APP_CONFIG.themeStorageKey, theme);
}
```

---

## Routing

```typescript
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/new" element={<Navigate to="/" replace />} />
  <Route path="/:code" element={<ViewPage />} />
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

---

## Pages

### HomePage (`/`)

Two vertically-stacked sections:
1. **Create section** (top) — clipboard creation form.
2. **Starred section** (bottom) — globally starred clipboards.

Mobile: full width, stacked. Desktop: centered (max-width 640px).

#### Create Form Fields

| Field | Notes |
|-------|-------|
| Code input | Pre-filled 8-char generated code (not placeholder). Font-mono. Refresh icon regenerates. Lowercase enforced. |
| Content textarea | Auto-resize. Min height 120px. |
| Mode selector | Segmented control: `Public` / `Protected`. |
| Password field | Visible when `protected`. Show/hide toggle. |
| Password mode selector | Visible when `protected`. `View password` / `Edit password`. |
| Bypass password checkbox | "Remember password on this device". Visible when `protected`. |
| Expiry selector | Styled dropdown (not native select). Options: `1 min`, `5 min`, `15 min`, `1 hour`, `1 day`, `1 week`, `1 month`, `1 year`, `Infinite` (public only), `One-Time View`, `Custom...`. Custom reveals inline datetime picker. |
| Submit button | "Create Clipboard" — spinner during submission. |

**Expiry logic:**
- `Infinite` only visible when `mode === "public"`.
- Switch from `public` → `protected` while `Infinite` selected: reset expiry to `1 day`.
- `One-Time View` shows inline note: _"This clipboard will be permanently deleted after the first view."_
- OTV selected → send `expiresAt: null`. Time-based → send `isOneTimeView: false`.

**Client-side code validation:**
- Length ≥ 4. Pattern `/^[a-z0-9\-_]+$/`. Not a reserved keyword.
- Show inline field error. Do not submit if invalid.

**Post-creation success state:**
- Form collapses with Framer Motion exit animation.
- Success card slides in via `AnimatePresence`.
- Card shows: ✅ "Clipboard created!", full URL (monospace, clickable), "Copy Link" button (sonner toast on click), "Create Another" link (resets to form).
- **Do NOT auto-navigate to `/:code`** (see DECISIONS.md D-020 — prevents burning OTV clipboards).

#### Starred Section

- Fetch `GET /api/starred` on mount.
- Horizontal scroll strip. Up to 5 cards.
- Each card: code (monospace, bold), content preview (first 80 chars + `…`), expiry badge.
- Click → navigate to `/:code`.
- Hover: `whileHover={{ y: -4, scale: 1.02 }}` lift animation.
- Loading: 3 skeleton pulse cards.
- Empty: _"No starred clipboards yet."_

---

### ViewPage (`/:code`)

#### On Mount

1. Read `ownerToken` from `localStorage.getItem("ownerTokens.<code>")`.
2. Read `bypassPassword` from `localStorage.getItem("bypassPasswords.<code>")`.
3. Send `GET /api/clipboard/:code` with `X-Owner-Token` and/or `X-Clipboard-Password` headers if available.
4. Handle responses:
   - **200 with content** → content view.
   - **200 with `locked: true`** → password gate card.
   - **404** → inline not-found state.
   - **403** → error on gate card.

#### Password Gate Card

- Centered card (vertically + horizontally).
- Contains: lock icon, label, password input, "Unlock" button.
- Wrong password → **shake animation** (`x` keyframes: `[0, -10, 10, -10, 10, 0]`).
- Unlock success → card fades+scales out, content view fades in.

#### Content View Layout

- **Metadata strip** (above content): mode badge, expiry badge, "🔑 You own this" chip (if owner token in localStorage).
- **Content area**: auto-height read-only text. Monospace font.
- **Action bar**:
  - Mobile: sticky bottom bar with icon buttons.
  - Desktop: inline button row below metadata strip.

#### Action Buttons

| Button | Visible When | Behavior |
|--------|-------------|---------|
| Copy | Always | Copies content. Toast: `"Copied!"` |
| Share | Always | Copies `{window.location.origin}/{code}`. Toast: `"Link copied!"` |
| Edit | Owner OR public mode | Opens inline edit panel |
| Delete | Owner OR public mode | Shows inline confirmation prompt. Toast + navigate `/`. |
| Star ★ | Public clipboards only. Not for OTV. | Filled if `isStarred`. Optimistic toggle. |

#### One-Time View Banner

After content loads for an OTV clipboard:
- Dismissible amber banner: _"⚠️ This clipboard has been permanently deleted. It no longer exists."_
- Hide Star and Edit buttons.

#### Owner Badge

If `localStorage.getItem("ownerTokens.<code>")` exists, show chip in metadata strip: `🔑 You own this`.

#### Inline Edit Panel

Slide-down Framer Motion animation below content area.

Fields:
- Content textarea.
- Expiry selector (same styled component as create form).
- Password field (if `protected` mode).
- Password mode selector (if `protected`).
- "Save Changes" button (spinner during save) + "Cancel" button.

API: `PUT /api/clipboard/:code`
- Send `X-Owner-Token` if available, else `X-Clipboard-Password`.
- Mutual exclusion: OTV → `expiresAt: null`. Time-based → `isOneTimeView: false`.

Toast: `"Changes saved!"` or error message.

#### Inline Delete Confirmation

Below action bar. No `window.confirm()`.
- "Are you sure? This cannot be undone."
- "Delete" (danger color) + "Cancel".
- On confirm: `DELETE /api/clipboard/:code`.
- Toast: `"Clipboard deleted."` → navigate to `/`.

---

### NotFoundPage (`*`)

Simple centered layout:
- `404` in large monospace.
- "This clipboard doesn't exist or has expired."
- "Go home" button.

---

## Navbar

Fixed top. Glassmorphism: `backdrop-blur`, semi-transparent background. Height 48px.

```
[ dump ]                    [ 🌙 / ☀️ ]
```

- Left: wordmark "dump" (monospace). Click → `/`.
- Right: theme toggle (moon = dark active, sun = light active). Icon swaps with `AnimatePresence` rotate.
- No other nav items.

---

## Toast Notifications (sonner)

`<Toaster />` in `App.tsx`. All toasts use `sonner`'s `toast()`.

| Event | Toast |
|-------|-------|
| Copy content | `toast.success("Copied!")` |
| Share URL | `toast.success("Link copied!")` |
| Edit saved | `toast.success("Changes saved!")` |
| Deleted | `toast.success("Clipboard deleted.")` |
| Owner bypass | `toast("Password bypassed — you're the owner.", { icon: "🔑" })` |
| Any API error | `toast.error(errorMessage)` |

---

## Animations (framer-motion)

| Element | Animation |
|---------|-----------|
| Create form → Success card | `AnimatePresence`. Exit: fade + slide up. Enter: `y: 20→0, opacity: 0→1`. |
| Starred cards | `whileHover={{ y: -4, scale: 1.02 }}` |
| Password gate | Entry: `scale: 0.95→1, opacity: 0→1`. Shake: `x` keyframes on wrong password. Exit: fade+scale out. |
| Inline edit panel | Layout animation, `height: 0→auto`. |
| Delete confirmation | `AnimatePresence` slide-down. |
| Page transitions | `AnimatePresence` on `<Routes>`. Each page: `initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}` `transition={{ duration: 0.15 }}`. |
| Theme toggle icon | `AnimatePresence` with rotate on swap. |
| Skeleton loaders | Tailwind `animate-pulse`. |

---

## Loading States

- Starred list → 3 skeleton placeholder cards.
- View page loading → skeleton content block (no spinner).
- Form submit → spinner inside "Create Clipboard" button.
- Edit save / delete → spinner inside action button.

---

## LocalStorage Keys

| Key | Value | Description |
|-----|-------|-------------|
| `dump-theme` | `"dark"` / `"light"` | Theme preference |
| `ownerTokens.<code>` | raw token | Owner token per clipboard |
| `bypassPasswords.<code>` | raw password | Saved bypass password (if checkbox ticked) |

---

## API Service Layer (`src/services/clipboardApi.ts`)

Typed async functions. No React imports.

```typescript
export async function createClipboard(payload: CreateClipboardPayload): Promise<CreateClipboardResponse>
export async function readClipboard(code: string, token?: string, password?: string): Promise<ClipboardData | LockedResponse>
export async function updateClipboard(code: string, payload: UpdateClipboardPayload, token?: string, password?: string): Promise<UpdateClipboardResponse>
export async function deleteClipboard(code: string, token?: string, password?: string): Promise<void>
export async function starClipboard(code: string): Promise<void>
export async function unstarClipboard(code: string): Promise<void>
export async function getStarred(): Promise<StarredClipboard[]>
```

All calls must:
1. Use `APP_CONFIG.apiBaseUrl`.
2. Include `Content-Type`, `X-Owner-Token`, `X-Clipboard-Password` headers as needed.
3. Throw descriptive errors from `{ "error": "..." }` response body on non-2xx.

---

## Types (`src/types/index.ts`)

```typescript
export type ClipboardMode = "public" | "protected";
export type PasswordMode = "view" | "edit" | null;
export type Theme = "dark" | "light";

export interface CreateClipboardPayload {
  code?: string;
  content: string;
  mode: ClipboardMode;
  passwordMode: PasswordMode;
  password: string | null;
  expiresAt: string | null;
  isOneTimeView: boolean;
}

export interface CreateClipboardResponse {
  code: string;
  ownerToken: string;
  expiresAt: string | null;
  isOneTimeView: boolean;
}

export interface ClipboardData {
  code: string;
  content: string;
  mode: ClipboardMode;
  passwordMode: PasswordMode;
  expiresAt: string | null;
  isOneTimeView: boolean;
  isStarred: boolean;
  createdAt: string;
}

export interface LockedResponse {
  locked: true;
  passwordMode: "view";
}

export interface StarredClipboard {
  code: string;
  createdAt: string;
  expiresAt: string | null;
  isOneTimeView: boolean;
}

export interface UpdateClipboardPayload {
  content?: string | null;
  expiresAt?: string | null;
  isOneTimeView?: boolean | null;
  password?: string | null;
  passwordMode?: PasswordMode;
}
```

---

## Utilities (`src/utils/`)

```typescript
// codegen.ts
export function generateCode(length?: number): string
// Returns random a-z, 0-9 string

// time.ts
export function toUTC(localDatetime: string): string
export function formatExpiry(expiresAt: string | null, isOneTimeView: boolean): string
// Returns: "Expires in 2h", "Permanent", "One-time view"

// tokens.ts
export function getOwnerToken(code: string): string | null
export function saveOwnerToken(code: string, token: string): void
export function getBypassPassword(code: string): string | null
export function saveBypassPassword(code: string, password: string): void

// validate.ts
export function validateCode(code: string): string | null
// Returns error message or null if valid

// theme.ts
export function getInitialTheme(): "dark" | "light"
export function applyTheme(theme: "dark" | "light"): void
```

---

## SEO

Every page includes in `<head>`:
```html
<meta name="robots" content="noindex,nofollow" />
```

`public/robots.txt`:
```
User-agent: *
Disallow: /
```

---

## Mobile-First Layout Notes

- Base: 375px width.
- Desktop breakpoint: `md` (768px).
- Create form: full-width mobile, max-width 640px centered desktop.
- Starred: horizontal scroll on all viewports.
- View page action buttons: fixed sticky bottom bar mobile, inline row desktop.
- Navbar: 48px fixed top.

---

## Summary Checklist

- [ ] `src/config/app.config.ts` — single config file
- [ ] `src/styles/colors.ts` — single color token file, imported into Tailwind config
- [ ] ESLint flat config with all rules from this doc
- [ ] Geist Sans + Geist Mono fonts via `@fontsource`
- [ ] Dark default theme, `class` strategy, localStorage `dump-theme`
- [ ] Theme toggle: moon/sun in navbar top-right, icon animated with `AnimatePresence`
- [ ] `framer-motion` for all animations
- [ ] `sonner` for all toasts
- [ ] `lucide-react` for all icons
- [ ] `/new` redirects to `/`
- [ ] Homepage: create form (top) + starred strip (bottom)
- [ ] Code input: pre-filled generated code, refresh icon
- [ ] Expiry: styled dropdown, `Infinite` public-only, OTV warning note
- [ ] Post-creation: success card replaces form, never auto-navigates
- [ ] View page: silently sends owner token from localStorage on every request
- [ ] Password gate card: centered, shake on wrong password, transitions to content
- [ ] OTV: dismissible amber banner, no Star/Edit
- [ ] Owner badge chip: `🔑 You own this`
- [ ] Inline edit panel: content + expiry + password
- [ ] Inline delete confirmation (no `window.confirm`)
- [ ] Star toggle: optimistic update, public mode only
- [ ] Skeleton loaders for all data-fetch states
- [ ] Spinner only for form submit / action buttons
- [ ] 404 page: centered, "Go home" button
- [ ] `noindex,nofollow` on every page
- [ ] `robots.txt` disabling all crawlers
- [ ] Strict module layers: components/ pages/ hooks/ services/ utils/ types/ constants/
- [ ] No component > 250 lines. No file > 400 lines.
