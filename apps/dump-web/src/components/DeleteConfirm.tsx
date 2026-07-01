import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
  busy: boolean;
}

export function DeleteConfirm({ onConfirm, onCancel, busy }: Props): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="mb-4 overflow-hidden rounded-lg border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-4"
    >
      <p className="text-sm text-[var(--text-primary)]">Are you sure? This cannot be undone.</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="flex items-center gap-2 rounded-md bg-[var(--danger)] px-3 py-1.5 text-sm font-semibold text-[#0a0a0a] hover:opacity-90 disabled:opacity-50 cursor-pointer"
        >
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Delete
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-md border border-[var(--border-color)] bg-[var(--surface)] px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] disabled:opacity-50 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}
