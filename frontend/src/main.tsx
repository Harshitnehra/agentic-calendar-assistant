import { AuthProvider } from "@descope/react-sdk";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";
import "./app/globals.css";

const projectId = import.meta.env.VITE_DESCOPE_PROJECT_ID ?? "";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider
      projectId={projectId}
      sessionTokenViaCookie
      refreshTokenViaCookie
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
