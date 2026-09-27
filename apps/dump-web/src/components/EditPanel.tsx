import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateClipboard } from "@/services/clipboardApi";
import { getBypassPassword, getOwnerToken } from "@/utils/tokens";
import {
  detectExpiryPreset,
  formatExpiry,
  presetToISO,
  toLocalDatetimeInput,
  toUTC,
} from "@/utils/time";
import type { ClipboardData, ExpiryPreset, UpdateClipboardPayload } from "@/types";
import { ExpirySelector } from "./ExpirySelector";
import { EditPasswordSection } from "./EditPasswordSection";

interface Props {
  data: ClipboardData;
  editPassword?: string;
  onSaved: (updated: ClipboardData) => void;
  onCancel: () => void;
}

export function EditPanel({
  data,
  editPassword: editPasswordProp,
  onSaved,
  onCancel,
}: Props): React.JSX.Element {
  const [content, setContent] = useState<string>(data.content);
  const [expiry, setExpiry] = useState<ExpiryPreset>(() => detectExpiryPreset(data));
  const [expiryChanged, setExpiryChanged] = useState<boolean>(false);
  const [customDt, setCustomDt] = useState<string>(() => toLocalDatetimeInput(data.expiresAt));

  const [requireViewPw, setRequireViewPw] = useState<boolean>(Boolean(data.hasViewPassword));
  const [viewPassword, setViewPassword] = useState<string>("");

  const [requireEditPw, setRequireEditPw] = useState<boolean>(Boolean(data.hasEditPassword));
  const [editPassword, setEditPassword] = useState<string>("");

  const [saving, setSaving] = useState<boolean>(false);

  function handleExpiryChange(newPreset: ExpiryPreset): void {
    setExpiry(newPreset);
    setExpiryChanged(true);
  }

  function handleCustomChange(newDt: string): void {
    setCustomDt(newDt);
    setExpiryChanged(true);
  }

  function validatePasswords(): boolean {
    if (data.mode !== "protected") return true;
    if (!requireViewPw && !requireEditPw) {
      toast.error("Protected clipboards require at least one password (view or edit)");
      return false;
    }
    if (requireViewPw && !data.hasViewPassword && !viewPassword.trim()) {
      toast.error("Please enter a view password");
      return false;
    }
    if (requireEditPw && !data.hasEditPassword && !editPassword.trim()) {
      toast.error("Please enter an edit password");
      return false;
    }
    return true;
  }

  function resolveExpiry(): string | null | undefined {
    if (!expiryChanged) return data.expiresAt;
    if (expiry === "otv" || expiry === "infinite") return null;
    if (expiry === "custom") {
      if (!customDt) {
        toast.error("Pick a custom date and time");
        return undefined;
      }
      return toUTC(customDt);
    }
    return presetToISO(expiry);
  }

  async function save(): Promise<void> {
    if (!validatePasswords()) return;

    const token = getOwnerToken(data.code) ?? undefined;
    const effectiveAuth = (editPasswordProp || getBypassPassword(data.code)) ?? undefined;
    const isOTV = expiryChanged ? expiry === "otv" : data.isOneTimeView;
    const expiresAt = resolveExpiry();
    if (expiresAt === undefined) return;

    const payload: UpdateClipboardPayload = { content };
    if (expiryChanged) {
      payload.expiresAt = expiresAt;
      payload.isOneTimeView = isOTV;
      payload.expiryPreset = expiry;
    }

    if (data.mode === "protected") {
      if (!requireViewPw && data.hasViewPassword) {
        payload.viewPassword = null;
      } else if (requireViewPw && viewPassword.trim()) {
        payload.viewPassword = viewPassword.trim();
      }

      if (!requireEditPw && data.hasEditPassword) {
        payload.editPassword = null;
      } else if (requireEditPw && editPassword.trim()) {
        payload.editPassword = editPassword.trim();
      }
    }

    setSaving(true);
    try {
      const res = await updateClipboard(data.code, payload, token, effectiveAuth);
      toast.success("Changes saved!");
      onSaved({
        ...data,
        content,
        expiresAt,
        isOneTimeView: isOTV,
        hasViewPassword: res.hasViewPassword ?? requireViewPw,
        hasEditPassword: res.hasEditPassword ?? requireEditPw,
        expiryPreset: expiryChanged ? expiry : data.expiryPreset,
      });
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
      className="mb-4 rounded-lg border border-[var(--border-color)] bg-[var(--surface-raised)] p-4"
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
            Expiration
          </label>
          <ExpirySelector
            value={expiry}
            onChange={handleExpiryChange}
            mode={data.mode}
            customDatetime={customDt}
            onCustomChange={handleCustomChange}
            subtitle={
              expiryChanged
                ? "New expiry will be set on save"
                : `Current: ${formatExpiry(data.expiresAt, data.isOneTimeView)} (original)`
            }
          />
        </div>

        {data.mode === "protected" && (
          <EditPasswordSection
            hasExistingViewPw={Boolean(data.hasViewPassword)}
            requireViewPw={requireViewPw}
            setRequireViewPw={setRequireViewPw}
            viewPassword={viewPassword}
            setViewPassword={setViewPassword}
            hasExistingEditPw={Boolean(data.hasEditPassword)}
            requireEditPw={requireEditPw}
            setRequireEditPw={setRequireEditPw}
            editPassword={editPassword}
            setEditPassword={setEditPassword}
          />
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
