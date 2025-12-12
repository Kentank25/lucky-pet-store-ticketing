import { useRole } from "./context/RoleContext";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import AdminDashboard from "./features/admin/AdminDashboard";
import KioskDashboard from "./features/kiosk/KioskDashboard";
import PicDashboard from "./features/pic/PicDashboard";

import LoginPage from "./pages/LoginPage";

import { Routes, Route, Navigate } from "react-router-dom";
import QueueMonitor from "./pages/QueueMonitor";

function App() {
  const { role, loading: roleLoading } = useRole();
  const { loading: authLoading } = useAuth();

  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/kiosk" element={<KioskDashboard />} />
      <Route path="/monitor/:id" element={<QueueMonitor />} />

      <Route
        path="/"
        element={
          !role ? (
            <LoginPage />
          ) : (
            <Layout>
              {role === "admin" && <AdminDashboard />}
              {(role === "pic_grooming" ||
                role === "pic_klinik" ||
                role === "kiosk") && <PicDashboard />}
              {role === "kiosk" && (
                <div className="p-4">
                  Akun Kiosk dialihkan ke{" "}
                  <a href="/kiosk" className="text-blue-500 underline">
                    Halaman Publik
                  </a>
                  .
                </div>
              )}
            </Layout>
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
