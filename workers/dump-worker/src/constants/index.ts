export const RESERVED_KEYWORDS: readonly string[] = [
  "admin", "api", "raw", "json", "create", "edit",
  "delete", "settings", "help", "docs", "host",
];

export const ALLOWED_ORIGINS: readonly string[] = [
  "https://dump.ashwithrai.me",
  "http://localhost:5173",
];

export const MAX_CONTENT_BYTES = 262144; // 256KB
export const MAX_CODE_LENGTH_MIN = 4;
export const DEFAULT_CODE_LENGTH = 8;
export const MAX_STARRED = 5;
export const MAX_EXPIRY_YEARS = 1;
export const STARRED_KEY = "app:starred";
