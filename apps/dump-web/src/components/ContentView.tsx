import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Copy, Edit3, Share2, Star, Trash2, Eye, EyeOff, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  deleteClipboard,
  starClipboard,
  unstarClipboard,
  verifyEditPassword,
} from "@/services/clipboardApi";
import { getBypassPassword, getOwnerToken } from "@/utils/tokens";
import { formatExpiry } from "@/utils/time";
import type { ClipboardData } from "@/types";
import { EditPanel } from "./EditPanel";
import { DeleteConfirm } from "./DeleteConfirm";
import { OtvBanner } from "./OtvBanner";
import { EditPasswordModal } from "./EditPasswordModal";
import { DesktopAction, MobileAction } from "./ContentActionButtons";

interface Props {
  data: ClipboardData;
  onUpdated: (next: ClipboardData) => void;
}

export function ContentView({ data, onUpdated }: Props): React.JSX.Element {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isStarred, setIsStarred] = useState<boolean>(data.isStarred);
  const [showSavedPw, setShowSavedPw] = useState(false);

  const [cachedEditPassword, setCachedEditPassword] = useState<string>("");
  const [showUnlockModal, setShowUnlockModal] = useState<boolean>(false);
  const [unlockAction, setUnlockAction] = useState<"edit" | "delete">("edit");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const ownerToken = getOwnerToken(data.code);
  const isOwner = !!ownerToken;
  const savedPassword = getBypassPassword(data.code);
  const canEdit = !data.isOneTimeView;
  const canDelete = true;
  const canStar = !data.isOneTimeView;

  function handleEditClick(): void {
    if (!isOwner && data.hasEditPassword && !cachedEditPassword) {
      setUnlockAction("edit");
      setDeleteError(null);
      setShowUnlockModal(true);
      return;
    }
    setEditing((v) => !v);
  }

  function handleDeleteClick(): void {
    if (!isOwner && data.hasEditPassword && !cachedEditPassword) {
      setUnlockAction("delete");
      setDeleteError(null);
      setShowUnlockModal(true);
      return;
    }
    setConfirmingDelete(true);
  }

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

  function openRaw(): void {
    window.open(`/${data.code}/raw`, "_blank");
  }

  async function doDelete(passwordOverride?: string): Promise<void> {
    setDeleting(true);
    setDeleteError(null);
    try {
      const effectivePassword =
        passwordOverride || cachedEditPassword || getBypassPassword(data.code) || undefined;
      await deleteClipboard(data.code, ownerToken ?? undefined, effectivePassword);
      toast.success("Clipboard deleted.");
      navigate("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete";
      if (showUnlockModal) {
        setDeleteError(msg);
      } else {
        toast.error(msg);
      }
      setDeleting(false);
    }
  }

  async function handleUnlockSubmit(pwd: string): Promise<void> {
    if (unlockAction === "edit") {
      setVerifying(true);
      setDeleteError(null);
      try {
        const valid = await verifyEditPassword(data.code, pwd);
        if (!valid) {
          setDeleteError("Incorrect edit password");
          setVerifying(false);
          return;
        }
        setCachedEditPassword(pwd);
        setShowUnlockModal(false);
        setEditing(true);
      } catch {
        setDeleteError("Incorrect edit password");
      } finally {
        setVerifying(false);
      }
    } else {
      await doDelete(pwd);
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
        {isOwner && savedPassword && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--surface-raised)] px-2 py-0.5 font-mono font-medium text-[var(--text-secondary)]">
            <span>Pw: {showSavedPw ? savedPassword : "••••"}</span>
            <button
              type="button"
              onClick={() => setShowSavedPw(!showSavedPw)}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              aria-label={showSavedPw ? "Hide password" : "Show password"}
            >
              {showSavedPw ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </button>
          </div>
        )}
      </div>

      <div className="mb-3 hidden md:flex md:gap-2">
        <DesktopAction onClick={copy} icon={<Copy className="h-4 w-4" />} label="Copy" />
        <DesktopAction onClick={share} icon={<Share2 className="h-4 w-4" />} label="Share" />
        <DesktopAction onClick={openRaw} icon={<FileText className="h-4 w-4" />} label="Raw" />
        {canEdit && (
          <DesktopAction
            onClick={handleEditClick}
            icon={<Edit3 className="h-4 w-4" />}
            label="Edit"
          />
        )}
        {canDelete && (
          <DesktopAction
            onClick={handleDeleteClick}
            icon={<Trash2 className="h-4 w-4" />}
            label="Delete"
            danger
          />
        )}
        {canStar && (
          <DesktopAction
            onClick={toggleStar}
            active={isStarred}
            icon={<Star className={`h-4 w-4 ${isStarred ? "fill-current" : ""}`} />}
            label={isStarred ? "Starred globally" : "Star globally"}
          />
        )}
      </div>

      <AnimatePresence>
        {confirmingDelete && (
          <DeleteConfirm
            busy={deleting}
            onConfirm={() => doDelete()}
            onCancel={() => setConfirmingDelete(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUnlockModal && (
          <EditPasswordModal
            action={unlockAction}
            busy={deleting || verifying}
            error={deleteError}
            onSubmit={handleUnlockSubmit}
            onCancel={() => {
              setShowUnlockModal(false);
              setDeleteError(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editing && (
          <EditPanel
            data={data}
            editPassword={cachedEditPassword}
            onSaved={(next) => {
              setEditing(false);
              onUpdated(next);
            }}
            onCancel={() => setEditing(false)}
          />
        )}
      </AnimatePresence>

      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-raised)] p-4">
        <pre className="whitespace-pre-wrap break-words font-mono text-sm text-[var(--text-primary)]">
          {data.content}
        </pre>
      </div>

      {/* Mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border-color)] bg-[var(--surface)]/90 px-4 py-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-around">
          <MobileAction onClick={copy} icon={<Copy className="h-5 w-5" />} label="Copy" />
          <MobileAction onClick={share} icon={<Share2 className="h-5 w-5" />} label="Share" />
          <MobileAction onClick={openRaw} icon={<FileText className="h-5 w-5" />} label="Raw" />
          {canEdit && (
            <MobileAction
              onClick={handleEditClick}
              icon={<Edit3 className="h-5 w-5" />}
              label="Edit"
            />
          )}
          {canDelete && (
            <MobileAction
              onClick={handleDeleteClick}
              icon={<Trash2 className="h-5 w-5" />}
              label="Delete"
              danger
            />
          )}
          {canStar && (
            <MobileAction
              onClick={toggleStar}
              active={isStarred}
              icon={<Star className={`h-5 w-5 ${isStarred ? "fill-current" : ""}`} />}
              label={isStarred ? "Starred globally" : "Star globally"}
            />
          )}
        </div>
      </div>
    </div>
  );
}
