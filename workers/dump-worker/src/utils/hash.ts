/* global TextEncoder */
// SHA-256 hashing utilities — implemented in TASK-007

async function digestToHex(buffer: ArrayBuffer): Promise<string> {
  const hashArray = Array.from(new Uint8Array(buffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function hashPassword(password: string, pepper: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + pepper);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return digestToHex(hashBuffer);
}

export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return digestToHex(hashBuffer);
}
