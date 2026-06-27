import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import type { ClipboardMode, ExpiryPreset } from "@/types";

interface ExpiryOption {
  value: ExpiryPreset;
  label: string;
  publicOnly?: boolean;
}

const OPTIONS: ExpiryOption[] = [
  { value: "1m", label: "1 minute" },
  { value: "5m", label: "5 minutes" },
  { value: "15m", label: "15 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "1d", label: "1 day" },
  { value: "1w", label: "1 week" },
  { value: "1mo", label: "1 month" },
  { value: "1y", label: "1 year" },
  { value: "infinite", label: "Infinite", publicOnly: true },
  { value: "otv", label: "One-Time View" },
  { value: "custom", label: "Custom…" },
];

interface Props {
  value: ExpiryPreset;
  onChange: (v: ExpiryPreset) => void;
  mode: ClipboardMode;
  customDatetime: string;
  onCustomChange: (v: string) => void;
}

export function ExpirySelector({
  value,
  onChange,
  mode,
  customDatetime,
  onCustomChange,
}: Props): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const visible = OPTIONS.filter((o) => !o.publicOnly || mode === "public");
  const current = OPTIONS.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-md border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors cursor-pointer"
      >
        <span>{current?.label ?? "Select expiry"}</span>
        <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-md border border-[var(--border-color)] bg-[var(--surface-raised)] py-1 shadow-lg"
          >
            {visible.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--surface-overlay)] cursor-pointer"
                >
                  <span>{opt.label}</span>
                  {value === opt.value && <Check className="h-4 w-4 text-[var(--accent)]" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {value === "custom" && (
        <input
          type="datetime-local"
          value={customDatetime}
          onChange={(e) => onCustomChange(e.target.value)}
          className="mt-2 w-full rounded-md border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
        />
      )}

      {value === "otv" && (
        <p className="mt-2 text-xs text-[var(--warning)]">
          This clipboard will be permanently deleted after the first view.
        </p>
      )}
    </div>
  );
}
