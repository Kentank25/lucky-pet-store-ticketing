import { useAuth } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import AdminDashboard from "./features/admin/AdminDashboard";
import KioskDashboard from "./features/kiosk/KioskDashboard";
import PicDashboard from "./features/pic/PicDashboard";

import LoginPage from "./pages/LoginPage";

import { Routes, Route, Navigate } from "react-router-dom";
import QueueMonitor from "./pages/QueueMonitor";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col p-4 md:p-6 gap-8">
        {/* Simple Skeleton for Global Loading */}
        <div className="w-full h-24 bg-slate-200 rounded-3xl animate-pulse"></div>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-slate-200 rounded-3xl animate-pulse h-96"></div>
          <div className="lg:col-span-2 bg-slate-200 rounded-3xl animate-pulse h-96"></div>
        </div>
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
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
