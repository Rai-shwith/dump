import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useStarred } from "@/hooks/useStarred";
import { formatExpiry } from "@/utils/time";

export function StarredStrip(): React.JSX.Element {
  const { items } = useStarred();

  return (
    <section>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
        Starred
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {items === null && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        {items?.length === 0 && (
          <p className="text-sm text-[var(--text-muted)]">No starred clipboards yet.</p>
        )}
        {items?.map((s) => (
          <motion.div key={s.code} whileHover={{ y: -4, scale: 1.02 }} className="shrink-0">
            <Link
              to={`/${s.code}`}
              className="block w-56 rounded-lg border border-[var(--border-color)] bg-[var(--surface-raised)] p-3 transition-colors hover:border-[var(--accent)]"
            >
              <div className="font-mono text-sm font-semibold text-[var(--text-primary)]">
                {s.code}
              </div>
              <div className="mt-2 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
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
    <div className="h-20 w-56 shrink-0 animate-pulse rounded-lg border border-[var(--border-color)] bg-[var(--surface-raised)]" />
  );
}
