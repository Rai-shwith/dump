export function getOwnerToken(code: string): string | null {
  return localStorage.getItem(`ownerTokens.${code}`);
}

export function setOwnerToken(code: string, token: string): void {
  localStorage.setItem(`ownerTokens.${code}`, token);
}

export function removeOwnerToken(code: string): void {
  localStorage.removeItem(`ownerTokens.${code}`);
}
