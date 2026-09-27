import { useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Props {
  onUnlock: (password: string, remember: boolean) => Promise<boolean>;
}

export function PasswordGate({ onUnlock }: Props): React.JSX.Element {
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [shake, setShake] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!password) return;
    setSubmitting(true);
    setError(null);
    const ok = await onUnlock(password, remember);
    setSubmitting(false);
    if (!ok) {
      setError("Incorrect password");
      setShake((s) => s + 1);
    }
  }

  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <motion.form
        key={shake}
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={
          shake > 0
            ? { opacity: 1, scale: 1, x: [0, -10, 10, -10, 10, 0] }
            : { opacity: 1, scale: 1 }
        }
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-sm rounded-xl border border-[var(--border-color)] bg-[var(--surface-raised)] p-6 shadow-sm"
      >
        <div className="mb-4 grid h-10 w-10 place-items-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
          <Lock className="h-5 w-5" />
        </div>
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Password required</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Enter the password to view this clipboard.
        </p>

        <input
          type="password"
          name="dump-noautofill-gate-pwd"
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
          autoFocus
          placeholder="Enter password…"
          className="mt-4 w-full rounded-md border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
        />

        <div className="mt-3 flex items-center justify-between rounded-lg border border-[var(--border-color)]/60 bg-[var(--surface)] px-3 py-2">
          <span className="text-xs text-[var(--text-secondary)]">Remember on this device</span>
          <Switch checked={remember} onCheckedChange={setRemember} />
        </div>

        {error && <p className="mt-2 text-xs text-[var(--danger)]">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !password}
          className="mt-4 w-full rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#0a0a0a] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {submitting ? "Unlocking…" : "Unlock"}
        </button>
      </motion.form>
    </div>
  );
}
