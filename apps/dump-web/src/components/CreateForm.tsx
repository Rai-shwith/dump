import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, RefreshCw, Star } from "lucide-react";
import { toast } from "sonner";
import { APP_CONFIG } from "@/config/app.config";
import { createClipboard, starClipboard } from "@/services/clipboardApi";
import { generateCode } from "@/utils/codegen";
import { saveBypassPassword, saveOwnerToken } from "@/utils/tokens";
import { presetToISO, toUTC } from "@/utils/time";
import { validateCode } from "@/utils/validate";
import type {
  ClipboardMode,
  CreateClipboardPayload,
  CreateClipboardResponse,
  ExpiryPreset,
} from "@/types";
import { ExpirySelector } from "./ExpirySelector";
import { ProtectedPasswordInputs } from "./ProtectedPasswordInputs";

interface Props {
  onCreated: (res: CreateClipboardResponse) => void;
}

export function CreateForm({ onCreated }: Props): React.JSX.Element {
  const [code, setCode] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [mode, setMode] = useState<ClipboardMode>("public");
  const [requireViewPw, setRequireViewPw] = useState<boolean>(true);
  const [viewPassword, setViewPassword] = useState<string>("");
  const [requireEditPw, setRequireEditPw] = useState<boolean>(false);
  const [editPassword, setEditPassword] = useState<string>("");
  const [bypass, setBypass] = useState<boolean>(false);
  const [expiry, setExpiry] = useState<ExpiryPreset>("1h");
  const [customDt, setCustomDt] = useState<string>("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isStarred, setIsStarred] = useState<boolean>(false);

  useEffect(() => {
    setCode(generateCode());
  }, []);

  useEffect(() => {
    if (mode === "protected" && expiry === "infinite") setExpiry("1d");
    if (expiry === "otv") setIsStarred(false);
  }, [mode, expiry]);

  function regenCode(): void {
    setCode(generateCode());
    setCodeError(null);
  }

  function handleCodeChange(v: string): void {
    const lower = v.toLowerCase();
    setCode(lower);
    setCodeError(lower ? validateCode(lower) : null);
  }

  function validateForm(): boolean {
    const err = validateCode(code);
    if (err) {
      setCodeError(err);
      return false;
    }
    if (!content.trim()) {
      toast.error("Content is required");
      return false;
    }
    if (mode === "protected") {
      if (!requireViewPw && !requireEditPw) {
        toast.error("Please enable at least one password (view or edit)");
        return false;
      }
      if (requireViewPw && !viewPassword.trim()) {
        toast.error("View password is required");
        return false;
      }
      if (requireEditPw && !editPassword.trim()) {
        toast.error("Edit password is required");
        return false;
      }
    }
    if (new Blob([content]).size > APP_CONFIG.contentMaxBytes) {
      toast.error("Content exceeds 256KB");
      return false;
    }
    return true;
  }

  function resolveExpiresAt(): string | null | undefined {
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

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!validateForm()) return;

    const isOTV = expiry === "otv";
    const expiresAt = resolveExpiresAt();
    if (expiresAt === undefined) return;

    if (mode === "protected" && !isOTV && !expiresAt) {
      toast.error("Protected clipboards require an expiration");
      return;
    }

    const payload: CreateClipboardPayload = {
      code,
      content,
      mode,
      viewPassword: mode === "protected" && requireViewPw ? viewPassword : null,
      editPassword: mode === "protected" && requireEditPw ? editPassword : null,
      expiresAt,
      isOneTimeView: isOTV,
      expiryPreset: expiry,
    };

    setSubmitting(true);
    try {
      const res = await createClipboard(payload);
      if (mode === "public" || bypass) {
        saveOwnerToken(res.code, res.ownerToken);
      }
      if (mode === "protected" && bypass) {
        const pwToSave = (requireViewPw ? viewPassword : "") || (requireEditPw ? editPassword : "");
        if (pwToSave) saveBypassPassword(res.code, pwToSave);
      }
      if (isStarred && !isOTV) {
        try {
          await starClipboard(res.code);
          window.dispatchEvent(new Event("refresh-starred"));
        } catch {
          toast.error("Clipboard created, but failed to star globally");
        }
      }
      onCreated(res);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-raised)] p-5 shadow-sm"
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            Custom code
          </label>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              onFocus={(e) => e.target.select()}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              className="flex-1 rounded-md border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 font-mono text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
            />
            <button
              type="button"
              onClick={regenCode}
              aria-label="Regenerate code"
              className="grid h-9 w-9 place-items-center rounded-md border border-[var(--border-color)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          {codeError && <p className="mt-1 text-xs text-[var(--danger)]">{codeError}</p>}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste or type anything…"
            rows={5}
            style={{ minHeight: 120 }}
            className="w-full resize-y rounded-md border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 font-mono text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            Visibility
          </label>
          <div className="grid grid-cols-2 gap-1 rounded-md border border-[var(--border-color)] bg-[var(--surface)] p-1">
            {(["public", "protected"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                  mode === m
                    ? "bg-[var(--accent)] text-[#0a0a0a]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {m === "public" ? "Public" : "Protected"}
              </button>
            ))}
          </div>
        </div>

        {expiry !== "otv" && (
          <button
            type="button"
            onClick={() => setIsStarred(!isStarred)}
            className={`flex w-max items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
              isStarred
                ? "border-[var(--accent)] bg-[var(--accent)] text-[#0a0a0a]"
                : "border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            }`}
          >
            <Star className={`h-4 w-4 ${isStarred ? "fill-current" : ""}`} />
            {isStarred ? "Starred globally" : "Star globally"}
          </button>
        )}

        {mode === "protected" && (
          <ProtectedPasswordInputs
            requireViewPw={requireViewPw}
            setRequireViewPw={setRequireViewPw}
            viewPassword={viewPassword}
            setViewPassword={setViewPassword}
            requireEditPw={requireEditPw}
            setRequireEditPw={setRequireEditPw}
            editPassword={editPassword}
            setEditPassword={setEditPassword}
            bypass={bypass}
            setBypass={setBypass}
          />
        )}

        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            Expires
          </label>
          <ExpirySelector
            value={expiry}
            onChange={setExpiry}
            mode={mode}
            customDatetime={customDt}
            onCustomChange={setCustomDt}
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !!codeError}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#0a0a0a] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Creating…" : "Create Clipboard"}
        </button>
      </div>
    </motion.form>
  );
}
