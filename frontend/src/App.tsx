import DashboardPage from "@/app/dashboard/page";
import SignInPage from "@/app/sign-in/page";
import { Navigate, Route, Routes } from "react-router";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/sign-in" replace />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/sign-in" replace />} />
    </Routes>
  );
}
