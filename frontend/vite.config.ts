import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// async config so we can safely try to load optional plugins
export default defineConfig(async ({ mode }) => {
  const plugins: any[] = [react()];

  // Development mode plugins can be added here if needed

  return {
    server: {
      host: "127.0.0.1",
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
