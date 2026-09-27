import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Plus } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Helmet>
        <title>404 Not Found | Dump</title>
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
          <h1 className="font-mono text-7xl font-bold text-[var(--text-primary)]">404</h1>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            This clipboard doesn't exist or has expired.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#0a0a0a] hover:bg-[var(--accent-hover)] transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
