import { useRole } from '../../context/RoleContext';

const roles = [
  { id: 'admin', label: 'Admin' },
  { id: 'kiosk', label: 'Kiosk' },
  { id: 'pic_grooming', label: 'PIC Grooming' },
  { id: 'pic_klinik', label: 'PIC Klinik' },
];

export default function Layout({ children }) {
  const { role, setRole } = useRole();

  return (
    <div className="min-h-screen bg-blue-50/50 text-gray-800 font-sans selection:bg-blue-200">
      {/* Header / Role Switcher */}
      <header className="sticky top-4 z-50 mx-4 sm:mx-8">
        <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl border border-white/40 shadow-lg shadow-blue-100/50 rounded-2xl px-4 sm:px-6 h-20 flex items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
              🐾
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 hidden sm:block tracking-tight">
              PetShop<span className="text-blue-500">Manager</span>
            </h1>
          </div>
          
          <div className="flex bg-gray-100/50 p-1.5 rounded-2xl overflow-x-auto no-scrollbar border border-gray-200/50">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 whitespace-nowrap ${
                  role === r.id
                    ? 'bg-white text-blue-600 shadow-md shadow-gray-200/50 scale-100'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {children}
      </main>
    </div>
  );
}
