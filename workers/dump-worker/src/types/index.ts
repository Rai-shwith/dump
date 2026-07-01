export interface Env {
  CLIPBOARD_KV: KVNamespace;
  PASSWORD_PEPPER: string;
  ENVIRONMENT?: string;
}

export type ClipboardMode = "public" | "protected";
export type PasswordMode = "view" | "edit";

export interface ClipboardMeta {
  code: string;
  mode: ClipboardMode;
  passwordHash: string | null;
  passwordMode: PasswordMode | null;
  ownerTokenHash: string;
  createdAt: string;
  expiresAt: string | null;
  isOneTimeView: boolean;
  isStarred: boolean;
}

export interface StarredEntry {
  code: string;
  createdAt: string;
  expiresAt: string | null;
  isOneTimeView: boolean;
}

export interface ApiError {
  error: string;
}

export interface ApiSuccess {
  success: boolean;
}
