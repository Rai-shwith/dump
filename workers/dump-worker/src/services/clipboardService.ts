import { Env, ClipboardMeta, ClipboardMode, PasswordMode } from "../types";
import { deleteClipboard, getStarred, setStarred } from "../utils/kv";
import { generateCode, validateCodeString } from "../utils/validate";
import { hashPassword, hashToken } from "../utils/hash";
import { isExpired, validateExpiresAt } from "../utils/expiry";

export interface CreateRequestBody {
  code?: unknown;
  content?: unknown;
  mode?: unknown;
  passwordMode?: unknown;
  password?: unknown;
  expiresAt?: unknown;
  isOneTimeView?: unknown;
  expiryPreset?: unknown;
}

export interface UpdateRequestBody {
  content?: unknown;
  expiresAt?: unknown;
  isOneTimeView?: unknown;
  password?: unknown;
  passwordMode?: unknown;
  expiryPreset?: unknown;
}

export function createError(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

export function validateCreateContentAndCode(content: unknown, code: unknown): { error?: Response; normalizedCode?: string } {
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

  const codeVal = validateCodeString(finalCode);
  if (!codeVal.valid) {
    return { error: createError(codeVal.error as string) };
  }

  return { normalizedCode: finalCode };
}

export function validateCreateModeAndExpiration(
  mode: unknown,
  passwordMode: unknown,
  password: unknown,
  expiresAt: unknown,
  isOneTimeView: unknown
): { error?: Response; normalizedMode?: ClipboardMode; normalizedPasswordMode?: PasswordMode | null } {
  const validModes = ["public", "protected"];
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
  if (finalMode === "protected" && !expiresAt && !isOneTimeView) {
    return { error: createError("Protected mode requires expiration") };
  }

  if (expiresAt) {
    if (typeof expiresAt !== "string") {
      return { error: createError("Invalid expiresAt date") };
    }
    const val = validateExpiresAt(expiresAt, new Date().toISOString());
    if (!val.valid) {
      return { error: createError(val.error as string) };
    }
  }

  return { 
    normalizedMode: finalMode, 
    normalizedPasswordMode: (passwordMode as PasswordMode) || null 
  };
}

export function validateReadExpiration(meta: ClipboardMeta): Response | null {
  if (isExpired(meta)) {
    return createError("Clipboard not found or expired", 404);
  }
  return null;
}

export async function authorizeRead(meta: ClipboardMeta, request: Request, env: Env, isRaw = false): Promise<Response | null> {
  const ownerToken = request.headers.get("X-Owner-Token");
  if (ownerToken && (await hashToken(ownerToken)) === meta.ownerTokenHash) {
    return null;
  }

  if (meta.passwordMode === "view") {
    const password = request.headers.get("X-Clipboard-Password");
    if (!password) {
      if (isRaw) {
        return createError("Invalid password", 403);
      }
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

export async function handleOneTimeView(meta: ClipboardMeta, env: Env, code: string): Promise<void> {
  if (meta.isOneTimeView) {
    await deleteClipboard(env, code);
    const starred = await getStarred(env);
    if (starred.includes(code)) {
      const filtered = starred.filter(c => c !== code);
      await setStarred(env, filtered);
    }
  }
}

export async function checkAuthorization(meta: ClipboardMeta, req: Request, env: Env): Promise<Response | null> {
  const ownerToken = req.headers.get("X-Owner-Token");
  if (ownerToken && (await hashToken(ownerToken)) === meta.ownerTokenHash) {
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

export function validateExpiration(expiresAt: string, createdAt: string): Response | null {
  const val = validateExpiresAt(expiresAt, createdAt);
  if (!val.valid) {
    return createError(val.error as string);
  }
  return null;
}

export function validateUpdateFields(body: UpdateRequestBody, meta: ClipboardMeta): Response | null {
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
