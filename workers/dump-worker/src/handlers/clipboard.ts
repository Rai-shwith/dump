import { Env, ClipboardMeta, ClipboardMode, PasswordMode } from "../types";
import { getMeta, setMeta, setContent, getContent, deleteClipboard, getStarred, setStarred } from "../utils/kv";
import { isValidCode, isReservedCode, generateCode } from "../utils/validate";
import { hashPassword } from "../utils/hash";

interface CreateRequestBody {
  code?: unknown;
  content?: unknown;
  mode?: unknown;
  passwordMode?: unknown;
  password?: unknown;
  expiresAt?: unknown;
  isOneTimeView?: unknown;
}

interface UpdateRequestBody {
  content?: unknown;
  expiresAt?: unknown;
  isOneTimeView?: unknown;
  password?: unknown;
  passwordMode?: unknown;
}

function createError(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function validateCreateContentAndCode(content: unknown, code: unknown): { error?: Response; normalizedCode?: string } {
  if (!content || typeof content !== "string" || content.length === 0) {
    return { error: createError("Content is required and cannot be empty") };
  }
  if (content.length > 262144) {
    return { error: createError("Content exceeds 256KB") };
  }

  let finalCode: string;
  if (!code) {
    finalCode = generateCode();
  } else if (typeof code !== "string") {
    return { error: createError("Invalid code format") };
  } else {
    finalCode = code.toLowerCase();
  }

  if (!isValidCode(finalCode)) {
    return { error: createError("Code contains invalid characters or is too short") };
  }
  if (isReservedCode(finalCode)) {
    return { error: createError("Code is a reserved keyword") };
  }

  return { normalizedCode: finalCode };
}

function validateCreateModeAndExpiration(
  mode: unknown,
  passwordMode: unknown,
  password: unknown,
  expiresAt: unknown,
  isOneTimeView: unknown
): { error?: Response; normalizedMode?: ClipboardMode; normalizedPasswordMode?: PasswordMode | null } {
  const validModes = ["public", "reserved", "protected"];
  const finalMode = (typeof mode === "string" && validModes.includes(mode)) ? mode as ClipboardMode : "public";

  if (finalMode === "protected" && (!password || !passwordMode)) {
    return { error: createError("Password and passwordMode are required for protected mode") };
  }

  if (passwordMode !== undefined && passwordMode !== null && passwordMode !== "view" && passwordMode !== "edit") {
    return { error: createError("Invalid passwordMode") };
  }

  if (isOneTimeView && expiresAt) {
    return { error: createError("isOneTimeView and expiresAt cannot both be set") };
  }
  if ((finalMode === "reserved" || finalMode === "protected") && !expiresAt) {
    return { error: createError("Reserved and protected modes require expiration") };
  }

  if (expiresAt) {
    if (typeof expiresAt !== "string") {
      return { error: createError("Invalid expiresAt date") };
    }
    const expiresDate = new Date(expiresAt);
    if (isNaN(expiresDate.getTime())) {
      return { error: createError("Invalid expiresAt date") };
    }
    const now = Date.now();
    const expiresTime = expiresDate.getTime();
    if (expiresTime <= now) {
      return { error: createError("Expiration must be in the future") };
    }
    if (expiresTime > now + 365 * 24 * 60 * 60 * 1000) {
      return { error: createError("Expiration exceeds 1 year") };
    }
  }

  return { 
    normalizedMode: finalMode, 
    normalizedPasswordMode: (passwordMode as PasswordMode) || null 
  };
}

export async function handleCreate(request: Request, env: Env): Promise<Response> {
  let body: CreateRequestBody;
  try {
    body = (await request.json()) as CreateRequestBody;
  } catch {
    return createError("Invalid JSON body");
  }

  const { code, content, mode, passwordMode, password, expiresAt, isOneTimeView } = body;

  const codeRes = validateCreateContentAndCode(content, code);
  if (codeRes.error) return codeRes.error;
  const normalizedCode = codeRes.normalizedCode as string;

  const modeRes = validateCreateModeAndExpiration(mode, passwordMode, password, expiresAt, isOneTimeView);
  if (modeRes.error) return modeRes.error;

  const existingMeta = await getMeta(env, normalizedCode);
  if (existingMeta) return createError("Code already exists", 409);

  const ownerToken = crypto.randomUUID();
  const passwordStr = typeof password === "string" ? password : "";
  const passwordHash = passwordStr ? await hashPassword(passwordStr, env.PASSWORD_PEPPER) : null;

  const finalExpiresAt = typeof expiresAt === "string" ? expiresAt : null;
  const finalOneTime = Boolean(isOneTimeView);

  const meta: ClipboardMeta = {
    code: normalizedCode,
    mode: modeRes.normalizedMode as ClipboardMode,
    passwordHash,
    passwordMode: modeRes.normalizedPasswordMode,
    ownerTokenHash: ownerToken,
    createdAt: new Date().toISOString(),
    expiresAt: finalExpiresAt,
    isOneTimeView: finalOneTime,
    isStarred: false
  };

  await setMeta(env, normalizedCode, meta, null);
  await setContent(env, normalizedCode, typeof content === "string" ? content : "", null);

  return new Response(
    JSON.stringify({ code: normalizedCode, ownerToken, expiresAt: finalExpiresAt, isOneTimeView: finalOneTime }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
}

function validateReadExpiration(meta: ClipboardMeta): Response | null {
  if (meta.expiresAt) {
    const expiresDate = new Date(meta.expiresAt);
    if (expiresDate.getTime() <= Date.now()) {
      return createError("Clipboard not found or expired", 404);
    }
  }
  return null;
}

async function authorizeRead(meta: ClipboardMeta, request: Request, env: Env): Promise<Response | null> {
  const ownerToken = request.headers.get("X-Owner-Token");
  if (ownerToken && ownerToken === meta.ownerTokenHash) {
    return null;
  }

  if (meta.passwordMode === "view") {
    const password = request.headers.get("X-Clipboard-Password");
    if (!password) {
      return new Response(JSON.stringify({ locked: true, passwordMode: "view" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const hash = await hashPassword(password, env.PASSWORD_PEPPER);
    if (hash !== meta.passwordHash) {
      return createError("Invalid password", 403);
    }
  }
  return null;
}

async function handleOneTimeView(meta: ClipboardMeta, env: Env, code: string): Promise<void> {
  if (meta.isOneTimeView) {
    await deleteClipboard(env, code);
    const starred = await getStarred(env);
    if (starred.includes(code)) {
      const filtered = starred.filter(c => c !== code);
      await setStarred(env, filtered);
    }
  }
}

export async function handleRead(request: Request, env: Env, codeParam: string): Promise<Response> {
  const code = codeParam.toLowerCase();

  const meta = await getMeta<ClipboardMeta>(env, code);
  if (!meta) {
    return createError("Clipboard not found or expired", 404);
  }

  const expireErr = validateReadExpiration(meta);
  if (expireErr) return expireErr;

  const authErr = await authorizeRead(meta, request, env);
  if (authErr) return authErr;

  const content = await getContent(env, code);
  if (!content) {
    return createError("Clipboard not found or expired", 404);
  }

  await handleOneTimeView(meta, env, code);

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
      return createError("Invalid password or owner token", 403);
    }
    const hash = await hashPassword(pwd, env.PASSWORD_PEPPER);
    if (hash !== meta.passwordHash) {
      return createError("Invalid password or owner token", 403);
    }
  }
  return null;
}

function validateExpiration(expiresAt: string, createdAt: string): Response | null {
  const expiresDate = new Date(expiresAt);
  if (isNaN(expiresDate.getTime())) {
    return createError("Invalid expiresAt date");
  }
  const expiresTime = expiresDate.getTime();
  if (expiresTime <= Date.now()) {
    return createError("Expiration must be in the future");
  }
  const createdAtTime = new Date(createdAt).getTime();
  if (expiresTime > createdAtTime + 365 * 24 * 60 * 60 * 1000) {
    return createError("Expiration exceeds 1 year from creation");
  }
  return null;
}

function validateUpdateFields(body: UpdateRequestBody, meta: ClipboardMeta): Response | null {
  const { content, expiresAt, isOneTimeView, password, passwordMode } = body;
  const hasContent = content !== undefined;
  const hasExpires = expiresAt !== undefined;
  const hasOneTime = isOneTimeView !== undefined;
  const hasPwd = password !== undefined;
  const hasPwdMode = passwordMode !== undefined;

  if (!hasContent && !hasExpires && !hasOneTime && !hasPwd && !hasPwdMode) {
    return createError("At least one field must be present");
  }

  const finalOneTime = hasOneTime ? Boolean(isOneTimeView) : meta.isOneTimeView;
  const finalExpires = hasExpires ? expiresAt : meta.expiresAt;

  if (finalOneTime && finalExpires) {
    return createError("isOneTimeView and expiresAt cannot both be set");
  }

  if (hasExpires && expiresAt) {
    if (typeof expiresAt !== "string") {
      return createError("Invalid expiresAt date");
    }
    const err = validateExpiration(expiresAt, meta.createdAt);
    if (err) return err;
  }

  if (hasContent && (typeof content !== "string" || content.length > 262144)) {
    return createError("Content invalid or exceeds 256KB");
  }

  if (hasPwdMode && passwordMode !== "view" && passwordMode !== "edit" && passwordMode !== null) {
    return createError("Invalid passwordMode");
  }

  return null;
}

export async function handleUpdate(request: Request, env: Env, codeParam: string): Promise<Response> {
  const code = codeParam.toLowerCase();
  const meta = await getMeta<ClipboardMeta>(env, code);
  
  if (!meta || (meta.expiresAt && new Date(meta.expiresAt).getTime() <= Date.now())) {
    return createError("Clipboard not found or expired", 404);
  }

  const authError = await checkAuthorization(meta, request, env);
  if (authError) return authError;

  let body: UpdateRequestBody;
  try {
    const rawBody = await request.json();
    if (!rawBody || typeof rawBody !== "object") throw new Error();
    body = rawBody as UpdateRequestBody;
  } catch {
    return createError("Invalid fields");
  }

  const valError = validateUpdateFields(body, meta);
  if (valError) return valError;

  if (body.password !== undefined) {
    const pwd = typeof body.password === "string" ? body.password : "";
    meta.passwordHash = pwd ? await hashPassword(pwd, env.PASSWORD_PEPPER) : null;
  }
  if (body.passwordMode !== undefined) meta.passwordMode = body.passwordMode as PasswordMode | null;
  if (body.expiresAt !== undefined) meta.expiresAt = (body.expiresAt as string) || null;
  if (body.isOneTimeView !== undefined) meta.isOneTimeView = Boolean(body.isOneTimeView);

  await setMeta(env, code, meta, null);
  if (body.content !== undefined) {
    await setContent(env, code, body.content as string, null);
  }

  return new Response(JSON.stringify({ success: true, expiresAt: meta.expiresAt, isOneTimeView: meta.isOneTimeView }), {
    status: 200, headers: { "Content-Type": "application/json" }
  });
}

export async function handleDelete(request: Request, env: Env, codeParam: string): Promise<Response> {
  const code = codeParam.toLowerCase();

  const meta = await getMeta<ClipboardMeta>(env, code);
  if (!meta || (meta.expiresAt && new Date(meta.expiresAt).getTime() <= Date.now())) {
    return createError("Clipboard not found or expired", 404);
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
      return createError("Invalid password or owner token", 403);
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
