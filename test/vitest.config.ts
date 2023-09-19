/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  test: {
    testTimeout: 30000,
    include: ["integration/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },
  logLevel: "info",
  esbuild: {
    sourcemap: "both",
  },
  plugins: [tsconfigPaths()],
});
