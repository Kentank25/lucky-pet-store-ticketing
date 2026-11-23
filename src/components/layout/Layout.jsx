import { useAuth } from "../../context/AuthContext";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import ThemeToggle from "../common/ThemeToggle";

const ROLE_LABELS = {
  admin: "Admin",
  pic_grooming: "PIC Grooming",
  pic_klinik: "PIC Klinik",
  kiosk: "Kiosk",
};

export default function Layout({ children }) {
  const { user, role, logout } = useAuth();
  const resolvedRole = role || user?.role;
  const roleLabel = ROLE_LABELS[resolvedRole] || resolvedRole;

  return (
    <div className="flex min-h-screen flex-col font-sans text-text-main selection:bg-primary selection:text-white">
      <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-teal-700/20 bg-[#0D9488] shadow-xs">
              <img
                src="/Lucky Pet Store Logo (Black).png"
                alt="Lucky Pet Store"
                className="h-full w-full object-cover p-0.5 invert"
              />
            </div>
            <div className="flex min-w-0 items-center gap-2.5">
              <p className="truncate font-heading text-base font-bold tracking-tight text-text-main sm:text-lg">
                LuckyPetStore
                <span className="ml-1 text-primary">Manager</span>
              </p>
              {user && (
                <div className="hidden items-center gap-1.5 rounded-full border border-border-subtle bg-bg-subtle px-2.5 py-0.5 text-xs font-semibold text-text-secondary sm:inline-flex">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                  />
                  <span className="max-w-32 truncate text-text-main">
                    {user.name || user.email}
                  </span>
                  {roleLabel && (
                    <span className="border-l border-border-main pl-1.5 text-[11px] font-medium text-text-muted">
                      {roleLabel}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div id="header-actions" className="empty:hidden" />
            <ThemeToggle />
            <button
              type="button"
              onClick={logout}
              className="inline-flex min-h-10 min-w-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/70"
              aria-label="Keluar Aplikasi"
              title="Keluar Aplikasi"
            >
              <span className="hidden sm:inline">Keluar</span>
              <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
