import { useState } from "react";
import { Eye, EyeOff, Lock, ShieldAlert } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Props {
  hasExistingViewPw: boolean;
  requireViewPw: boolean;
  setRequireViewPw: (val: boolean) => void;
  viewPassword: string;
  setViewPassword: (val: string) => void;
  hasExistingEditPw: boolean;
  requireEditPw: boolean;
  setRequireEditPw: (val: boolean) => void;
  editPassword: string;
  setEditPassword: (val: string) => void;
}

export function EditPasswordSection({
  hasExistingViewPw,
  requireViewPw,
  setRequireViewPw,
  viewPassword,
  setViewPassword,
  hasExistingEditPw,
  requireEditPw,
  setRequireEditPw,
  editPassword,
  setEditPassword,
}: Props): React.JSX.Element {
  const [showViewPw, setShowViewPw] = useState<boolean>(false);
  const [showEditPw, setShowEditPw] = useState<boolean>(false);
  const [viewPwReadOnly, setViewPwReadOnly] = useState<boolean>(true);
  const [editPwReadOnly, setEditPwReadOnly] = useState<boolean>(true);

  return (
    <div className="space-y-3 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-3.5">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[var(--text-secondary)] shrink-0" />
            <div>
              <span className="text-xs font-medium text-[var(--text-primary)]">
                Require password to view
              </span>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {hasExistingViewPw ? "Active on this clipboard" : "Not currently required"}
              </p>
            </div>
          </div>
          <Switch
            checked={requireViewPw}
            onCheckedChange={setRequireViewPw}
            aria-label="Require password to view"
          />
        </div>
        {requireViewPw && (
          <div className="relative">
            <input
              type={showViewPw ? "text" : "password"}
              name="dump-noautofill-view-pwd"
              autoComplete="new-password"
              data-lpignore="true"
              data-1p-ignore="true"
              data-bwignore="true"
              data-form-type="other"
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              readOnly={viewPwReadOnly}
              onFocus={() => setViewPwReadOnly(false)}
              onPointerDown={() => setViewPwReadOnly(false)}
              value={viewPassword}
              onChange={(e) => setViewPassword(e.target.value)}
              placeholder={
                hasExistingViewPw
                  ? "New view password (leave blank to keep current)"
                  : "Enter view password"
              }
              className="w-full rounded-md border border-[var(--border-color)] bg-[var(--surface-raised)] px-3 py-2 pr-10 font-mono text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowViewPw((s) => !s)}
              className="absolute inset-y-0 right-2 grid place-items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              aria-label={showViewPw ? "Hide view password" : "Show view password"}
            >
              {showViewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-[var(--border-color)]/60" />

      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-[var(--text-secondary)] shrink-0" />
            <div>
              <span className="text-xs font-medium text-[var(--text-primary)]">
                Require password to edit or delete
              </span>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {hasExistingEditPw ? "Active on this clipboard" : "Not currently required"}
              </p>
            </div>
          </div>
          <Switch
            checked={requireEditPw}
            onCheckedChange={setRequireEditPw}
            aria-label="Require password to edit or delete"
          />
        </div>
        {requireEditPw && (
          <div className="relative">
            <input
              type={showEditPw ? "text" : "password"}
              name="dump-noautofill-edit-pwd"
              autoComplete="new-password"
              data-lpignore="true"
              data-1p-ignore="true"
              data-bwignore="true"
              data-form-type="other"
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              readOnly={editPwReadOnly}
              onFocus={() => setEditPwReadOnly(false)}
              onPointerDown={() => setEditPwReadOnly(false)}
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              placeholder={
                hasExistingEditPw
                  ? "New edit password (leave blank to keep current)"
                  : "Enter edit password"
              }
              className="w-full rounded-md border border-[var(--border-color)] bg-[var(--surface-raised)] px-3 py-2 pr-10 font-mono text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowEditPw((s) => !s)}
              className="absolute inset-y-0 right-2 grid place-items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              aria-label={showEditPw ? "Hide edit password" : "Show edit password"}
            >
              {showEditPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
