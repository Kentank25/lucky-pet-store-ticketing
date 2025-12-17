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
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-[#020617] relative overflow-hidden text-slate-900 dark:text-slate-200 transition-colors duration-500">
      {/* Aurora Background Effects - Premium Dual Theme */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Main Indigo/Blue Glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/30 dark:bg-indigo-600/30 rounded-full blur-[120px] animate-pulse-soft transition-colors duration-700"></div>
        {/* Secondary Rose/Purple Glow */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-400/30 dark:bg-rose-600/20 rounded-full blur-[120px] animate-float transition-colors duration-700"></div>
        {/* Accent Violet/Pink Glow */}
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[300px] h-[300px] bg-pink-400/30 dark:bg-violet-600/20 rounded-full blur-[100px] animate-pulse-soft delay-1000 transition-colors duration-700"></div>

        {/* Subtle Mesh Grid Texture */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] dark:opacity-[0.03]"></div>
      </div>

      <div className="w-full max-w-sm relative z-10 animate-scale-in">
        {/* Glass Card */}
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-3xl rounded-[32px] shadow-2xl shadow-indigo-100/50 dark:shadow-black/50 p-8 border border-white/40 dark:border-white/10 relative overflow-hidden group hover:border-white/60 dark:hover:border-white/20 transition-all duration-500">
          {/* Internal Glow Reflection */}
          <div className="absolute inset-0 bg-linear-to-b from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

          <div className="text-center mb-10 relative">
            <div className="w-20 h-20 bg-linear-to-tr from-indigo-500 to-violet-600 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/30 transform rotate-6 group-hover:rotate-0 group-hover:scale-105 transition-all duration-500 border border-white/20">
              <img
                src="/Lucky Pet Store Logo (Black).png"
                alt="Logo"
                className="w-12 h-12 object-contain opacity-90 dark:invert brightness-200"
              />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2 transition-colors">
              Lucky Pet Store
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium tracking-wide transition-colors">
              Secure Management Portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 dark:text-indigo-300/80 uppercase tracking-widest ml-1 transition-colors">
                Username
              </label>
              <div className="group relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 block p-4 pl-12 font-medium transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 hover:bg-white/80 dark:hover:bg-slate-950/70 hover:border-indigo-300 dark:hover:border-white/20 ${
                    errors.email
                      ? "border-red-500/80 focus:ring-red-500/30"
                      : ""
                  }`}
                  placeholder="Enter your username"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
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
                <p className="text-red-500 dark:text-red-400 text-[10px] font-bold ml-1 animate-pulse">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-indigo-300/80 uppercase tracking-widest transition-colors">
                  Password
                </label>
              </div>
              <div className="group relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 block p-4 pl-12 font-medium transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 hover:bg-white/80 dark:hover:bg-slate-950/70 hover:border-indigo-300 dark:hover:border-white/20 ${
                    errors.password
                      ? "border-red-500/80 focus:ring-red-500/30"
                      : ""
                  }`}
                  placeholder="••••••••"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
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
                <p className="text-red-500 dark:text-red-400 text-[10px] font-bold ml-1 animate-pulse">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-sm shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-3 active:scale-[0.98] border border-white/10"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>Sign In to Dashboard</span>
                )}
              </button>
            </div>

            <div className="text-center">
              <a
                href="https://wa.me/6281286422525"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-slate-500 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Forgot Password?
              </a>
            </div>
          </form>
        </div>

        {/* Footer Copyright */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-500 dark:text-slate-600 font-mono tracking-wider opacity-60 transition-colors">
            © 2024 LUCKY PET STORE. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </div>
  );
}
