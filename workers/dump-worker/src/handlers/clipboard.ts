import { Env, ClipboardMeta, ClipboardMode, PasswordMode } from "../types";
import { getMeta, setMeta, setContent, getContent, deleteClipboard, getStarred, setStarred } from "../utils/kv";
import { isValidCode, isReservedCode, generateCode } from "../utils/validate";
import { hashPassword } from "../utils/hash";

// eslint-disable-next-line max-lines-per-function, @typescript-eslint/no-unused-vars
export async function handleCreate(request: Request, env: Env, _ctx: unknown): Promise<Response> {
  // 1. Parse JSON body. Return 400 if body is invalid JSON.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any;
  try {
    body = await request.json();
  } catch {
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
  const passwordHash = password ? await hashPassword(password, env.PASSWORD_PEPPER) : null;

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

// eslint-disable-next-line max-lines-per-function
export async function handleRead(request: Request, env: Env, codeParam: string): Promise<Response> {
  const code = codeParam.toLowerCase();

  const meta = await getMeta<ClipboardMeta>(env, code);
  if (!meta) {
    return new Response(JSON.stringify({ error: "Clipboard not found or expired" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (meta.expiresAt) {
    const expiresDate = new Date(meta.expiresAt);
    if (expiresDate.getTime() <= Date.now()) {
      return new Response(JSON.stringify({ error: "Clipboard not found or expired" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  const ownerToken = request.headers.get("X-Owner-Token");
  const password = request.headers.get("X-Clipboard-Password");

  let isAuthorized = false;
  if (ownerToken && ownerToken === meta.ownerTokenHash) {
    isAuthorized = true;
  }

  if (!isAuthorized && meta.passwordMode === "view") {
    if (!password) {
      return new Response(JSON.stringify({ locked: true, passwordMode: "view" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const hash = await hashPassword(password, env.PASSWORD_PEPPER);
    if (hash !== meta.passwordHash) {
      return new Response(JSON.stringify({ error: "Invalid password" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  const content = await getContent(env, code);
  if (!content) {
    return new Response(JSON.stringify({ error: "Clipboard not found or expired" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (meta.isOneTimeView) {
    await deleteClipboard(env, code);
    const starred = await getStarred(env);
    if (starred.includes(code)) {
      const filtered = starred.filter(c => c !== code);
      await setStarred(env, filtered);
    }
  }

  return new Response(JSON.stringify({
    code: meta.code,
    content,
    mode: meta.mode,
    passwordMode: meta.passwordMode,
    expiresAt: meta.expiresAt,
    isOneTimeView: meta.isOneTimeView,
    isStarred: meta.isStarred,
    createdAt: meta.createdAt
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

async function checkAuthorization(meta: ClipboardMeta, req: Request, env: Env): Promise<Response | null> {
  const ownerToken = req.headers.get("X-Owner-Token");
  if (ownerToken && ownerToken === meta.ownerTokenHash) {
    return null;
  }
  
  if (meta.passwordMode === "edit") {
    const pwd = req.headers.get("X-Clipboard-Password");
    if (!pwd) {
      return new Response(JSON.stringify({ error: "Invalid password or owner token" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    const hash = await hashPassword(pwd, env.PASSWORD_PEPPER);
    if (hash !== meta.passwordHash) {
      return new Response(JSON.stringify({ error: "Invalid password or owner token" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  return null;
}

function validateExpiration(expiresAt: string, createdAt: string): Response | null {
  const expiresDate = new Date(expiresAt);
  if (isNaN(expiresDate.getTime())) {
    return new Response(JSON.stringify({ error: "Invalid expiresAt date" }), {
      status: 400, headers: { "Content-Type": "application/json" }
    });
  }
  const expiresTime = expiresDate.getTime();
  if (expiresTime <= Date.now()) {
    return new Response(JSON.stringify({ error: "Expiration must be in the future" }), {
      status: 400, headers: { "Content-Type": "application/json" }
    });
  }
  const createdAtTime = new Date(createdAt).getTime();
  if (expiresTime > createdAtTime + 365 * 24 * 60 * 60 * 1000) {
    return new Response(JSON.stringify({ error: "Expiration exceeds 1 year from creation" }), {
      status: 400, headers: { "Content-Type": "application/json" }
    });
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateUpdateFields(body: any, meta: ClipboardMeta): Response | null {
  const { content, expiresAt, isOneTimeView, password, passwordMode } = body;
  const hasContent = content !== undefined;
  const hasExpires = expiresAt !== undefined;
  const hasOneTime = isOneTimeView !== undefined;
  const hasPwd = password !== undefined;
  const hasPwdMode = passwordMode !== undefined;

  if (!hasContent && !hasExpires && !hasOneTime && !hasPwd && !hasPwdMode) {
    return new Response(JSON.stringify({ error: "At least one field must be present" }), {
      status: 400, headers: { "Content-Type": "application/json" }
    });
  }

  const finalOneTime = hasOneTime ? Boolean(isOneTimeView) : meta.isOneTimeView;
  const finalExpires = hasExpires ? expiresAt : meta.expiresAt;

  if (finalOneTime && finalExpires) {
    return new Response(JSON.stringify({ error: "isOneTimeView and expiresAt cannot both be set" }), {
      status: 400, headers: { "Content-Type": "application/json" }
    });
  }

  if (hasExpires && expiresAt) {
    const err = validateExpiration(expiresAt, meta.createdAt);
    if (err) return err;
  }

  if (hasContent && (typeof content !== "string" || content.length > 262144)) {
    return new Response(JSON.stringify({ error: "Content invalid or exceeds 256KB" }), {
      status: 400, headers: { "Content-Type": "application/json" }
    });
  }

  if (hasPwdMode && passwordMode !== "view" && passwordMode !== "edit" && passwordMode !== null) {
    return new Response(JSON.stringify({ error: "Invalid passwordMode" }), {
      status: 400, headers: { "Content-Type": "application/json" }
    });
  }

  return null;
}

export async function handleUpdate(request: Request, env: Env, codeParam: string): Promise<Response> {
  const code = codeParam.toLowerCase();
  const meta = await getMeta<ClipboardMeta>(env, code);
  
  if (!meta || (meta.expiresAt && new Date(meta.expiresAt).getTime() <= Date.now())) {
    return new Response(JSON.stringify({ error: "Clipboard not found or expired" }), {
      status: 404, headers: { "Content-Type": "application/json" }
    });
  }

  const authError = await checkAuthorization(meta, request, env);
  if (authError) return authError;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any;
  try {
    body = await request.json();
    if (!body || typeof body !== "object") throw new Error();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid fields" }), {
      status: 400, headers: { "Content-Type": "application/json" }
    });
  }

  const valError = validateUpdateFields(body, meta);
  if (valError) return valError;

  if (body.password !== undefined) meta.passwordHash = body.password ? await hashPassword(body.password, env.PASSWORD_PEPPER) : null;
  if (body.passwordMode !== undefined) meta.passwordMode = body.passwordMode as PasswordMode | null;
  if (body.expiresAt !== undefined) meta.expiresAt = body.expiresAt || null;
  if (body.isOneTimeView !== undefined) meta.isOneTimeView = Boolean(body.isOneTimeView);

  await setMeta(env, code, meta, null);
  if (body.content !== undefined) {
    await setContent(env, code, body.content, null);
  }

  return new Response(JSON.stringify({ success: true, expiresAt: meta.expiresAt, isOneTimeView: meta.isOneTimeView }), {
    status: 200, headers: { "Content-Type": "application/json" }
  });
}

export async function handleDelete(request: Request, env: Env, codeParam: string): Promise<Response> {
  const code = codeParam.toLowerCase();

  const meta = await getMeta<ClipboardMeta>(env, code);
  if (!meta || (meta.expiresAt && new Date(meta.expiresAt).getTime() <= Date.now())) {
    return new Response(JSON.stringify({ error: "Clipboard not found or expired" }), {
      status: 404, headers: { "Content-Type": "application/json" }
    });
  }

  if (meta.mode === "protected") {
    const ownerToken = request.headers.get("X-Owner-Token");
    const password = request.headers.get("X-Clipboard-Password");

    let isAuthorized = false;
    if (ownerToken && ownerToken === meta.ownerTokenHash) {
      isAuthorized = true;
    } else if (password) {
      const hash = await hashPassword(password, env.PASSWORD_PEPPER);
      if (hash === meta.passwordHash) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: "Invalid password or owner token" }), {
        status: 403, headers: { "Content-Type": "application/json" }
      });
    }
  }

  await deleteClipboard(env, code);

  const starred = await getStarred(env);
  if (starred.includes(code)) {
    const filtered = starred.filter(c => c !== code);
    await setStarred(env, filtered);
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200, headers: { "Content-Type": "application/json" }
  });
}
