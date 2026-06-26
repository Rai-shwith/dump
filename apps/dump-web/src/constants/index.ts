export const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8787/api";

export const EXPIRY_PRESETS = [
  { label: "1 minute",  ms: 60 * 1000 },
  { label: "5 minutes", ms: 5 * 60 * 1000 },
  { label: "15 minutes", ms: 15 * 60 * 1000 },
  { label: "1 hour",    ms: 60 * 60 * 1000 },
  { label: "1 day",     ms: 24 * 60 * 60 * 1000 },
  { label: "1 week",    ms: 7 * 24 * 60 * 60 * 1000 },
  { label: "1 month",   ms: 30 * 24 * 60 * 60 * 1000 },
  { label: "1 year",    ms: 365 * 24 * 60 * 60 * 1000 },
] as const;

export const MAX_CONTENT_BYTES = 262144;
export const MIN_CODE_LENGTH = 4;
export const DEFAULT_CODE_LENGTH = 8;
