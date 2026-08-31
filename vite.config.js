import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Both Spring services allow CORS from http://localhost:5173 only,
// so strictPort stops Vite from silently moving to another port.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true
  }
});
