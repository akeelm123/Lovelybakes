import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "server-only": path.resolve(__dirname, "node_modules/next/dist/compiled/server-only/empty.js"), "@": path.resolve(__dirname, "./src") } },
  test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"] },
});
