import { APP_CONFIG } from "@/config/app.config";

const PATTERN = /^[a-z0-9\-_]+$/;

export function validateCode(code: string): string | null {
  if (!code) return "Code is required";
  if (code.length < APP_CONFIG.codeMinLength)
    return `Code must be at least ${APP_CONFIG.codeMinLength} characters`;
  if (!PATTERN.test(code)) return "Only lowercase letters, numbers, - and _ allowed";
  if ((APP_CONFIG.reservedKeywords as readonly string[]).includes(code))
    return "This code is reserved";
  return null;
}
