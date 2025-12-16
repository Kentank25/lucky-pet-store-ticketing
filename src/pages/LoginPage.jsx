import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { loginSchema } from "../utils/validationSchemas";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationResult = loginSchema.safeParse({
      email: username,
      password,
    });

    if (!validationResult.success) {
      const formatted = validationResult.error.flatten();
      const fieldErrors = {};

      Object.keys(formatted.fieldErrors).forEach((key) => {
        if (formatted.fieldErrors[key]?.length > 0) {
          fieldErrors[key] = formatted.fieldErrors[key][0];
        }
      });

      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const success = await login(username, password);
      if (!success) {
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50/50 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-500 opacity-20 blur-[100px]"></div>
      </div>

      <div className="w-full max-w-sm bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-200/50 p-8 border border-white/50 relative z-10 transition-all hover:shadow-indigo-500/10 hover:border-indigo-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-linear-to-tr from-indigo-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20 transform rotate-3 hover:rotate-0 transition-all duration-300">
            <img
              src="/Lucky Pet Store Logo (Black).png"
              alt="Logo"
              className="w-full h-full object-cover p-1.5 opacity-90 invert"
            />
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Selamat Datang Kembali
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Sistem Manajemen Lucky Pet Store
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Nama Pengguna
            </label>
            <div className="group relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full bg-slate-50 border border-slate-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-3 pr-4 pl-10 font-medium transition-all outline-none placeholder:text-slate-400 hover:bg-white ${
                  errors.email ? "border-red-500 focus:ring-red-200" : ""
                }`}
                placeholder="Masukkan nama pengguna"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            {errors.email && (
              <p className="text-red-500 text-[10px] font-bold ml-1 animate-pulse">
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Kata Sandi
              </label>
            </div>
            <div className="group relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-slate-50 border border-slate-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-3 pr-4 pl-10 font-medium transition-all outline-none placeholder:text-slate-400 hover:bg-white ${
                  errors.password ? "border-red-500 focus:ring-red-200" : ""
                }`}
                placeholder="••••••••"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            {errors.password && (
              <p className="text-red-500 text-[10px] font-bold ml-1 animate-pulse">
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 active:scale-95"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Mohon tunggu...</span>
              </>
            ) : (
              <span>Masuk</span>
            )}
          </button>

          <div className="text-center pt-2">
            <a
              href="https://wa.me/6281286422525"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors"
            >
              Lupa Kata Sandi?
            </a>
          </div>
        </form>
      </div>

      {/* Footer Copyright */}
      <div className="absolute bottom-6 text-center w-full z-10">
        <p className="text-[10px] text-slate-400 font-medium opacity-60">
          © 2024 Lucky Pet Store. Hak Cipta Dilindungi.
        </p>
      </div>
    </div>
  );
}
