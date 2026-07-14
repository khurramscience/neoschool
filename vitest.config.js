import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.js"],
    testTimeout: 20000,
  },
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify("https://dwpxsaamaehtmhsuuprg.supabase.co"),
    "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify("test-key"),
  },
});
