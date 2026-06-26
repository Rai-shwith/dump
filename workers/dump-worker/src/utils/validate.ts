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
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[array[i] % chars.length];
  }
  return code;
}

export function validateCodeString(code: string): { valid: boolean; error?: string } {
  if (!isValidCode(code)) {
    return { valid: false, error: "Code contains invalid characters or is too short" };
  }
  if (isReservedCode(code)) {
    return { valid: false, error: "Code is a reserved keyword" };
  }
  return { valid: true };
}
