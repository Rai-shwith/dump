import { useEffect, useState } from "react";
import { getStarred } from "@/services/clipboardApi";
import type { StarredClipboard } from "@/types";

export function useStarred(): { items: StarredClipboard[] | null; error: string | null } {
  const [items, setItems] = useState<StarredClipboard[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getStarred()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setItems([]);
          setError(err instanceof Error ? err.message : "Failed to load starred");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { items, error };
}
