export type ClipboardMode = "public" | "reserved" | "protected";
export type PasswordMode = "view" | "edit";

export interface ClipboardMeta {
  code: string;
  mode: ClipboardMode;
  passwordMode: PasswordMode | null;
  expiresAt: string | null;
  isOneTimeView: boolean;
  isStarred: boolean;
  createdAt: string;
}

export interface ClipboardContent extends ClipboardMeta {
  content: string;
}

export interface LockedResponse {
  locked: true;
  passwordMode: PasswordMode;
}

export interface StarredEntry {
  code: string;
  createdAt: string;
  expiresAt: string | null;
  isOneTimeView: boolean;
}

export interface CreateClipboardRequest {
  code?: string;
  content: string;
  mode: ClipboardMode;
  passwordMode?: PasswordMode;
  password?: string;
  expiresAt?: string | null;
  isOneTimeView?: boolean;
}

export interface CreateClipboardResponse {
  code: string;
  ownerToken: string;
  expiresAt: string | null;
  isOneTimeView: boolean;
}
