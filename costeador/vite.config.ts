// Código fuente del costeador. `npm run build` genera la página publicada en ../costeo/
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";

// Script clásico (no módulo) para que la página también abra con doble clic (file://)
const classicScript: Plugin = {
  name: "classic-script",
  apply: "build",
  transformIndexHtml: {
    order: "post",
    handler: (html) => html.replace(/ type="module"/g, " defer").replace(/ crossorigin/g, ""),
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss(), classicScript],
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "..", "costeo"),
    emptyOutDir: true,
    modulePreload: false,
    rollupOptions: {
      output: { format: "iife" },
    },
  },
});
