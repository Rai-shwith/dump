import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Plus } from "lucide-react";
import { APP_CONFIG } from "@/config/app.config";
import { ContentView } from "@/components/ContentView";
import { PasswordGate } from "@/components/PasswordGate";
import { SearchBar } from "@/components/SearchBar";
import { useClipboard } from "@/hooks/useClipboard";
import { toast } from "sonner";
import { getOwnerToken } from "@/utils/tokens";

export default function ViewPage() {
  const { code: raw } = useParams<{ code: string }>();
  const code = (raw ?? "").toLowerCase();

  if (!code || (APP_CONFIG.reservedKeywords as readonly string[]).includes(code)) {
    return <NotFoundInline />;
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Helmet>
        <title>dump · {code}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/"
            className="font-mono text-2xl font-semibold tracking-tight text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
          >
            dump
          </Link>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Clipboard:{" "}
            <span className="font-mono font-medium text-[var(--text-primary)]">{code}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[var(--border-color)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer shrink-0"
            title="Create new clipboard"
          >
            <Plus className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span className="hidden sm:inline">New clipboard</span>
            <span className="sm:hidden">New</span>
          </Link>
          <SearchBar className="flex-1 sm:w-56 md:w-60" />
        </div>
      </header>
      <ViewInner code={code} />
    </div>
  );
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
    <div className="mx-auto max-w-xl space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/"
            className="font-mono text-2xl font-semibold tracking-tight text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
          >
            dump
          </Link>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Anonymous clipboards</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[var(--border-color)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer shrink-0"
            title="Create new clipboard"
          >
            <Plus className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span className="hidden sm:inline">New clipboard</span>
            <span className="sm:hidden">New</span>
          </Link>
          <SearchBar className="flex-1 sm:w-56 md:w-60" />
        </div>
      </header>
      <div className="grid min-h-[50vh] place-items-center text-center">
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
    </div>
  );
}
