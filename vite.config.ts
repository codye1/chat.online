import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      // Needed for OAuth popup flows (e.g., Google) that rely on window.postMessage.
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
  },
  preview: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
  },
  resolve: {
    alias: {
      "@components": fileURLToPath(
        new URL("./src/components", import.meta.url),
      ),
      "@assets": fileURLToPath(new URL("./src/assets", import.meta.url)),
      "@utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
      "@actions": fileURLToPath(new URL("./src/actions", import.meta.url)),
      "@hooks": fileURLToPath(new URL("./src/hooks", import.meta.url)),
      "@redux": fileURLToPath(new URL("./src/redux", import.meta.url)),
      "@api": fileURLToPath(new URL("./src/api", import.meta.url)),
    },
  },
});
