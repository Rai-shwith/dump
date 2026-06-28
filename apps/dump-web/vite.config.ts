import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "::",
    strictPort: true,
    proxy: {
      "^/[^/]+/raw$": {
        target: "http://127.0.0.1:8787",
        changeOrigin: true,
        rewrite: (path) => `/api/clipboard${path}`,
      },
    },
  },
});
