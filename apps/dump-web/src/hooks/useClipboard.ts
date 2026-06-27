import { useCallback, useEffect, useState } from "react";
import { ApiError, readClipboard } from "@/services/clipboardApi";
import { getBypassPassword, getOwnerToken } from "@/utils/tokens";
import type { ClipboardData, LockedResponse } from "@/types";

export type ClipboardState =
  | { status: "loading" }
  | { status: "ok"; data: ClipboardData }
  | { status: "locked"; locked: LockedResponse }
  | { status: "not-found" }
  | { status: "error"; message: string };

export function useClipboard(code: string): {
  state: ClipboardState;
  unlock: (password: string, remember: boolean) => Promise<boolean>;
  refresh: () => void;
  setData: (data: ClipboardData) => void;
} {
  const [state, setState] = useState<ClipboardState>({ status: "loading" });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    const token = getOwnerToken(code) ?? undefined;
    const password = getBypassPassword(code) ?? undefined;
    readClipboard(code, token, password)
      .then((res) => {
        if (cancelled) return;
        if ("locked" in res) setState({ status: "locked", locked: res });
        else setState({ status: "ok", data: res });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setState({ status: "not-found" });
        } else {
          const message = err instanceof Error ? err.message : "Failed to load";
          setState({ status: "error", message });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [code, tick]);

  const unlock = useCallback(
    async (password: string, remember: boolean): Promise<boolean> => {
      try {
        const res = await readClipboard(code, undefined, password);
        if ("locked" in res) return false;
        if (remember) {
          const { saveBypassPassword } = await import("@/utils/tokens");
          saveBypassPassword(code, password);
        }
        setState({ status: "ok", data: res });
        return true;
      } catch {
        return false;
      }
    },
    [code],
  );

  const refresh = useCallback(() => setTick((t) => t + 1), []);
  const setData = useCallback((data: ClipboardData) => setState({ status: "ok", data }), []);

  return { state, unlock, refresh, setData };
}
