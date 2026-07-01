const getApiBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_BASE_URL ?? "https://dump.ashwithrai.me/api";
  const cleaned = url.endsWith("/") ? url.slice(0, -1) : url;
  return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
};

export const APP_CONFIG = {
  apiBaseUrl: getApiBaseUrl(),
  themeStorageKey: "dump-theme",
  ownerTokenPrefix: "ownerTokens",
  bypassPasswordPrefix: "bypassPasswords",
  defaultTheme: "dark" as "dark" | "light",
  codeMinLength: 4,
  codeDefaultLength: 8,
  contentMaxBytes: 256 * 1024,
  starredMaxCount: 5,
  reservedKeywords: [
    "admin",
    "api",
    "raw",
    "json",
    "create",
    "edit",
    "delete",
    "settings",
    "help",
    "docs",
    "host",
    "new",
  ],
} as const;
