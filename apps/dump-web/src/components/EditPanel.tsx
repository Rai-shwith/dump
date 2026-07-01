import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateClipboard } from "@/services/clipboardApi";
import { getBypassPassword, getOwnerToken } from "@/utils/tokens";
import { presetToISO, toUTC } from "@/utils/time";
import type { ClipboardData, ExpiryPreset, PasswordMode, UpdateClipboardPayload } from "@/types";
import { ExpirySelector } from "./ExpirySelector";

interface Props {
  data: ClipboardData;
  onSaved: (updated: ClipboardData) => void;
  onCancel: () => void;
}

export function EditPanel({ data, onSaved, onCancel }: Props): React.JSX.Element {
  const [content, setContent] = useState<string>(data.content);
  const [expiry, setExpiry] = useState<ExpiryPreset>(data.isOneTimeView ? "otv" : "1d");
  const [customDt, setCustomDt] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPw, setShowPw] = useState<boolean>(false);
  const [passwordMode, setPasswordMode] = useState<PasswordMode>(data.passwordMode ?? "view");
  const [saving, setSaving] = useState<boolean>(false);

  async function save(): Promise<void> {
    const token = getOwnerToken(data.code) ?? undefined;
    const bypass = getBypassPassword(data.code) ?? undefined;

    const isOTV = expiry === "otv";
    let expiresAt: string | null = null;
    if (!isOTV) {
      if (expiry === "infinite") expiresAt = null;
      else if (expiry === "custom") {
        if (!customDt) {
          toast.error("Pick a custom date and time");
          return;
        }
        expiresAt = toUTC(customDt);
      } else {
        expiresAt = presetToISO(expiry);
      }
    }

    const payload: UpdateClipboardPayload = {
      content,
      expiresAt,
      isOneTimeView: isOTV,
    };
    if (data.mode === "protected" && password) {
      payload.password = password;
      payload.passwordMode = passwordMode;
    }

    setSaving(true);
    try {
      await updateClipboard(data.code, payload, token, bypass);
      toast.success("Changes saved!");
      onSaved({ ...data, content, expiresAt, isOneTimeView: isOTV, passwordMode });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="mb-4 overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--surface-raised)] p-4"
    >
      <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Edit clipboard</h3>
      <div className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full resize-y rounded-md border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 font-mono text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
        />
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            New expiry
          </label>
          <ExpirySelector
            value={expiry}
            onChange={setExpiry}
            mode={data.mode}
            customDatetime={customDt}
            onCustomChange={setCustomDt}
          />
        </div>
        {data.mode === "protected" && (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-[var(--text-secondary)]">
              Change password (optional)
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 pr-10 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute inset-y-0 right-2 grid place-items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                aria-label="Toggle password"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1 rounded-md border border-[var(--border-color)] bg-[var(--surface)] p-1">
              {(["view", "edit"] as const).map((pm) => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => setPasswordMode(pm)}
                  className={`rounded px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    passwordMode === pm
                      ? "bg-[var(--accent)] text-[#0a0a0a]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {pm === "view" ? "View password" : "Edit password"}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-[#0a0a0a] hover:bg-[var(--accent-hover)] disabled:opacity-50 cursor-pointer"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-md border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
}
