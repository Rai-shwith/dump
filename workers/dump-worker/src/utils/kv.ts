// KV helper utilities — implemented in TASK-002

export interface Env {
  CLIPBOARD_KV: KVNamespace;
}

export const META_KEY = (code: string): string => `clip:${code}:meta`;

export const CONTENT_KEY = (code: string): string => `clip:${code}:content`;

export const STARRED_KEY = "app:starred";

export const getMeta = async <T = unknown>(env: Env, code: string): Promise<T | null> => {
  try {
    return await env.CLIPBOARD_KV.get<T>(META_KEY(code), "json");
  } catch (error) {
    return null;
  }
};

export const getContent = async (env: Env, code: string): Promise<string | null> => {
  try {
    return await env.CLIPBOARD_KV.get(CONTENT_KEY(code), "text");
  } catch (error) {
    return null;
  }
};

export const setMeta = async (
  env: Env,
  code: string,
  metaObject: unknown,
  expirationTtl?: number | null
): Promise<void> => {
  try {
    const options: { expirationTtl?: number } = {};
    if (expirationTtl != null) {
      options.expirationTtl = expirationTtl;
    }
    await env.CLIPBOARD_KV.put(META_KEY(code), JSON.stringify(metaObject), options);
  } catch (error) {
    throw error;
  }
};

export const setContent = async (
  env: Env,
  code: string,
  contentString: string,
  expirationTtl?: number | null
): Promise<void> => {
  try {
    const options: { expirationTtl?: number } = {};
    if (expirationTtl != null) {
      options.expirationTtl = expirationTtl;
    }
    await env.CLIPBOARD_KV.put(CONTENT_KEY(code), contentString, options);
  } catch (error) {
    throw error;
  }
};

export const deleteMeta = async (env: Env, code: string): Promise<void> => {
  try {
    await env.CLIPBOARD_KV.delete(META_KEY(code));
  } catch (error) {
    throw error;
  }
};

export const deleteContent = async (env: Env, code: string): Promise<void> => {
  try {
    await env.CLIPBOARD_KV.delete(CONTENT_KEY(code));
  } catch (error) {
    throw error;
  }
};

export const deleteClipboard = async (env: Env, code: string): Promise<void> => {
  try {
    await deleteMeta(env, code);
    await deleteContent(env, code);
  } catch (error) {
    throw error;
  }
};

export const getStarred = async <T = string>(env: Env): Promise<T[]> => {
  try {
    const data = await env.CLIPBOARD_KV.get<T[]>(STARRED_KEY, "json");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
};

export const setStarred = async (env: Env, codesArray: string[]): Promise<void> => {
  try {
    await env.CLIPBOARD_KV.put(STARRED_KEY, JSON.stringify(codesArray));
  } catch (error) {
    throw error;
  }
};
