import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Edit3, Share2, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteClipboard, starClipboard, unstarClipboard } from "@/services/clipboardApi";
import { getBypassPassword, getOwnerToken } from "@/utils/tokens";
import { formatExpiry } from "@/utils/time";
import type { ClipboardData } from "@/types";
import { EditPanel } from "./EditPanel";
import { DeleteConfirm } from "./DeleteConfirm";
import { OtvBanner } from "./OtvBanner";

interface Props {
  data: ClipboardData;
  onUpdated: (next: ClipboardData) => void;
}

export function ContentView({ data, onUpdated }: Props): React.JSX.Element {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isStarred, setIsStarred] = useState<boolean>(data.isStarred);

  const ownerToken = getOwnerToken(data.code);
  const isOwner = !!ownerToken;
  const canEdit = isOwner || data.mode === "public";
  const canDelete = isOwner || data.mode === "public";
  const canStar = data.mode === "public" && !data.isOneTimeView;

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(data.content);
      toast.success("Copied!");
    } catch {
      toast.error("Couldn't copy");
    }
  }

  async function share(): Promise<void> {
    const url = `${window.location.origin}/${data.code}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    } catch {
      toast.error("Couldn't copy link");
    }
  }

  async function doDelete(): Promise<void> {
    setDeleting(true);
    try {
      const bypass = getBypassPassword(data.code) ?? undefined;
      await deleteClipboard(data.code, ownerToken ?? undefined, bypass);
      toast.success("Clipboard deleted.");
      navigate("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
    }
  }

  async function toggleStar(): Promise<void> {
    const next = !isStarred;
    setIsStarred(next);
    try {
      if (next) await starClipboard(data.code);
      else await unstarClipboard(data.code);
    } catch (err) {
      setIsStarred(!next);
      toast.error(err instanceof Error ? err.message : "Failed to update star");
    }
  }

  return (
    <div className="pb-24 md:pb-0">
      {data.isOneTimeView && <OtvBanner />}

      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full border border-[var(--border-color)] bg-[var(--surface-raised)] px-2 py-0.5 font-medium text-[var(--text-secondary)]">
          {data.mode}
        </span>
        <span className="rounded-full border border-[var(--border-color)] bg-[var(--surface-raised)] px-2 py-0.5 font-medium text-[var(--text-secondary)]">
          {formatExpiry(data.expiresAt, data.isOneTimeView)}
        </span>
        {isOwner && (
          <span className="rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-2 py-0.5 font-medium text-[var(--accent)]">
            🔑 You own this
          </span>
        )}
      </div>

      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-raised)] p-4">
        <pre className="whitespace-pre-wrap break-words font-mono text-sm text-[var(--text-primary)]">
          {data.content}
        </pre>
      </div>

      <div className="mt-3 hidden md:flex md:gap-2">
        <DesktopAction onClick={copy} icon={<Copy className="h-4 w-4" />} label="Copy" />
        <DesktopAction onClick={share} icon={<Share2 className="h-4 w-4" />} label="Share" />
        {canEdit && !data.isOneTimeView && (
          <DesktopAction
            onClick={() => setEditing((v) => !v)}
            icon={<Edit3 className="h-4 w-4" />}
            label="Edit"
          />
        )}
        {canDelete && (
          <DesktopAction
            onClick={() => setConfirmingDelete(true)}
            icon={<Trash2 className="h-4 w-4" />}
            label="Delete"
            danger
          />
        )}
        {canStar && (
          <DesktopAction
            onClick={toggleStar}
            icon={<Star className={`h-4 w-4 ${isStarred ? "fill-[var(--accent)]" : ""}`} />}
            label={isStarred ? "Starred" : "Star"}
          />
        )}
      </div>

      <AnimatePresence>
        {confirmingDelete && (
          <DeleteConfirm
            busy={deleting}
            onConfirm={doDelete}
            onCancel={() => setConfirmingDelete(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editing && (
          <EditPanel
            data={data}
            onSaved={(next) => {
              setEditing(false);
              onUpdated(next);
            }}
            onCancel={() => setEditing(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border-color)] bg-[var(--surface)]/90 px-4 py-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-around">
          <MobileAction onClick={copy} icon={<Copy className="h-5 w-5" />} label="Copy" />
          <MobileAction onClick={share} icon={<Share2 className="h-5 w-5" />} label="Share" />
          {canEdit && !data.isOneTimeView && (
            <MobileAction
              onClick={() => setEditing((v) => !v)}
              icon={<Edit3 className="h-5 w-5" />}
              label="Edit"
            />
          )}
          {canDelete && (
            <MobileAction
              onClick={() => setConfirmingDelete(true)}
              icon={<Trash2 className="h-5 w-5" />}
              label="Delete"
              danger
            />
          )}
          {canStar && (
            <MobileAction
              onClick={toggleStar}
              icon={<Star className={`h-5 w-5 ${isStarred ? "fill-[var(--accent)]" : ""}`} />}
              label="Star"
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface ActionProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
}

function DesktopAction({ onClick, icon, label, danger }: ActionProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
        danger
          ? "border-[var(--danger)]/40 text-[var(--danger)] hover:bg-[var(--danger)]/10"
          : "border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function MobileAction({ onClick, icon, label, danger }: ActionProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`grid place-items-center gap-0.5 px-3 py-1 text-[10px] font-medium cursor-pointer ${
        danger ? "text-[var(--danger)]" : "text-[var(--text-secondary)]"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
