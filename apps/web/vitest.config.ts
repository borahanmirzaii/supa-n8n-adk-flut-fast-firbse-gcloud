import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@repo/types": path.resolve(__dirname, "../../packages/types/src"),
      "@repo/schemas": path.resolve(__dirname, "../../packages/schemas/src"),
      "@repo/utils": path.resolve(__dirname, "../../packages/utils/src"),
    },
  },
});

