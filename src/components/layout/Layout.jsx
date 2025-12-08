import { useRole } from "../../context/RoleContext";

export default function Layout({ children }) {
  const { role, user, logout } = useRole();

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      <header className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-xl border-b border-gray-200 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-tr from-blue-600 to-blue-400 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center text-xl animate-float">
              🐾
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-800 to-gray-600 hidden sm:block tracking-tight leading-none">
                PetShop<span className="text-blue-500">Manager</span>
              </h1>
              {user && (
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
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
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all duration-300 group"
            title="Keluar Aplikasi"
          >
            <span className="font-bold text-sm hidden sm:inline">Keluar</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 mt-20">
        {children}
      </main>
    </div>
  );
}
