export function formatLocalTime(utcString: string | null): string {
  if (!utcString) return "Never";
  return new Date(utcString).toLocaleString();
}

export function toUTCString(localDateTimeString: string): string {
  return new Date(localDateTimeString).toISOString();
}

export function addMilliseconds(ms: number): string {
  return new Date(Date.now() + ms).toISOString();
}
