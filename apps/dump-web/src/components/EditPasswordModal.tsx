import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";

interface Props {
  action: "edit" | "delete";
  busy?: boolean;
  error?: string | null;
  onSubmit: (password: string) => void;
  onCancel: () => void;
}

export function EditPasswordModal({
  action,
  busy = false,
  error = null,
  onSubmit,
  onCancel,
}: Props): React.JSX.Element {
  const [password, setPassword] = useState<string>("");
  const [showPw, setShowPw] = useState<boolean>(false);

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    if (!password.trim()) return;
    onSubmit(password);
  }

  const isDelete = action === "delete";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-sm rounded-xl border border-[var(--border-color)] bg-[var(--surface-raised)] p-5 shadow-xl"
      >
        <div className="mb-3 flex items-center gap-3">
          <div
            className={`grid h-9 w-9 place-items-center rounded-full ${
              isDelete
                ? "bg-[var(--danger)]/15 text-[var(--danger)]"
                : "bg-[var(--accent)]/15 text-[var(--accent)]"
            }`}
          >
            <KeyRound className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Edit password required
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {isDelete
                ? "Enter edit password to delete this clipboard."
                : "Enter edit password to edit this clipboard."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              name="dump-noautofill-modal-pwd"
              autoComplete="new-password"
              data-lpignore="true"
              data-1p-ignore="true"
              data-bwignore="true"
              data-form-type="other"
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter edit password…"
              autoFocus
              className={`w-full rounded-md border bg-[var(--surface)] px-3 py-2 pr-10 font-mono text-sm text-[var(--text-primary)] focus:outline-none transition-colors ${
                error
                  ? "border-[var(--danger)] focus:border-[var(--danger)]"
                  : "border-[var(--border-color)] focus:border-[var(--accent)]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute inset-y-0 right-2 grid place-items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && <p className="text-xs text-[var(--danger)]">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={busy || !password.trim()}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer ${
                isDelete
                  ? "bg-[var(--danger)] text-[#0a0a0a] hover:opacity-90"
                  : "bg-[var(--accent)] text-[#0a0a0a] hover:bg-[var(--accent-hover)]"
              }`}
            >
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isDelete ? "Confirm Delete" : "Unlock & Edit"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="rounded-md border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
