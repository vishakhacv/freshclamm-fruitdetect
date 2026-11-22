import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["leaf.svg"],
      manifest: {
        name: "Produce Check — Freshness Scanner",
        short_name: "Produce Check",
        description: "Offline image-based freshness estimate for fruits and vegetables.",
        theme_color: "#143d2b",
        background_color: "#f4f7f2",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/leaf.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,webmanifest,json,bin}"],
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024,
        navigateFallback: "/index.html"
      }
    })
  ],
  build: { outDir: "dist" }
});