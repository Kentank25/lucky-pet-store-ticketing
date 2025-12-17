import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import Layout from "./components/layout/Layout";
import AdminDashboard from "./features/admin/AdminDashboard";
import KioskDashboard from "./features/kiosk/KioskDashboard";
import PicDashboard from "./features/pic/PicDashboard";

import LoginPage from "./pages/LoginPage";

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import QueueMonitor from "./pages/QueueMonitor";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  const { role, loading } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const root = window.document.documentElement;
    if (location.pathname === "/kiosk" || location.pathname === "/login") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light", "dark");
      root.classList.add(theme);
    }
  }, [location.pathname, theme]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse-soft"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] animate-pulse-soft delay-1000"></div>

        <div className="glass-panel p-8 rounded-3xl flex flex-col items-center gap-6 relative z-10 border-white/20 shadow-2xl">
          <div className="w-20 h-20 bg-linear-to-tr from-indigo-500 to-purple-500 rounded-2xl shadow-lg shadow-indigo-500/40 flex items-center justify-center animate-float">
            <img
              src="/Lucky Pet Store Logo (Black).png"
              alt="Loading..."
              className="w-full h-full object-cover p-1 opacity-90 invert dark:invert-0"
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              LuckyPetStore
            </h2>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-0"></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-100"></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/kiosk" element={<KioskDashboard />} />
      <Route path="/monitor/:id" element={<QueueMonitor />} />

      <Route
        path="/login"
        element={!role ? <LoginPage /> : <Navigate to="/" replace />}
      />

      <Route
        path="/"
        element={
          !role ? (
            <Navigate to="/login" replace />
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
