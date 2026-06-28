import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { APP_CONFIG } from "@/config/app.config";
import { ContentView } from "@/components/ContentView";
import { PasswordGate } from "@/components/PasswordGate";
import { useClipboard } from "@/hooks/useClipboard";
import { toast } from "sonner";
import { getOwnerToken } from "@/utils/tokens";

export default function ViewPage() {
  const { code: raw } = useParams<{ code: string }>();
  const code = (raw ?? "").toLowerCase();

  useEffect(() => {
    document.title = `dump · ${code}`;
  }, [code]);

  if (!code || (APP_CONFIG.reservedKeywords as readonly string[]).includes(code)) {
    return <NotFoundInline />;
  }

  return <ViewInner code={code} />;
}

function ViewInner({ code }: { code: string }) {
  const { state, unlock, setData } = useClipboard(code);

  const isProtectedOk = state.status === "ok" && state.data.mode === "protected";

  useEffect(() => {
    if (isProtectedOk && getOwnerToken(code)) {
      toast.success("Password bypassed using saved token");
    }
  }, [isProtectedOk, code]);

  return (
    <AnimatePresence mode="wait">
      {state.status === "loading" && (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-3"
        >
          <div className="h-6 w-32 animate-pulse rounded-md bg-[var(--surface-raised)]" />
          <div className="h-48 animate-pulse rounded-xl bg-[var(--surface-raised)]" />
        </motion.div>
      )}

      {state.status === "locked" && (
        <motion.div
          key="locked"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <PasswordGate onUnlock={unlock} />
        </motion.div>
      )}

      {state.status === "ok" && (
        <motion.div
          key="ok"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ContentView data={state.data} onUpdated={setData} />
        </motion.div>
      )}

      {state.status === "not-found" && <NotFoundInline key="404" />}

      {state.status === "error" && (
        <motion.div
          key="err"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="rounded-xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-4 text-sm text-[var(--text-primary)]"
        >
          {state.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NotFoundInline() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div>
        <h1 className="font-mono text-6xl font-bold text-[var(--text-primary)]">404</h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          This clipboard doesn't exist or has expired.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#0a0a0a] hover:bg-[var(--accent-hover)] transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
