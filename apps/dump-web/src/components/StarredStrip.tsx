import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useStarred } from "@/hooks/useStarred";
import { formatExpiry } from "@/utils/time";

export function StarredStrip(): React.JSX.Element {
  const { items, refresh } = useStarred();
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Starred
        </h2>
        <button
          onClick={handleRefresh}
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          aria-label="Refresh starred clipboards"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items === null && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        {items?.length === 0 && (
          <p className="text-sm text-[var(--text-muted)] col-span-full">
            No starred clipboards yet.
          </p>
        )}
        {items?.map((s) => (
          <motion.div key={s.code} whileHover={{ y: -4, scale: 1.02 }}>
            <Link
              to={`/${s.code}`}
              className="block w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface-raised)] p-3 transition-colors hover:border-[var(--accent)]"
            >
              <div className="font-mono text-sm font-semibold text-[var(--text-primary)] truncate">
                {s.code}
              </div>
              <div className="mt-2 text-[10px] uppercase tracking-wider text-[var(--text-muted)] truncate">
                {formatExpiry(s.expiresAt, s.isOneTimeView)}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function SkeletonCard(): React.JSX.Element {
  return (
    <div className="h-20 w-full animate-pulse rounded-lg border border-[var(--border-color)] bg-[var(--surface-raised)]" />
  );
}
