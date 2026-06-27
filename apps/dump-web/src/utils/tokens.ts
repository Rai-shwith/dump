import { APP_CONFIG } from "@/config/app.config";

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getOwnerToken(code: string): string | null {
  return safeStorage()?.getItem(`${APP_CONFIG.ownerTokenPrefix}.${code}`) ?? null;
}

export function saveOwnerToken(code: string, token: string): void {
  safeStorage()?.setItem(`${APP_CONFIG.ownerTokenPrefix}.${code}`, token);
}

export function getBypassPassword(code: string): string | null {
  return safeStorage()?.getItem(`${APP_CONFIG.bypassPasswordPrefix}.${code}`) ?? null;
}

export function saveBypassPassword(code: string, password: string): void {
  safeStorage()?.setItem(`${APP_CONFIG.bypassPasswordPrefix}.${code}`, password);
}

export function clearBypassPassword(code: string): void {
  safeStorage()?.removeItem(`${APP_CONFIG.bypassPasswordPrefix}.${code}`);
}
