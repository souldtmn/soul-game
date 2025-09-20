import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "client",
  publicDir: "client/public",
  plugins: [react()],
  resolve: {
    alias: [
      // Map ANY @fontsource/inter* import to an empty CSS file
      { find: /^@fontsource\/inter(\/.*)?$/, replacement: "/client/src/empty-font.css" }
    ]
  },
  server: {
    host: true,
    port: Number(process.env.PORT ?? 5173),
    strictPort: false,
    allowedHosts: [".replit.dev", ".repl.co"]
  },
  preview: {
    host: true,
    port: Number(process.env.PORT ?? 5173),
    strictPort: false,
    allowedHosts: [".replit.dev", ".repl.co"]
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true
  }
});
