import { useAuth } from "../../context/AuthContext";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

export default function Layout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen font-sans text-text-main selection:bg-primary selection:text-white flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-surface shadow-sm">
        <div className="mx-auto grid min-h-16 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-3 py-2 md:min-h-20 md:grid-cols-[minmax(0,1fr)_auto_auto] md:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 shrink-0 bg-linear-to-tr from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center overflow-hidden border border-white/20">
              <img
                src="/Lucky Pet Store Logo (Black).png"
                alt="Logo"
                className="w-full h-full object-cover p-0.5 opacity-90 invert dark:invert-0"
              />
            </div>
            <div className="flex min-w-0 flex-col justify-center">
              <p className="truncate text-sm font-bold tracking-tight text-text-main lg:text-xl">
                LuckyPetStore
                <span className="text-primary ml-1.5">Manager</span>
              </p>
              {user && (
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="truncate text-text-secondary">{user.name}</span>
                </span>
              )}
            </div>
          </div>
          <div
            id="header-actions"
            className="col-span-2 row-start-2 min-w-0 empty:hidden md:col-span-1 md:col-start-2 md:row-start-1"
          ></div>

          <button
            onClick={logout}
            className="col-start-2 row-start-1 flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl bg-rose-50 px-2 text-rose-600 hover:bg-rose-100 sm:px-4 md:col-start-3 dark:bg-rose-500/10 dark:text-rose-400"
            title="Keluar Aplikasi"
          >
            <span className="font-bold text-sm hidden sm:inline">Keluar</span>
            <ArrowRightOnRectangleIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      <main className="container-padded w-full min-w-0 flex-1 py-5 sm:py-8">
        {children}
      </main>
    </div>
  );
}
