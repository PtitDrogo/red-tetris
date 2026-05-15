/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      "/socket.io": { target: "http://localhost:3000", ws: true },
    },
  },

  test: {
    globals: true,
    environment: "jsdom",

    coverage: {
      provider: "v8", // or 'istanbul'
      enabled: true, // Automatically runs coverage when you trigger the coverage command
      include: ["src/**/*.{ts,tsx}"], // Only look at proper code files in src
      exclude: [
        "src/**/*.test.{ts,tsx}", // Ignore test files
        "src/**/*.spec.{ts,tsx}", // Ignore spec files
        "src/**/*.d.ts", // Ignore TypeScript declaration files
        "src/main.tsx", // Optional: ignore entry point files if you want
        "src/vite-env.d.ts",
        "vite.config.ts",
      ],
    },
  },
});
