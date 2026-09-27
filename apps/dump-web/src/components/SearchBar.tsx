import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { checkClipboardExists } from "@/services/clipboardApi";
import { validateCode } from "@/utils/validate";

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className }: SearchBarProps): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSearch(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    const code = query.trim().toLowerCase();
    if (!code) return;

    const validationErr = validateCode(code);
    if (validationErr) {
      toast.error("Clipboard not found or expired");
      return;
    }

    setLoading(true);
    try {
      const exists = await checkClipboardExists(code);
      if (exists) {
        navigate(`/${code}`);
      } else {
        toast.error("Clipboard not found or expired");
      }
    } catch {
      toast.error("Failed to search clipboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSearch} className={className ?? "w-full sm:w-60 md:w-64"}>
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-[var(--text-secondary)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clipboard…"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          className="w-full rounded-md border border-[var(--border-color)] bg-[var(--surface)] py-1.5 pl-8 pr-8 font-mono text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-1 grid h-6 w-6 place-items-center rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
          aria-label="Search clipboard"
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin text-[var(--accent)]" />
          ) : (
            <ArrowRight className="h-3 w-3" />
          )}
        </button>
      </div>
    </form>
  );
}
