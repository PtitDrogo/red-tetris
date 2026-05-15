import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,

    coverage: {
      provider: "v8",
      enabled: true,
      include: ["src/**/*.{ts,js}"],
      exclude: [
        "src/**/*.test.{ts,js}",
        "src/**/*.spec.{ts,js}",
        "src/**/*.d.ts",
        "src/index.ts",
        "vitest.config.ts",
      ],
    },
  },
});
