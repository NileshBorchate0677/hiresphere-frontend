import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  // SPA fallback: serve index.html for every unknown route so BrowserRouter
  // routes like /jobseeker/dashboard don't 404 on hard refresh.
  appType: "spa",

  server: {
    host: true,
    port: 5173,
  },

  preview: {
    host: true,
    port: 5173,
  },

  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
            return "react-vendor";
          }
          if (id.includes("node_modules/react-router-dom/")) {
            return "router-vendor";
          }
          if (id.includes("node_modules/react-icons/")) {
            return "icons-vendor";
          }
          if (id.includes("node_modules/axios/")) {
            return "axios-vendor";
          }
        },
      },
    },
  },
});
