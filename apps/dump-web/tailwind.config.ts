import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist Sans"', "system-ui", "sans-serif"],
        mono: ['"Geist Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        surface: {
          DEFAULT: "var(--surface)",
          raised: "var(--surface-raised)",
          overlay: "var(--surface-overlay)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          muted: "var(--accent-muted)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        border: "var(--border-color)",
        // shadcn-style aliases used by existing UI components
        background: "var(--surface)",
        foreground: "var(--text-primary)",
        card: {
          DEFAULT: "var(--surface-raised)",
          foreground: "var(--text-primary)",
        },
        popover: {
          DEFAULT: "var(--surface-raised)",
          foreground: "var(--text-primary)",
        },
        primary: {
          DEFAULT: "var(--accent)",
          foreground: "#0a0a0a",
        },
        secondary: {
          DEFAULT: "var(--surface-raised)",
          foreground: "var(--text-primary)",
        },
        muted: {
          DEFAULT: "var(--surface-raised)",
          foreground: "var(--text-secondary)",
        },
        destructive: {
          DEFAULT: "var(--danger)",
          foreground: "#0a0a0a",
        },
        input: "var(--surface-overlay)",
        ring: "var(--accent)",
      },
      borderRadius: {
        sm: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
