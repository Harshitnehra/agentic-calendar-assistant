import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(
        env.VITE_API_URL ?? env.VITE_DESCOPE_MANAGEMENT_KEY,
      ),
      "import.meta.env.VITE_DESCOPE_PROJECT_ID": JSON.stringify(
        env.VITE_DESCOPE_PROJECT_ID ?? env.vite_DESCOPE_PROJECT_ID,
      ),
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
});
