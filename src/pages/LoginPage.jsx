import { useState } from 'react';
import { useRole } from '../context/RoleContext';

export default function LoginPage() {
  const { login } = useRole();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const success = login(username, password);
    if (!success) setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-100 border border-white w-full max-w-md relative overflow-hidden animate-fade-in">
        
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-purple-50 rounded-full blur-3xl opacity-50"></div>

        <div className="relative z-10">
            <div className="text-center mb-8">
                <img src="/src/assets/Lucky Pet Store Logo (Black).png" className="w-20 h-20 mx-auto mb-4 block object-contain" alt="Logo" />
                <h1 className="text-3xl font-black text-gray-800 tracking-tight">Login Portal</h1>
                <p className="text-gray-400 font-medium">Masuk untuk mengelola tiket</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Username</label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-gray-700"
                        placeholder="Masukkan username..."
                        required 
                    />
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Password</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-gray-700"
                        placeholder="••••••••"
                        required 
                    />
                </div>

                <div className="pt-4">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Memproses...</span>
                            </>
                        ) : (
                            <span>Masuk Aplikasi</span>
                        )}
                    </button>
                    
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-400">
                            Lupa password? Hubungi Administrator.
                        </p>
                    </div>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}
