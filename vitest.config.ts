import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@edge-shared": path.resolve(__dirname, "supabase/functions/_shared"),
    },
  },
  test: {
    environment: "node",
    include: ["app/**/*.test.ts", "shared/**/*.test.ts"],
  },
});
