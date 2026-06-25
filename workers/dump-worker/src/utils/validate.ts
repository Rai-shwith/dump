export const RESERVED_KEYWORDS = [
  "admin", "api", "raw", "json", "create", "edit", "delete",
  "settings", "help", "docs", "host"
];

export function isValidCode(code: string): boolean {
  return /^[a-z0-9_-]{4,}$/.test(code);
}

export function isReservedCode(code: string): boolean {
  return RESERVED_KEYWORDS.includes(code);
}

export function generateCode(): string {
  return crypto.randomUUID().replace(/-/g, "").substring(0, 8);
}
