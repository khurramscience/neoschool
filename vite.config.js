import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // For GitHub Pages: https://khurramscience.github.io/neoschool/
  base: process.env.GITHUB_PAGES === "true" ? "/neoschool/" : "/",
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 1500,  // App.jsx is large
    assetsInlineLimit: 4096,
  },
});
