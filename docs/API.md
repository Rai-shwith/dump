# API.md

This file documents the complete API contract for the Dump worker.
AI agents must read this file before implementing or modifying any API endpoints.

---

## Base URL

Production: https://dump.ashwithrai.me/api
Local: http://localhost:8787/api

---

## General Rules

- All request and response bodies are JSON unless otherwise noted.
- All timestamps are ISO 8601 UTC strings.
- All clipboard codes are lowercase. The worker lowercases all incoming codes.
- Expired clipboards always return 404. The API never reveals prior existence.
- Owner token takes priority over all password checks when provided and valid.
- All endpoints return appropriate security headers (see DECISIONS.md D-013).

---

## Authentication Model

No accounts. No sessions. Two token types only:

| Token | Description |
|-------|-------------|
| Owner Token | Returned at creation. Sent as X-Owner-Token header. Bypasses all passwords. |
| Password | Sent as X-Clipboard-Password header. Scope depends on passwordMode. |

---

## Error Response Format

All errors follow this shape:

```json
{
  "error": "string describing the problem"
}
```

---

## Endpoints

---

### POST /api/clipboard

Create a new clipboard.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "code": "string (optional, 4+ chars, a-z 0-9 - _)",
  "content": "string (required, max 256KB)",
  "mode": "public | reserved | protected",
  "passwordMode": "view | edit | null",
  "password": "string | null",
  "expiresAt": "ISO8601 UTC string | null",
  "isOneTimeView": "boolean"
}
```

**Notes:**
- If code is omitted, the worker generates a random 8-character code.
- If mode is protected, password and passwordMode are required.
- If mode is public and expiresAt is null and isOneTimeView is false, clipboard is permanent.
- If mode is reserved or protected, expiresAt is required (max 1 year from now).
- isOneTimeView and expiresAt are mutually exclusive. If isOneTimeView is true, expiresAt must be null.

**Response 201:**
```json
{
  "code": "string",
  "ownerToken": "string (raw, only returned once)",
  "expiresAt": "ISO8601 UTC string | null",
  "isOneTimeView": "boolean"
}
```

**Errors:**

| Status | Error |
|--------|-------|
| 400 | Invalid or missing fields |
| 400 | Code contains invalid characters |
| 400 | Code is too short |
| 400 | Code is a reserved keyword |
| 400 | Reserved and protected modes require expiration |
| 400 | isOneTimeView and expiresAt cannot both be set |
| 400 | Expiration exceeds 1 year |
| 400 | Content exceeds 256KB |
| 409 | Code already exists |

---

### GET /api/clipboard/:code

Read a clipboard.

**Request Headers:**
```
X-Owner-Token: string (optional)
X-Clipboard-Password: string (optional)
```

**Response 200 — unlocked:**
```json
{
  "code": "string",
  "content": "string",
  "mode": "public | reserved | protected",
  "passwordMode": "view | edit | null",
  "expiresAt": "ISO8601 UTC string | null",
  "isOneTimeView": "boolean",
  "isStarred": "boolean",
  "createdAt": "ISO8601 UTC string"
}
```

**Response 200 — locked (view password required, no valid token provided):**
```json
{
  "locked": true,
  "passwordMode": "view"
}
```

**Notes:**
- If passwordMode is view and no valid owner token or password is provided, return locked response.
- If passwordMode is edit, content is always visible. Password is only required for edit/delete.
- Owner token bypasses all password checks.
- If isOneTimeView is true, the worker deletes the clipboard after returning content.
- Deletion on one-time view also removes the code from app:starred if present.

**Errors:**

| Status | Error |
|--------|-------|
| 404 | Clipboard not found or expired |
| 403 | Invalid password |
| 403 | Invalid owner token |

---

### GET /api/clipboard/:code/raw

Read raw clipboard content as plain text.

**Request Headers:**
```
X-Owner-Token: string (optional)
X-Clipboard-Password: string (optional)
```

**Response 200:**
```
plain text content
```

**Notes:**
- Same auth rules as GET /api/clipboard/:code.
- Returns Content-Type: text/plain.
- One-time view deletion applies here too.
- No JSON wrapper.

**Errors:**

| Status | Error |
|--------|-------|
| 404 | Clipboard not found or expired |
| 403 | Invalid password |

---

### PUT /api/clipboard/:code

Update a clipboard.

**Request Headers:**
```
Content-Type: application/json
X-Owner-Token: string (optional)
X-Clipboard-Password: string (optional, required if edit password set and no owner token)
```

**Request Body (all fields optional, send only what changes):**
```json
{
  "content": "string | null",
  "expiresAt": "ISO8601 UTC string | null",
  "isOneTimeView": "boolean | null",
  "password": "string | null",
  "passwordMode": "view | edit | null"
}
```

**Notes:**
- At least one field must be present.
- Owner token bypasses password requirement.
- If passwordMode is edit, X-Clipboard-Password is required to update.
- If passwordMode is view, anyone can update (view password only restricts reading).
- Cannot change clipboard mode (public/reserved/protected) after creation.
- Cannot extend expiration beyond 1 year from original creation time.
- isOneTimeView and expiresAt cannot both be set.

**Response 200:**
```json
{
  "success": true,
  "expiresAt": "ISO8601 UTC string | null",
  "isOneTimeView": "boolean"
}
```

**Errors:**

| Status | Error |
|--------|-------|
| 400 | Invalid fields |
| 400 | isOneTimeView and expiresAt cannot both be set |
| 400 | Expiration exceeds 1 year from creation |
| 403 | Invalid password or owner token |
| 404 | Clipboard not found or expired |

---

### DELETE /api/clipboard/:code

Delete a clipboard.

**Request Headers:**
```
X-Owner-Token: string (optional)
X-Clipboard-Password: string (optional)
```

**Notes:**
- Public clipboards: anyone can delete, no token required.
- Reserved clipboards: anyone can delete, no token required.
- Protected clipboards: valid owner token or unlocked password required.
- Deletion also removes code from app:starred if present.
- Both clip:<code>:meta and clip:<code>:content are deleted.

**Response 200:**
```json
{
  "success": true
}
```

**Errors:**

| Status | Error |
|--------|-------|
| 403 | Invalid password or owner token |
| 404 | Clipboard not found or expired |

---

### POST /api/clipboard/:code/star

Pin a clipboard to the global homepage starred list.

**Notes:**
- Only public clipboards can be starred.
- Idempotent. If already starred, returns success without duplicating.
- If starred list has 5 entries, oldest is dropped silently.
- Dropped clipboard's isStarred is set to false in its metadata.

**Response 200:**
```json
{
  "success": true,
  "isStarred": true
}
```

**Errors:**

| Status | Error |
|--------|-------|
| 400 | Clipboard is not public |
| 404 | Clipboard not found or expired |

---

### DELETE /api/clipboard/:code/star

Unpin a clipboard from the global homepage starred list.

**Notes:**
- Idempotent. If not starred, returns success.

**Response 200:**
```json
{
  "success": true,
  "isStarred": false
}
```

**Errors:**

| Status | Error |
|--------|-------|
| 404 | Clipboard not found or expired |

---

### GET /api/starred

Get the global starred clipboard list for the homepage.

**Response 200:**
```json
{
  "starred": [
    {
      "code": "string",
      "createdAt": "ISO8601 UTC string",
      "expiresAt": "ISO8601 UTC string | null",
      "isOneTimeView": "boolean"
    }
  ]
}
```

**Notes:**
- Returns at most 5 entries.
- Entries are ordered most recently starred first.
- If a starred clipboard has expired, it is silently excluded from the response
  and removed from app:starred during this read (lazy cleanup).
- Never returns content or password hashes.

---

## Header Reference

### Request Headers sent by client

| Header | Description |
|--------|-------------|
| X-Owner-Token | Raw owner token for privileged access |
| X-Clipboard-Password | Raw password for password-protected clipboards |

### Response Headers set by worker

| Header | Value |
|--------|-------|
| Content-Type | application/json or text/plain |
| X-Content-Type-Options | nosniff |
| X-Frame-Options | DENY |
| Referrer-Policy | no-referrer |
| Content-Security-Policy | default-src 'none' |
| Access-Control-Allow-Origin | https://dump.ashwithrai.me or http://localhost:5173 |
| Access-Control-Allow-Methods | GET, POST, PUT, DELETE, OPTIONS |
| Access-Control-Allow-Headers | Content-Type, X-Owner-Token, X-Clipboard-Password |

---

## Expiration Rules Summary

| Mode | Infinite allowed | One-Time View allowed | Max expiration |
|------|-----------------|-----------------------|----------------|
| public | yes | yes | unlimited |
| reserved | no | yes | 1 year |
| protected | no | yes | 1 year |

---

## Code Validation Rules Summary

| Rule | Detail |
|------|--------|
| Allowed characters | a-z, 0-9, hyphen, underscore |
| Minimum length | 4 characters |
| Case | Always lowercased |
| Reserved keywords | admin, api, raw, json, create, edit, delete, settings, help, docs, host |