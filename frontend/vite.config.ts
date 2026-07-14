import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
              return "vendor-react"
            }
            if (id.includes("recharts") || id.includes("d3")) {
              return "vendor-charts"
            }
            if (id.includes("@supabase")) {
              return "vendor-supabase"
            }
            return "vendor"
          }
          if (id.includes("src/features/statistics/pages/Statistics")) {
            return "features-statistics"
          }
        },
      },
    },
  },
})
