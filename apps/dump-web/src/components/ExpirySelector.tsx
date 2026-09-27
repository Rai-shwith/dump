import type { ClipboardMode, ExpiryPreset } from "@/types";

const DURATIONS: { value: ExpiryPreset; label: string; title: string }[] = [
  { value: "1m", label: "1m", title: "1 minute" },
  { value: "5m", label: "5m", title: "5 minutes" },
  { value: "15m", label: "15m", title: "15 minutes" },
  { value: "1h", label: "1h", title: "1 hour" },
  { value: "1d", label: "1d", title: "1 day" },
  { value: "1w", label: "1w", title: "1 week" },
  { value: "1mo", label: "1mo", title: "1 month" },
  { value: "1y", label: "1y", title: "1 year" },
];

const DESCRIPTIONS: Record<ExpiryPreset, string> = {
  "1m": "Expires in 1 minute",
  "5m": "Expires in 5 minutes",
  "15m": "Expires in 15 minutes",
  "1h": "Expires in 1 hour",
  "1d": "Expires in 1 day",
  "1w": "Expires in 1 week",
  "1mo": "Expires in 1 month",
  "1y": "Expires in 1 year",
  infinite: "Permanent clipboard (no expiration)",
  otv: "One-Time View (permanently destroyed upon first read)",
  custom: "Custom expiration date and time",
};

interface Props {
  value: ExpiryPreset;
  onChange: (v: ExpiryPreset) => void;
  mode: ClipboardMode;
  customDatetime: string;
  onCustomChange: (v: string) => void;
  subtitle?: string;
}

export function ExpirySelector({
  value,
  onChange,
  mode,
  customDatetime,
  onCustomChange,
  subtitle,
}: Props): React.JSX.Element {
  return (
    <div className="space-y-2">
      {/* Duration presets row */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 p-1 rounded-lg border border-[var(--border-color)] bg-[var(--surface)]">
        {DURATIONS.map((d) => {
          const active = value === d.value;
          return (
            <button
              key={d.value}
              type="button"
              onClick={() => onChange(d.value)}
              title={d.title}
              className={`flex items-center justify-center py-2 px-1 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                active
                  ? "bg-[var(--accent)] text-[#0a0a0a] font-bold shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)]"
              }`}
            >
              <span>{d.label}</span>
            </button>
          );
        })}
      </div>

      {/* Special presets row */}
      <div
        className={`grid gap-1.5 p-1 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] ${
          mode === "public" ? "grid-cols-3" : "grid-cols-2"
        }`}
      >
        {mode === "public" && (
          <button
            type="button"
            onClick={() => onChange("infinite")}
            className={`py-1.5 px-3 rounded-md text-xs font-medium transition-all cursor-pointer text-center ${
              value === "infinite"
                ? "bg-[var(--accent)] text-[#0a0a0a] font-bold shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)]"
            }`}
          >
            Infinite
          </button>
        )}
        <button
          type="button"
          onClick={() => onChange("otv")}
          className={`py-1.5 px-3 rounded-md text-xs font-medium transition-all cursor-pointer text-center ${
            value === "otv"
              ? "bg-[var(--accent)] text-[#0a0a0a] font-bold shadow-sm"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)]"
          }`}
        >
          One-Time View
        </button>
        <button
          type="button"
          onClick={() => onChange("custom")}
          className={`py-1.5 px-3 rounded-md text-xs font-medium transition-all cursor-pointer text-center ${
            value === "custom"
              ? "bg-[var(--accent)] text-[#0a0a0a] font-bold shadow-sm"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)]"
          }`}
        >
          Custom…
        </button>
      </div>

      {/* Explanation text */}
      <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-[var(--text-secondary)] px-1">
        <span>{DESCRIPTIONS[value]}</span>
        {subtitle && <span className="text-[var(--accent)] font-medium">{subtitle}</span>}
      </div>

      {/* Custom datetime picker */}
      {value === "custom" && (
        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-2.5">
          <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
            Pick date & time (local timezone)
          </label>
          <input
            type="datetime-local"
            value={customDatetime}
            onChange={(e) => onCustomChange(e.target.value)}
            className="w-full rounded-md border border-[var(--border-color)] bg-[var(--surface-raised)] px-3 py-1.5 text-xs text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
      )}

      {/* One-time view note */}
      {value === "otv" && (
        <p className="text-xs text-[var(--warning)] px-1">
          ⚠️ This clipboard will be permanently deleted after the first view.
        </p>
      )}
    </div>
  );
}
