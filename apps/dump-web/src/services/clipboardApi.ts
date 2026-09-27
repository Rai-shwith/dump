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

interface RequestAuthOptions {
  token?: string;
  password?: string;
  viewPassword?: string;
  editPassword?: string;
}

function buildHeaders(auth: RequestAuthOptions = {}): HeadersInit {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth.token) headers["X-Owner-Token"] = auth.token;
  if (auth.password) headers["X-Clipboard-Password"] = auth.password;
  if (auth.viewPassword) headers["X-Clipboard-View-Password"] = auth.viewPassword;
  if (auth.editPassword) headers["X-Clipboard-Edit-Password"] = auth.editPassword;
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
  init: RequestInit & RequestAuthOptions = {},
): Promise<{ status: number; data: T }> {
  const { token, password, viewPassword, editPassword, headers, ...rest } = init;
  const res = await fetch(`${APP_CONFIG.apiBaseUrl}${path}`, {
    ...rest,
    headers: {
      ...buildHeaders({ token, password, viewPassword, editPassword }),
      ...(headers ?? {}),
    },
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
    viewPassword: password,
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
    editPassword: password,
  });
  return data;
}

export async function deleteClipboard(
  code: string,
  token?: string,
  password?: string,
): Promise<void> {
  await request<void>(`/clipboard/${code}`, {
    method: "DELETE",
    token,
    password,
    editPassword: password,
  });
}

export async function verifyEditPassword(code: string, password: string): Promise<boolean> {
  try {
    await request<{ valid: boolean }>(`/clipboard/${code}/verify`, {
      method: "POST",
      editPassword: password,
      password,
    });
    return true;
  } catch {
    return false;
  }
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

export async function checkClipboardExists(code: string): Promise<boolean> {
  try {
    const res = await fetch(`${APP_CONFIG.apiBaseUrl}/clipboard/${encodeURIComponent(code)}`, {
      method: "HEAD",
    });
    return res.status === 200;
  } catch {
    return false;
  }
}
