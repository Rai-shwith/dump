import { useCallback, useEffect, useState } from "react";
import { getStarred } from "@/services/clipboardApi";
import type { StarredClipboard } from "@/types";

export function useStarred(): {
  items: StarredClipboard[] | null;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const [items, setItems] = useState<StarredClipboard[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await getStarred();
      setItems(data);
      setError(null);
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : "Failed to load starred");
    }
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("refresh-starred", refresh);
    return () => {
      window.removeEventListener("refresh-starred", refresh);
    };
  }, [refresh]);

  return { items, error, refresh };
}
