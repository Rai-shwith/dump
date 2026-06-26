import { API_BASE } from "../constants";
import type {
  ClipboardContent, LockedResponse, CreateClipboardRequest,
  CreateClipboardResponse
} from "../types";

interface ReadHeaders {
  ownerToken?: string;
  password?: string;
}

export async function createClipboard(
  body: CreateClipboardRequest
): Promise<CreateClipboardResponse> {
  const res = await fetch(`${API_BASE}/clipboard`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json() as { error: string };
    throw new Error(err.error);
  }
  return res.json() as Promise<CreateClipboardResponse>;
}

export async function readClipboard(
  code: string,
  headers: ReadHeaders
): Promise<ClipboardContent | LockedResponse> {
  const reqHeaders: Record<string, string> = {};
  if (headers.ownerToken) reqHeaders["X-Owner-Token"] = headers.ownerToken;
  if (headers.password) reqHeaders["X-Clipboard-Password"] = headers.password;
  const res = await fetch(`${API_BASE}/clipboard/${code}`, { headers: reqHeaders });
  if (!res.ok) {
    const err = await res.json() as { error: string };
    throw new Error(err.error);
  }
  return res.json() as Promise<ClipboardContent | LockedResponse>;
}

export async function deleteClipboard(
  code: string,
  headers: ReadHeaders
): Promise<void> {
  const reqHeaders: Record<string, string> = {};
  if (headers.ownerToken) reqHeaders["X-Owner-Token"] = headers.ownerToken;
  if (headers.password) reqHeaders["X-Clipboard-Password"] = headers.password;
  const res = await fetch(`${API_BASE}/clipboard/${code}`, {
    method: "DELETE",
    headers: reqHeaders,
  });
  if (!res.ok) {
    const err = await res.json() as { error: string };
    throw new Error(err.error);
  }
}
