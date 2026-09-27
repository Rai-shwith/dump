import React from "react";

export interface ActionProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  active?: boolean;
}

export function DesktopAction({
  onClick,
  icon,
  label,
  danger,
  active,
}: ActionProps): React.JSX.Element {
  let colorClass =
    "border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)]";
  if (danger) {
    colorClass = "border-[var(--danger)]/40 text-[var(--danger)] hover:bg-[var(--danger)]/10";
  } else if (active) {
    colorClass = "border-[var(--accent)] bg-[var(--accent)] text-[#0a0a0a]";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${colorClass}`}
    >
      {icon} {label}
    </button>
  );
}

export function MobileAction({
  onClick,
  icon,
  label,
  danger,
  active,
}: ActionProps): React.JSX.Element {
  let colorClass = "text-[var(--text-secondary)] hover:text-[var(--text-primary)]";
  if (danger) {
    colorClass = "text-[var(--danger)]";
  } else if (active) {
    colorClass = "bg-[var(--accent)] text-[#0a0a0a] rounded-md";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`grid place-items-center gap-0.5 px-3 py-1 text-[10px] font-medium cursor-pointer ${colorClass}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
