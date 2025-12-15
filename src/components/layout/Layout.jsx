import { useAuth } from "../../context/AuthContext";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

export default function Layout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-bg-canvas font-sans text-text-main selection:bg-primary selection:text-white">
      <header className="fixed top-0 inset-x-0 bg-bg-surface/80 backdrop-blur-xl border-b border-border-subtle z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-tr from-blue-600 to-blue-400 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center text-xl animate-float">
              <img
                src="/Lucky Pet Store Logo (Black).png"
                alt="Black Logo"
                className="w-full h-full p-1"
              ></img>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-text-main to-text-secondary hidden sm:block tracking-tight leading-none">
                LuckyPetStore
                <span className="text-primary">Management</span>
              </h1>
              {user && (
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  {user.name}
                </span>
              )}
            </div>
          </div>

          {/* Portal Target for Dashboard Actions */}
          <div
            id="header-actions"
            className="flex-1 flex justify-end px-4"
          ></div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl transition-all duration-300 group"
            title="Keluar Aplikasi"
          >
            <span className="font-bold text-sm hidden sm:inline">Keluar</span>
            <ArrowRightOnRectangleIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 mt-20">
        {children}
      </main>
    </div>
  );
}
