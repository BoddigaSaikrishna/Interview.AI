import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// async config so we can safely try to load optional plugins
export default defineConfig(async ({ mode }) => {
  const plugins: any[] = [react()];

  // Development mode plugins can be added here if needed

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
