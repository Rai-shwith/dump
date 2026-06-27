import { APP_CONFIG } from "@/config/app.config";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

export function generateCode(length: number = APP_CONFIG.codeDefaultLength): string {
  let out = "";
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint32Array(length);
    crypto.getRandomValues(buf);
    for (let i = 0; i < length; i++) out += ALPHABET[buf[i] % ALPHABET.length];
    return out;
  }
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}
