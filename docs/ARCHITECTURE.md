# ARCHITECTURE.md

This file describes the system architecture of the Dump project.
AI agents must read this file to understand how the system is structured before making changes.

---

## Overview

Dump is a serverless online clipboard service.
It consists of a React frontend deployed on Cloudflare Pages and a Cloudflare Worker API backed by Cloudflare KV storage.

---

## Repository Structure

```
dump/
├── apps/
│   └── dump-web/          # React + Vite + TypeScript frontend
├── workers/
│   └── dump-worker/       # Cloudflare Worker + Hono API (TypeScript)
├── docs/
│   ├── ARCHITECTURE.md    # This file
│   ├── API.md             # API contract
│   ├── DECISIONS.md       # All finalized decisions
│   ├── AGENTS.md          # AI agent context file
│   ├── AI_RULES.md        # Rules for AI coding agents
│   └── tasks/             # Incremental task files
└── README.md
```

Future additions slot in without restructuring:
```
apps/
  dump-web/
  host-web/
workers/
  dump-worker/
  host-worker/
packages/
  shared/     (if shared types emerge — not in V1)
```

---

## Frontend — apps/dump-web

**Tech:** React, Vite, TypeScript (strict)
**Deployment:** Cloudflare Pages
**Domain:** dump.ashwithrai.me

### Responsibilities
- Render clipboard create, read, edit, delete flows
- Display homepage with globally starred clipboards
- Generate suggested clipboard codes (8 random chars)
- Store owner tokens (and optional bypass passwords) in localStorage
- Convert expiration datetime to UTC before sending to API
- Convert UTC expiration from API back to user local timezone for display
- Enforce noindex/nofollow meta tags on all pages
- Serve robots.txt disallowing all crawlers

### Structure
```
apps/dump-web/
├── public/
│   └── robots.txt
├── src/
│   ├── assets/
│   ├── components/       # Presentational UI components (no business logic)
│   ├── pages/            # Route-level page components
│   ├── hooks/            # Custom React hooks (data fetching, state logic)
│   ├── services/         # API calls and business logic (no React imports)
│   ├── utils/            # Pure utility functions (time, codegen, tokens)
│   ├── types/            # Shared TypeScript types and interfaces
│   ├── constants/        # App-wide constants (reserved keywords, limits)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### Architecture Constraints
- Components must not contain API call logic — use hooks and services
- Services must not import React
- Components must not import pages
- Business logic lives in services/ and hooks/
- Shared types live in types/
- Constants and config live in constants/

---

## Worker — workers/dump-worker

**Tech:** Cloudflare Workers, Hono, TypeScript (strict)
**Deployment:** Cloudflare Workers
**Base URL:** dump.ashwithrai.me/api

### Responsibilities
- Handle all clipboard CRUD operations
- Enforce clipboard code validation and reserved keyword blocking
- Hash passwords using SHA-256 + pepper
- Generate and hash owner tokens using crypto.randomUUID() + SHA-256
- Enforce expiration on every read
- Handle one-time view deletion after content is returned
- Manage global starred list in KV
- Apply security headers to every response
- Serve CORS headers for frontend origin

### Structure
```
workers/dump-worker/
├── src/
│   ├── routes/
│   │   ├── clipboard.ts      # Hono route handlers for clipboard CRUD
│   │   └── starred.ts        # Hono route handlers for starred endpoints
│   ├── services/
│   │   ├── clipboardService.ts   # Clipboard business logic
│   │   └── starredService.ts     # Starring business logic
│   ├── utils/
│   │   ├── hash.ts           # SHA-256 hashing
│   │   ├── validate.ts       # Code validation, reserved keywords
│   │   ├── kv.ts             # KV read/write helpers
│   │   └── expiry.ts         # Expiration calculation and checks
│   ├── middleware/
│   │   └── security.ts       # CORS + security headers middleware
│   ├── types/
│   │   └── index.ts          # Shared TypeScript types (ClipboardMeta, Env, etc.)
│   ├── constants/
│   │   └── index.ts          # Reserved keywords, limits, allowed origins
│   └── index.ts              # Hono app entry point
├── wrangler.toml
├── tsconfig.json
└── package.json
```

### Architecture Constraints
- Route handlers in routes/ are thin — extract logic to services/
- Services contain business logic and call utils/
- Utils are pure functions with no business logic
- Types are defined in types/index.ts and imported where needed
- Constants are defined in constants/index.ts — never inline magic values

---

## Storage — Cloudflare KV

### Per-clipboard keys

| Key | Value | Description |
|-----|-------|-------------|
| clip:<code>:meta | JSON | Clipboard metadata |
| clip:<code>:content | String | Raw clipboard text |

### Metadata schema

```typescript
interface ClipboardMeta {
  code: string;
  mode: "public" | "reserved" | "protected";
  passwordHash: string | null;
  passwordMode: "view" | "edit" | null;
  ownerTokenHash: string;
  createdAt: string;   // ISO8601 UTC
  expiresAt: string | null;  // ISO8601 UTC
  isOneTimeView: boolean;
  isStarred: boolean;
}
```

### Global keys

| Key | Value | Description |
|-----|-------|-------------|
| app:starred | JSON array of codes | Up to 5 most recently starred clipboard codes |

---

## Request Flow

### Create Clipboard

```
Client → POST /api/clipboard
       → Hono router → clipboard route handler
       → clipboardService.createClipboard()
       → validate code, check reserved keywords
       → check code availability in KV
       → hash password (if provided)
       → generate owner token, hash it
       → write clip:<code>:meta and clip:<code>:content to KV
       → return { code, ownerToken, expiresAt }
       → Client stores ownerToken in localStorage
```

### Read Clipboard

```
Client → GET /api/clipboard/:code
       → Hono router → clipboard route handler
       → clipboardService.readClipboard()
       → read clip:<code>:meta
       → check expiration → 404 if expired
       → check password mode
         → if view password required and no valid token → return { locked: true }
         → if owner token provided → bypass password
       → read clip:<code>:content
       → return content
       → If isOneTimeView → delete both KV keys, remove from app:starred
```

### Update Clipboard

```
Client → PUT /api/clipboard/:code
       → clipboardService.updateClipboard()
       → read meta → check expiration
       → verify owner token or edit password
       → update meta and/or content in KV
       → return { success: true }
```

### Delete Clipboard

```
Client → DELETE /api/clipboard/:code
       → clipboardService.deleteClipboard()
       → read meta → verify auth
       → delete clip:<code>:meta and clip:<code>:content
       → remove code from app:starred if present
       → return { success: true }
```

### Star Clipboard

```
Client → POST /api/clipboard/:code/star
       → starredService.starClipboard()
       → verify clipboard is public mode
       → read app:starred
       → prepend code, enforce max 5, update displaced clipboard's isStarred
       → update app:starred and meta.isStarred
       → return { success: true }
```

### Unstar Clipboard

```
Client → DELETE /api/clipboard/:code/star
       → starredService.unstarClipboard()
       → verify clipboard is public mode
       → remove code from app:starred
       → set meta.isStarred = false
       → return { success: true }
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| PASSWORD_PEPPER | Secret string appended to passwords before SHA-256 hashing |

Stored as a Cloudflare Worker secret (not in wrangler.toml).
Typed via the Env interface in src/types/index.ts.

---

## Deployment

### Frontend
- Deployed via Cloudflare Pages
- Connected to GitHub repo, auto-deploys on push to main
- Build command: `npm run build`
- Output directory: `dist`

### Worker
- Deployed via Wrangler CLI
- `cd workers/dump-worker && npx wrangler deploy`
- KV namespace bound in wrangler.toml

---

## CORS Policy

Worker allows requests from:
- https://dump.ashwithrai.me (production)
- http://localhost:5173 (local development)

All other origins are rejected.
Allowed origins defined in constants/index.ts.

---

## Future: host.ashwithrai.me

When the host service is added:
- apps/host-web → new Vite + TypeScript app
- workers/host-worker → new Hono Worker with R2 storage
- No changes required to dump-web or dump-worker
- A packages/shared directory may be introduced for shared types if overlap is significant
