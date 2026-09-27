import { Env, ClipboardMeta, ClipboardMode } from "../types";
import { deleteClipboard, getStarred, setStarred } from "../utils/kv";
import { generateCode, validateCodeString } from "../utils/validate";
import { hashPassword, hashToken } from "../utils/hash";
import { isExpired, validateExpiresAt } from "../utils/expiry";

export interface CreateRequestBody {
  code?: unknown;
  content?: unknown;
  mode?: unknown;
  viewPassword?: unknown;
  editPassword?: unknown;
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
  viewPassword?: unknown;
  editPassword?: unknown;
  password?: unknown;
  passwordMode?: unknown;
  expiryPreset?: unknown;
}

export interface ValidateCreateModeOptions {
  mode?: unknown;
  viewPassword?: unknown;
  editPassword?: unknown;
  passwordMode?: unknown;
  password?: unknown;
  expiresAt?: unknown;
  isOneTimeView?: unknown;
}

export interface ValidatedCreateMode {
  error?: Response;
  normalizedMode?: ClipboardMode;
  viewPassword?: string | null;
  editPassword?: string | null;
}

export function createError(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

export function getPasswordHashes(meta: ClipboardMeta): {
  viewPasswordHash: string | null;
  editPasswordHash: string | null;
} {
  const viewPasswordHash =
    meta.viewPasswordHash ??
    (meta.passwordMode === "view" ? (meta.passwordHash ?? null) : null);
  const editPasswordHash =
    meta.editPasswordHash ??
    (meta.passwordMode === "edit" ? (meta.passwordHash ?? null) : null);
  return { viewPasswordHash, editPasswordHash };
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
  options: ValidateCreateModeOptions
): ValidatedCreateMode {
  const { mode, viewPassword, editPassword, passwordMode, password, expiresAt, isOneTimeView } = options;
  const validModes = ["public", "protected"];
  const finalMode = (typeof mode === "string" && validModes.includes(mode)) ? mode as ClipboardMode : "public";

  let vPw: string | null = null;
  let ePw: string | null = null;

  if (typeof viewPassword === "string" && viewPassword.trim().length > 0) {
    vPw = viewPassword;
  }
  if (typeof editPassword === "string" && editPassword.trim().length > 0) {
    ePw = editPassword;
  }

  if (!vPw && !ePw && typeof password === "string" && password.trim().length > 0) {
    if (passwordMode === "edit") {
      ePw = password;
    } else {
      vPw = password;
    }
  }

  if (finalMode === "protected" && !vPw && !ePw) {
    return { error: createError("At least one password (view or edit) is required for protected mode") };
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
    viewPassword: vPw,
    editPassword: ePw
  };
}

export function validateReadExpiration(meta: ClipboardMeta): Response | null {
  if (isExpired(meta)) {
    return createError("Clipboard not found or expired", 404);
  }
  return null;
}

export async function authorizeRead(
  meta: ClipboardMeta,
  request: Request,
  env: Env,
  isRaw = false
): Promise<Response | null> {
  const ownerToken = request.headers.get("X-Owner-Token");
  if (ownerToken && (await hashToken(ownerToken)) === meta.ownerTokenHash) {
    return null;
  }

  const { viewPasswordHash, editPasswordHash } = getPasswordHashes(meta);
  if (viewPasswordHash) {
    const password =
      request.headers.get("X-Clipboard-View-Password") ||
      request.headers.get("X-Clipboard-Password");

    if (!password) {
      if (isRaw) {
        return createError("Invalid password", 403);
      }
      return new Response(
        JSON.stringify({
          locked: true,
          requiresViewPassword: true,
          hasViewPassword: true,
          hasEditPassword: Boolean(editPasswordHash),
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const hash = await hashPassword(password, env.PASSWORD_PEPPER);
    if (hash !== viewPasswordHash) {
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

export async function checkAuthorization(
  meta: ClipboardMeta,
  req: Request,
  env: Env
): Promise<Response | null> {
  const { editPasswordHash } = getPasswordHashes(meta);
  if (!editPasswordHash) {
    return null;
  }

  const ownerToken = req.headers.get("X-Owner-Token");
  if (ownerToken && (await hashToken(ownerToken)) === meta.ownerTokenHash) {
    return null;
  }

  const pwd =
    req.headers.get("X-Clipboard-Edit-Password") ||
    req.headers.get("X-Clipboard-Password");

  if (!pwd) {
    return createError("Invalid password or owner token", 403);
  }

  const hash = await hashPassword(pwd, env.PASSWORD_PEPPER);
  if (hash !== editPasswordHash) {
    return createError("Invalid password or owner token", 403);
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
  const { content, expiresAt, isOneTimeView, viewPassword, editPassword, password, passwordMode } = body;
  const hasContent = content !== undefined;
  const hasExpires = expiresAt !== undefined;
  const hasOneTime = isOneTimeView !== undefined;
  const hasViewPw = viewPassword !== undefined;
  const hasEditPw = editPassword !== undefined;
  const hasLegacyPwd = password !== undefined;
  const hasLegacyMode = passwordMode !== undefined;

  if (!hasContent && !hasExpires && !hasOneTime && !hasViewPw && !hasEditPw && !hasLegacyPwd && !hasLegacyMode) {
    return createError("At least one field must be present");
  }

  const finalOneTime = hasOneTime ? Boolean(isOneTimeView) : meta.isOneTimeView;
  const finalExpires = hasExpires ? (expiresAt as string | null) : meta.expiresAt;

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

  if (meta.mode === "protected") {
    const { viewPasswordHash, editPasswordHash } = getPasswordHashes(meta);
    let willHaveView = Boolean(viewPasswordHash);
    let willHaveEdit = Boolean(editPasswordHash);

    if (hasViewPw) willHaveView = typeof viewPassword === "string" && viewPassword.length > 0;
    if (hasEditPw) willHaveEdit = typeof editPassword === "string" && editPassword.length > 0;
    if (hasLegacyPwd && !hasViewPw && !hasEditPw) {
      const hasText = typeof password === "string" && password.length > 0;
      if (passwordMode === "view") {
        willHaveView = hasText;
      } else if (passwordMode === "edit") {
        willHaveEdit = hasText;
      }
    }

    if (!willHaveView && !willHaveEdit) {
      return createError("Protected mode requires at least one password");
    }
  }

  return null;
}
