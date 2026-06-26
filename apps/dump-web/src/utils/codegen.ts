const CHARSET = "abcdefghijklmnopqrstuvwxyz0123456789";

export function generateCode(length = 8): string {
  const values = new Uint8Array(length);
  crypto.getRandomValues(values);
  return Array.from(values)
    .map((v) => CHARSET[v % CHARSET.length])
    .join("");
}
