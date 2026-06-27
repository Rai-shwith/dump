import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

export function OtvBanner(): React.JSX.Element | null {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="mb-4 flex items-start gap-3 rounded-lg border border-[var(--warning)]/40 bg-[var(--warning)]/10 px-4 py-3 text-sm text-[var(--text-primary)]"
        role="alert"
      >
        <span className="text-base">⚠️</span>
        <p className="flex-1">This clipboard has been permanently deleted. It no longer exists.</p>
        <button
          type="button"
          onClick={() => setHidden(true)}
          aria-label="Dismiss"
          className="grid h-5 w-5 place-items-center rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
