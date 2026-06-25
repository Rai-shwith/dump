import { Env, ClipboardMeta, ClipboardMode, PasswordMode } from "../types";
import { getMeta, setMeta, setContent } from "../utils/kv";
import { isValidCode, isReservedCode, generateCode } from "../utils/validate";

export async function handleCreate(request: Request, env: Env, ctx: any): Promise<Response> {
  // 1. Parse JSON body. Return 400 if body is invalid JSON.
  let body: any;
  try {
    body = await request.json();
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 2. Extract fields
  let { code, content, mode, passwordMode, password, expiresAt, isOneTimeView } = body;

  // 3. Validate content
  if (!content || typeof content !== "string" || content.length === 0) {
    return new Response(JSON.stringify({ error: "Content is required and cannot be empty" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (content.length > 262144) {
    return new Response(JSON.stringify({ error: "Content exceeds 256KB" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 4. Validate and normalize code
  if (!code) {
    code = generateCode();
  } else if (typeof code !== "string") {
    return new Response(JSON.stringify({ error: "Invalid code format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  code = code.toLowerCase();

  if (!isValidCode(code)) {
    return new Response(JSON.stringify({ error: "Code contains invalid characters or is too short" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (isReservedCode(code)) {
    return new Response(JSON.stringify({ error: "Code is a reserved keyword" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 5. Validate mode
  const validModes = ["public", "reserved", "protected"];
  if (!mode || !validModes.includes(mode)) {
    mode = "public";
  }

  if (mode === "protected") {
    if (!password || !passwordMode) {
      return new Response(JSON.stringify({ error: "Password and passwordMode are required for protected mode" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  if (passwordMode !== undefined && passwordMode !== null) {
    if (passwordMode !== "view" && passwordMode !== "edit") {
      return new Response(JSON.stringify({ error: "Invalid passwordMode" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  // 6. Validate expiration
  if (isOneTimeView && expiresAt) {
    return new Response(JSON.stringify({ error: "isOneTimeView and expiresAt cannot both be set" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  if ((mode === "reserved" || mode === "protected") && !expiresAt) {
    return new Response(JSON.stringify({ error: "Reserved and protected modes require expiration" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (expiresAt) {
    const expiresDate = new Date(expiresAt);
    if (isNaN(expiresDate.getTime())) {
      return new Response(JSON.stringify({ error: "Invalid expiresAt date" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const now = Date.now();
    const expiresTime = expiresDate.getTime();

    if (expiresTime <= now) {
      return new Response(JSON.stringify({ error: "Expiration must be in the future" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const oneYearFromNow = now + 365 * 24 * 60 * 60 * 1000;
    if (expiresTime > oneYearFromNow) {
      return new Response(JSON.stringify({ error: "Expiration exceeds 1 year" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  // 7. Check code availability
  const existingMeta = await getMeta(env, code);
  if (existingMeta) {
    return new Response(JSON.stringify({ error: "Code already exists" }), {
      status: 409,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 8. Generate owner token
  const ownerToken = crypto.randomUUID();

  // 9. Handle password
  const passwordHash = password || null;

  // 10. Build metadata object
  const meta: ClipboardMeta = {
    code,
    mode: mode as ClipboardMode,
    passwordHash,
    passwordMode: passwordMode as PasswordMode | null,
    ownerTokenHash: ownerToken,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt || null,
    isOneTimeView: Boolean(isOneTimeView),
    isStarred: false
  };

  // 11. Calculate TTL for KV (skip for now)
  // 12. Write to KV
  await setMeta(env, code, meta, null);
  await setContent(env, code, content, null);

  // 13. Return 201
  return new Response(
    JSON.stringify({
      code,
      ownerToken,
      expiresAt: expiresAt || null,
      isOneTimeView: Boolean(isOneTimeView)
    }),
    {
      status: 201,
      headers: { "Content-Type": "application/json" }
    }
  );
}
