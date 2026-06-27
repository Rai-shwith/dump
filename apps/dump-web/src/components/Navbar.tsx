import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function Navbar(): React.JSX.Element {
  const { theme, toggle } = useTheme();
  return (
    <header className="fixed inset-x-0 top-0 z-40 h-12 border-b border-[var(--border-color)] bg-[var(--surface)]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-3xl items-center justify-between px-4">
        <Link
          to="/"
          className="font-mono text-base font-semibold tracking-tight text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
        >
          dump
        </Link>
        <button
          type="button"
          aria-label="Toggle theme"
          onClick={toggle}
          className="grid h-8 w-8 place-items-center rounded-md text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="grid place-items-center"
            >
              {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
    </header>
  );
}
