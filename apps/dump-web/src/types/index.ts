export type ClipboardMode = "public" | "protected";
export type PasswordMode = "view" | "edit" | null;
export type Theme = "dark" | "light";

export type ExpiryPreset =
  "1m" | "5m" | "15m" | "1h" | "1d" | "1w" | "1mo" | "1y" | "infinite" | "otv" | "custom";

export interface CreateClipboardPayload {
  code?: string;
  content: string;
  mode: ClipboardMode;
  passwordMode: PasswordMode;
  password: string | null;
  expiresAt: string | null;
  isOneTimeView: boolean;
  expiryPreset?: ExpiryPreset | null;
}

export interface CreateClipboardResponse {
  code: string;
  ownerToken: string;
  expiresAt: string | null;
  isOneTimeView: boolean;
}

export interface ClipboardData {
  code: string;
  content: string;
  mode: ClipboardMode;
  passwordMode: PasswordMode;
  expiresAt: string | null;
  isOneTimeView: boolean;
  isStarred: boolean;
  createdAt: string;
  expiryPreset?: ExpiryPreset | null;
}

export interface LockedResponse {
  locked: true;
  passwordMode: "view";
}

export interface StarredClipboard {
  code: string;
  createdAt: string;
  expiresAt: string | null;
  isOneTimeView: boolean;
}

export interface GetStarredResponse {
  starred: StarredClipboard[];
}

export interface UpdateClipboardPayload {
  content?: string | null;
  expiresAt?: string | null;
  isOneTimeView?: boolean | null;
  password?: string | null;
  passwordMode?: PasswordMode;
  expiryPreset?: ExpiryPreset | null;
}

export interface UpdateClipboardResponse {
  success: boolean;
  expiresAt: string | null;
  isOneTimeView: boolean;
}
