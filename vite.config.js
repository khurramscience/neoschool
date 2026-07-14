import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // For GitHub Pages: https://khurramscience.github.io/neoschool/
  base: process.env.GITHUB_PAGES === "true" ? "/neoschool/" : "/",
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 900,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
  },
});
