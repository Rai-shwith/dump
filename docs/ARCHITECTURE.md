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
│   └── dump-web/          # React + Vite frontend
├── workers/
│   └── dump-worker/       # Cloudflare Worker API
├── docs/
│   ├── ARCHITECTURE.md    # This file
│   ├── API.md             # API contract
│   ├── DECISIONS.md       # All finalized decisions
│   ├── GEMINI.md          # AI agent context file
│   ├── AI_RULES.md        # Rules for AI coding agents
│   └── tasks/             # Incremental task files
└── README.md
```

---

## Frontend — apps/dump-web

**Tech:** React, Vite
**Deployment:** Cloudflare Pages
**Domain:** dump.ashwithrai.me

### Responsibilities
- Render clipboard create, read, edit, delete flows
- Display homepage with globally starred clipboards
- Generate suggested clipboard codes (8 random chars)
- Store owner tokens in localStorage under ownerTokens.<code>
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
│   ├── components/       # Reusable UI components
│   ├── pages/            # Route-level page components
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper functions (code gen, time conversion, localStorage)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

---

## Worker — workers/dump-worker

**Tech:** Cloudflare Workers (ES modules)
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
│   ├── handlers/
│   │   ├── clipboard.js      # CRUD handlers
│   │   └── starred.js        # Starred list handlers
│   ├── utils/
│   │   ├── hash.js           # SHA-256 hashing
│   │   ├── validate.js       # Code validation, reserved keywords
│   │   ├── kv.js             # KV read/write helpers
│   │   └── expiry.js         # Expiration calculation and checks
│   ├── middleware/
│   │   └── cors.js           # CORS + security headers
│   └── index.js              # Router and entry point
├── wrangler.toml
└── package.json
```

---

## Storage — Cloudflare KV

### Per-clipboard keys

| Key | Value | Description |
|-----|-------|-------------|
| clip:<code>:meta | JSON | Clipboard metadata |
| clip:<code>:content | String | Raw clipboard text |

### Metadata schema

```json
{
  "code": "string",
  "mode": "public | reserved | protected",
  "passwordHash": "string | null",
  "passwordMode": "view | edit | null",
  "ownerTokenHash": "string",
  "createdAt": "ISO8601 UTC",
  "expiresAt": "ISO8601 UTC | null",
  "isOneTimeView": "boolean",
  "isStarred": "boolean"
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
       → Worker validates code, checks reserved keywords
       → Worker checks code availability in KV
       → Worker hashes password (if provided)
       → Worker generates owner token, hashes it
       → Worker writes clip:<code>:meta and clip:<code>:content to KV
       → Worker returns { code, ownerToken, expiresAt }
       → Client stores ownerToken in localStorage
```

### Read Clipboard

```
Client → GET /api/clipboard/<code>
       → Worker reads clip:<code>:meta
       → Worker checks expiration → 404 if expired
       → Worker checks password mode
         → if view password required and no valid token → return { locked: true }
         → if owner token provided → bypass password
       → Worker reads clip:<code>:content
       → Worker returns content
       → If isOneTimeView → Worker deletes both KV keys, removes from app:starred
```

### Update Clipboard

```
Client → PUT /api/clipboard/<code>
       → Worker reads meta
       → Worker checks expiration → 404 if expired
       → Worker verifies owner token or edit password
       → Worker updates meta and/or content in KV
       → Worker returns { success: true }
```

### Delete Clipboard

```
Client → DELETE /api/clipboard/<code>
       → Worker reads meta
       → Worker verifies owner token or password (if protected)
       → Worker deletes clip:<code>:meta and clip:<code>:content
       → Worker removes code from app:starred if present
       → Worker returns { success: true }
```

### Star Clipboard

```
Client → POST /api/clipboard/<code>/star
       → Worker reads meta → verifies clipboard is public mode
       → If already starred → return { success: true } (idempotent)
       → Worker reads app:starred
       → Worker prepends code to list
       → If list length > 5 → removes oldest entry, updates that clipboard's isStarred to false
       → Worker updates app:starred and sets isStarred: true in meta
       → Worker returns { success: true }
```

### Unstar Clipboard

```
Client → DELETE /api/clipboard/<code>/star
       → Worker reads meta → verifies clipboard is public mode
       → Worker removes code from app:starred
       → Worker sets isStarred: false in meta
       → Worker returns { success: true }
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| PASSWORD_PEPPER | Secret string appended to passwords before hashing |

Stored as a Cloudflare Worker secret (not in wrangler.toml).

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

---

## Future: host.ashwithrai.me

When the host service is added:
- apps/host-web → new Vite app
- workers/host-worker → new Worker with R2 storage
- No changes required to dump-web or dump-worker
- Docs updated with host-specific ARCHITECTURE section