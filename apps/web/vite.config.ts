import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Served from a sub-path in production (e.g. VITE_BASE_PATH=/datanorge/); "/" locally.
  base: process.env.VITE_BASE_PATH ?? "/",
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
});
