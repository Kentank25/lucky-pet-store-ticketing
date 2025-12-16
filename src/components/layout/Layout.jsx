import { useAuth } from "../../context/AuthContext";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

export default function Layout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen font-sans text-text-main selection:bg-primary selection:text-white flex flex-col">
      <header className="fixed top-0 inset-x-0 glass-panel z-50 transition-all duration-300 border-none rounded-none border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-linear-to-tr from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center animate-float overflow-hidden border border-white/20">
              <img
                src="/Lucky Pet Store Logo (Black).png"
                alt="Logo"
                className="w-full h-full object-cover p-0.5 opacity-90 invert dark:invert-0"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-bg-surface-inverted to-text-secondary dark:from-white dark:to-slate-400 hidden sm:block tracking-tight leading-none">
                LuckyPetStore
                <span className="text-primary ml-1.5">Manager</span>
              </h1>
              {user && (
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
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
            className="flex items-center gap-2 px-4 py-2 bg-rose-50/50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl transition-all duration-300 group hover:shadow-lg hover:shadow-rose-500/20 active:scale-95 border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
            title="Keluar Aplikasi"
          >
            <span className="font-bold text-sm hidden sm:inline">Keluar</span>
            <ArrowRightOnRectangleIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      <main className="container-padded py-8 sm:py-12 mt-20 flex-1 relative z-10">
        {children}
      </main>
    </div>
  );
}
