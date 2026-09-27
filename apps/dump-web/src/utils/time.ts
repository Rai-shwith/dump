import type { ExpiryPreset } from "@/types";

export function toUTC(localDatetime: string): string {
  return new Date(localDatetime).toISOString();
}

export function formatExpiry(expiresAt: string | null, isOneTimeView: boolean): string {
  if (isOneTimeView) return "One-time view";
  if (!expiresAt) return "Permanent";
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `Expires in ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Expires in ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Expires in ${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Expires in ${months}mo`;
  return `Expires in ${Math.floor(months / 12)}y`;
}

export function presetToISO(preset: string): string | null {
  const now = Date.now();
  const map: Record<string, number> = {
    "1m": 60_000,
    "5m": 5 * 60_000,
    "15m": 15 * 60_000,
    "1h": 60 * 60_000,
    "1d": 24 * 60 * 60_000,
    "1w": 7 * 24 * 60 * 60_000,
    "1mo": 30 * 24 * 60 * 60_000,
    "1y": 365 * 24 * 60 * 60_000,
  };
  if (preset in map) return new Date(now + map[preset]).toISOString();
  return null;
}

export function toLocalDatetimeInput(isoString: string | null): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${y}-${m}-${d}T${h}:${min}`;
}

export function detectExpiryPreset(data: {
  expiryPreset?: ExpiryPreset | null;
  isOneTimeView: boolean;
  expiresAt: string | null;
  createdAt?: string;
}): ExpiryPreset {
  if (data.expiryPreset) return data.expiryPreset;
  if (data.isOneTimeView) return "otv";
  if (!data.expiresAt) return "infinite";

  if (data.createdAt) {
    const diff = new Date(data.expiresAt).getTime() - new Date(data.createdAt).getTime();
    const within = (target: number, tolerance = 30_000) => Math.abs(diff - target) <= tolerance;
    if (within(60_000)) return "1m";
    if (within(5 * 60_000)) return "5m";
    if (within(15 * 60_000)) return "15m";
    if (within(60 * 60_000)) return "1h";
    if (within(24 * 60 * 60_000, 60_000)) return "1d";
    if (within(7 * 24 * 60 * 60_000, 60_000)) return "1w";
    if (within(30 * 24 * 60 * 60_000, 120_000)) return "1mo";
    if (within(365 * 24 * 60 * 60_000, 120_000)) return "1y";
  }
  return "custom";
}
