import { AuthProvider } from "@descope/react-sdk";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";
import "./app/globals.css";

const projectId = import.meta.env.VITE_DESCOPE_PROJECT_ID ?? "";
const cookieOptions = {
  sameSite: "Lax" as const,
  secure: import.meta.env.PROD,
};

const root = createRoot(document.getElementById("root")!);

if (!projectId) {
  root.render(
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Descope configuration is missing</h1>
      <p>Set VITE_DESCOPE_PROJECT_ID in frontend/.env and restart Vite.</p>
    </main>,
  );
} else {
  root.render(
    <StrictMode>
      <AuthProvider
        projectId={projectId}
        sessionTokenViaCookie={cookieOptions}
        refreshTokenViaCookie={cookieOptions}
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </StrictMode>,
  );
}
