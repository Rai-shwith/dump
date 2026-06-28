import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, RefreshCw, Star } from "lucide-react";
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
  PasswordMode,
} from "@/types";
import { ExpirySelector } from "./ExpirySelector";

interface Props {
  onCreated: (res: CreateClipboardResponse) => void;
}

export function CreateForm({ onCreated }: Props): React.JSX.Element {
  const [code, setCode] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [mode, setMode] = useState<ClipboardMode>("public");
  const [password, setPassword] = useState<string>("");
  const [showPw, setShowPw] = useState<boolean>(false);
  const [passwordMode, setPasswordMode] = useState<PasswordMode>("view");
  const [bypass, setBypass] = useState<boolean>(true);
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
    if (mode === "protected" || expiry === "otv") setIsStarred(false);
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

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    const err = validateCode(code);
    if (err) {
      setCodeError(err);
      return;
    }
    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }
    if (mode === "protected" && !password) {
      toast.error("Password is required for protected clipboards");
      return;
    }
    const byteLen = new Blob([content]).size;
    if (byteLen > APP_CONFIG.contentMaxBytes) {
      toast.error("Content exceeds 256KB");
      return;
    }

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
    if (mode === "protected" && !isOTV && !expiresAt) {
      toast.error("Protected clipboards require an expiration");
      return;
    }

    const payload: CreateClipboardPayload = {
      code,
      content,
      mode,
      passwordMode: mode === "protected" ? passwordMode : null,
      password: mode === "protected" ? password : null,
      expiresAt,
      isOneTimeView: isOTV,
    };

    setSubmitting(true);
    try {
      const res = await createClipboard(payload);
      if (mode === "public" || bypass) {
        saveOwnerToken(res.code, res.ownerToken);
      }
      if (mode === "protected" && bypass && password) {
        saveBypassPassword(res.code, password);
      }
      if (mode === "public" && isStarred && !isOTV) {
        try {
          await starClipboard(res.code);
          window.dispatchEvent(new Event("refresh-starred"));
        } catch (err) {
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

        {mode === "public" && expiry !== "otv" && (
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
          <div className="space-y-3 rounded-md border border-[var(--border-color)] bg-[var(--surface)] p-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-[var(--border-color)] bg-[var(--surface-raised)] px-3 py-2 pr-10 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute inset-y-0 right-2 grid place-items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
                Password protects
              </label>
              <div className="grid grid-cols-2 gap-1 rounded-md border border-[var(--border-color)] bg-[var(--surface-raised)] p-1">
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
            <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <input
                type="checkbox"
                checked={bypass}
                onChange={(e) => setBypass(e.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Remember password on this device
            </label>
          </div>
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
