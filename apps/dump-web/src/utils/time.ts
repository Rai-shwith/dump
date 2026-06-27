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
