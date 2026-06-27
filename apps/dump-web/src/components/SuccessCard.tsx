import { motion } from "framer-motion";
import { Check, Copy, Plus } from "lucide-react";
import { toast } from "sonner";
import type { CreateClipboardResponse } from "@/types";

interface Props {
  result: CreateClipboardResponse;
  onCreateAnother: () => void;
}

export function SuccessCard({ result, onCreateAnother }: Props): React.JSX.Element {
  const url =
    typeof window !== "undefined" ? `${window.location.origin}/${result.code}` : `/${result.code}`;

  async function copyUrl(): Promise<void> {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    } catch {
      toast.error("Couldn't copy link");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border border-[var(--accent)]/30 bg-[var(--surface-raised)] p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 text-[var(--success)]">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-[var(--success)]/15">
          <Check className="h-4 w-4" />
        </div>
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Clipboard created!</h2>
      </div>

      <a
        href={url}
        className="mt-4 block break-all rounded-md border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 font-mono text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
      >
        {url}
      </a>

      {result.isOneTimeView && (
        <p className="mt-3 text-xs text-[var(--warning)]">
          One-time view — opening the link will permanently delete this clipboard.
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={copyUrl}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-[#0a0a0a] hover:bg-[var(--accent-hover)] transition-colors cursor-pointer"
        >
          <Copy className="h-4 w-4" /> Copy Link
        </button>
        <button
          type="button"
          onClick={onCreateAnother}
          className="flex items-center justify-center gap-2 rounded-md border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Create Another
        </button>
      </div>
    </motion.div>
  );
}
