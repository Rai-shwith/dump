import { ClipboardMeta } from "../types";

export function isExpired(meta: ClipboardMeta): boolean {
  if (!meta.expiresAt) return false;
  if (meta.isOneTimeView) return false;
  return new Date(meta.expiresAt).getTime() <= Date.now();
}

export function calculateExpiresAt(expiresAtString: string | null | undefined): Date | null {
  if (!expiresAtString) return null;
  const date = new Date(expiresAtString);
  if (isNaN(date.getTime())) return null;
  return date;
}

export function validateExpiresAt(expiresAt: string, createdAt: string, maxYears = 1): { valid: boolean; error?: string } {
  const expiresDate = new Date(expiresAt);
  if (isNaN(expiresDate.getTime())) {
    return { valid: false, error: "Invalid expiresAt date" };
  }

  const expiresTime = expiresDate.getTime();
  if (expiresTime <= Date.now()) {
    return { valid: false, error: "Expiration must be in the future" };
  }

  const createdAtTime = new Date(createdAt).getTime();
  if (expiresTime > createdAtTime + maxYears * 365 * 24 * 60 * 60 * 1000) {
    return { valid: false, error: "Expiration exceeds 1 year" }; // Matches tests
  }

  return { valid: true };
}

export function ttlSeconds(expiresAt: string | null | undefined): number | null {
  if (!expiresAt) return null;
  const date = new Date(expiresAt);
  if (isNaN(date.getTime())) return null;

  const ttl = Math.floor((date.getTime() - Date.now()) / 1000);
  return ttl < 60 ? 60 : ttl;
}
