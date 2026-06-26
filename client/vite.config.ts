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
      provider: "v8", 
      enabled: true, 
      include: ["src/**/*.{ts,tsx}"], 
      exclude: [
        "src/**/*.test.{ts,tsx}", 
        "src/**/*.spec.{ts,tsx}", 
        "src/**/*.d.ts", 
        "src/main.tsx", 
        "src/vite-env.d.ts",
        "vite.config.ts",
      ],
    },
  },
});
