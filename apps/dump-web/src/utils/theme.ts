import { APP_CONFIG } from "@/config/app.config";
import type { Theme } from "@/types";

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return APP_CONFIG.defaultTheme;
  try {
    const stored = window.localStorage.getItem(APP_CONFIG.themeStorageKey);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // ignore
  }
  return APP_CONFIG.defaultTheme;
}

export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    window.localStorage.setItem(APP_CONFIG.themeStorageKey, theme);
  } catch {
    // ignore
  }
}
