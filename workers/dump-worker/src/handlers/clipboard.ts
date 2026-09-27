import { Env, ClipboardMeta, ClipboardMode, PasswordMode } from "../types";
import { getMeta, setMeta, setContent, getContent, deleteClipboard, getStarred, setStarred } from "../utils/kv";
import { hashPassword, hashToken } from "../utils/hash";
import { isExpired, ttlSeconds } from "../utils/expiry";
import {
  createError,
  validateCreateContentAndCode,
  validateCreateModeAndExpiration,
  validateReadExpiration,
  authorizeRead,
  handleOneTimeView,
  checkAuthorization,
  validateUpdateFields,
  CreateRequestBody,
  UpdateRequestBody
} from "../services/clipboardService";

export async function handleCreate(request: Request, env: Env): Promise<Response> {
  let body: CreateRequestBody;
  try {
    body = (await request.json()) as CreateRequestBody;
  } catch {
    return createError("Invalid JSON body");
  }

  const { code, content, mode, passwordMode, password, expiresAt, isOneTimeView, expiryPreset } = body;

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
    passwordMode: modeRes.normalizedPasswordMode ?? null,
    ownerTokenHash: await hashToken(ownerToken),
    createdAt: new Date().toISOString(),
    expiresAt: finalExpiresAt,
    isOneTimeView: finalOneTime,
    isStarred: false,
    expiryPreset: typeof expiryPreset === "string" ? expiryPreset : null
  };

  const ttl = ttlSeconds(finalExpiresAt) ?? null;
  await setMeta(env, normalizedCode, meta, ttl);
  await setContent(env, normalizedCode, typeof content === "string" ? content : "", ttl);

  return new Response(
    JSON.stringify({ code: normalizedCode, ownerToken, expiresAt: finalExpiresAt, isOneTimeView: finalOneTime }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
}

export async function handleRead(request: Request, env: Env, codeParam: string): Promise<Response> {
  const code = codeParam.toLowerCase();

  const meta = await getMeta<ClipboardMeta>(env, code);
  if (!meta) {
    return createError("Clipboard not found or expired", 404);
  }

  const expireErr = validateReadExpiration(meta);
  if (expireErr) return expireErr;

  if (request.method === "HEAD") {
    return new Response(null, {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  const authErr = await authorizeRead(meta, request, env);
  if (authErr) return authErr;

  const content = await getContent(env, code);
  if (!content) {
    return createError("Clipboard not found or expired", 404);
  }

  const response = new Response(JSON.stringify({
    code: meta.code,
    content,
    mode: meta.mode,
    passwordMode: meta.passwordMode,
    expiresAt: meta.expiresAt,
    isOneTimeView: meta.isOneTimeView,
    isStarred: meta.isStarred,
    expiryPreset: meta.expiryPreset ?? null,
    createdAt: meta.createdAt
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });

  await handleOneTimeView(meta, env, code);

  return response;
}

export async function handleRaw(request: Request, env: Env, codeParam: string): Promise<Response> {
  const code = codeParam.toLowerCase();

  const meta = await getMeta<ClipboardMeta>(env, code);
  if (!meta || isExpired(meta)) {
    return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain" } });
  }

  if (request.method === "HEAD") {
    return new Response(null, { status: 200, headers: { "Content-Type": "text/plain" } });
  }

  const authErr = await authorizeRead(meta, request, env, true);
  if (authErr) return authErr;

  const content = await getContent(env, code);
  if (!content) {
    return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain" } });
  }

  const response = new Response(content, {
    status: 200,
    headers: { "Content-Type": "text/plain" }
  });

  await handleOneTimeView(meta, env, code);

  return response;
}

export async function handleUpdate(request: Request, env: Env, codeParam: string): Promise<Response> {
  const code = codeParam.toLowerCase();
  const meta = await getMeta<ClipboardMeta>(env, code);
  
  if (!meta || isExpired(meta)) {
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
  if (body.expiryPreset !== undefined) meta.expiryPreset = (body.expiryPreset as string) || null;

  const ttl = ttlSeconds(meta.expiresAt) ?? null;
  await setMeta(env, code, meta, ttl);
  if (body.content !== undefined) {
    await setContent(env, code, body.content as string, ttl);
  }

  return new Response(JSON.stringify({ success: true, expiresAt: meta.expiresAt, isOneTimeView: meta.isOneTimeView }), {
    status: 200, headers: { "Content-Type": "application/json" }
  });
}

export async function handleDelete(request: Request, env: Env, codeParam: string): Promise<Response> {
  const code = codeParam.toLowerCase();

  const meta = await getMeta<ClipboardMeta>(env, code);
  if (!meta || isExpired(meta)) {
    return createError("Clipboard not found or expired", 404);
  }

  if (meta.mode === "protected") {
    const ownerToken = request.headers.get("X-Owner-Token");
    const password = request.headers.get("X-Clipboard-Password");

    let isAuthorized = false;
    if (ownerToken && (await hashToken(ownerToken)) === meta.ownerTokenHash) {
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
