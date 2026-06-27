import { APP_CONFIG } from "@/config/app.config";
import type {
  ClipboardData,
  CreateClipboardPayload,
  CreateClipboardResponse,
  GetStarredResponse,
  LockedResponse,
  StarredClipboard,
  UpdateClipboardPayload,
  UpdateClipboardResponse,
} from "@/types";

function buildHeaders(token?: string, password?: string): HeadersInit {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["X-Owner-Token"] = token;
  if (password) headers["X-Clipboard-Password"] = password;
  return headers;
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string };
    return body.error ?? `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  init: RequestInit & { token?: string; password?: string } = {},
): Promise<{ status: number; data: T }> {
  const { token, password, headers, ...rest } = init;
  const res = await fetch(`${APP_CONFIG.apiBaseUrl}${path}`, {
    ...rest,
    headers: { ...buildHeaders(token, password), ...(headers ?? {}) },
  });
  if (!res.ok) {
    throw new ApiError(await parseError(res), res.status);
  }
  const data = res.status === 204 ? (undefined as T) : ((await res.json()) as T);
  return { status: res.status, data };
}

export async function createClipboard(
  payload: CreateClipboardPayload,
): Promise<CreateClipboardResponse> {
  const { data } = await request<CreateClipboardResponse>("/clipboard", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data;
}

export async function readClipboard(
  code: string,
  token?: string,
  password?: string,
): Promise<ClipboardData | LockedResponse> {
  const { data } = await request<ClipboardData | LockedResponse>(`/clipboard/${code}`, {
    method: "GET",
    token,
    password,
  });
  return data;
}

export async function updateClipboard(
  code: string,
  payload: UpdateClipboardPayload,
  token?: string,
  password?: string,
): Promise<UpdateClipboardResponse> {
  const { data } = await request<UpdateClipboardResponse>(`/clipboard/${code}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    token,
    password,
  });
  return data;
}

export async function deleteClipboard(
  code: string,
  token?: string,
  password?: string,
): Promise<void> {
  await request<void>(`/clipboard/${code}`, { method: "DELETE", token, password });
}

export async function starClipboard(code: string): Promise<void> {
  await request<void>(`/clipboard/${code}/star`, { method: "POST" });
}

export async function unstarClipboard(code: string): Promise<void> {
  await request<void>(`/clipboard/${code}/star`, { method: "DELETE" });
}

export async function getStarred(): Promise<StarredClipboard[]> {
  const { data } = await request<GetStarredResponse>("/starred", { method: "GET" });
  return data.starred;
}
