import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      // Dev: forward API calls to the Hono/Bun backend.
      "/api": "http://localhost:3000",
    },
  },
  build: {
    outDir: "dist",
  },
});
