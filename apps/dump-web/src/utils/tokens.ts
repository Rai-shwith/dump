export function getOwnerToken(code: string): string | null {
  return localStorage.getItem(`ownerTokens.${code}`);
}

export function setOwnerToken(code: string, token: string): void {
  localStorage.setItem(`ownerTokens.${code}`, token);
}

export function removeOwnerToken(code: string): void {
  localStorage.removeItem(`ownerTokens.${code}`);
}

export function getOwnerPassword(code: string): string | null {
  return localStorage.getItem(`ownerPasswords.${code}`);
}

export function setOwnerPassword(code: string, password: string): void {
  localStorage.setItem(`ownerPasswords.${code}`, password);
}

export function removeOwnerPassword(code: string): void {
  localStorage.removeItem(`ownerPasswords.${code}`);
}
