import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ["VITE_", "vite_"]);

  return {
    plugins: [react()],
    define: {
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
