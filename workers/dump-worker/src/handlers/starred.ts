import { Env, ClipboardMeta, StarredEntry } from "../types";
import { getMeta, setMeta, getStarred, setStarred } from "../utils/kv";
import { isExpired, ttlSeconds } from "../utils/expiry";

function createError(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

async function handleDropOldest(env: Env, newStarred: string[]) {
  if (newStarred.length <= 5) return;
  const dropped = newStarred.pop();
  if (!dropped) return;
  
  const droppedMeta = await getMeta<ClipboardMeta>(env, dropped);
  if (droppedMeta && !isExpired(droppedMeta)) {
    droppedMeta.isStarred = false;
    await setMeta(env, dropped, droppedMeta, ttlSeconds(droppedMeta.expiresAt) ?? null);
  }
}

export async function handleStar(_request: Request, env: Env, codeParam: string): Promise<Response> {
  const code = codeParam.toLowerCase();
  const meta = await getMeta<ClipboardMeta>(env, code);
  
  if (!meta || isExpired(meta)) {
    return createError("Clipboard not found or expired", 404);
  }

  if (meta.mode !== "public") {
    return createError("Only public clipboards can be starred", 400);
  }

  if (meta.isStarred) {
    return new Response(JSON.stringify({ success: true, isStarred: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  const starred = await getStarred(env);
  if (!starred.includes(code)) {
    const newStarred = [code, ...starred];
    await handleDropOldest(env, newStarred);
    await setStarred(env, newStarred);
  }

  meta.isStarred = true;
  await setMeta(env, code, meta, ttlSeconds(meta.expiresAt) ?? null);

  return new Response(JSON.stringify({ success: true, isStarred: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

export async function handleUnstar(_request: Request, env: Env, codeParam: string): Promise<Response> {
  const code = codeParam.toLowerCase();
  const meta = await getMeta<ClipboardMeta>(env, code);

  if (!meta || isExpired(meta)) {
    return createError("Clipboard not found or expired", 404);
  }

  const starred = await getStarred(env);
  if (starred.includes(code)) {
    const filtered = starred.filter(c => c !== code);
    await setStarred(env, filtered);
  }

  if (meta.isStarred) {
    meta.isStarred = false;
    await setMeta(env, code, meta, ttlSeconds(meta.expiresAt) ?? null);
  }

  return new Response(JSON.stringify({ success: true, isStarred: false }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

export async function handleGetStarred(_request: Request, env: Env): Promise<Response> {
  const starredCodes = await getStarred(env);
  const result: StarredEntry[] = [];
  const validCodes: string[] = [];

  for (const code of starredCodes) {
    const meta = await getMeta<ClipboardMeta>(env, code);
    if (meta && !isExpired(meta)) {
      validCodes.push(code);
      result.push({
        code: meta.code,
        createdAt: meta.createdAt,
        expiresAt: meta.expiresAt,
        isOneTimeView: meta.isOneTimeView
      });
    }
  }

  if (validCodes.length !== starredCodes.length) {
    await setStarred(env, validCodes);
  }

  return new Response(JSON.stringify({ starred: result }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
