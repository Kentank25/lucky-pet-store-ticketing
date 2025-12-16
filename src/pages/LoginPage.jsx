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
    <div className="min-h-screen w-full flex overflow-hidden bg-bg-canvas relative">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-160 h-160 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse-soft"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-160 h-160 bg-rose-500/20 rounded-full blur-[100px] animate-pulse-soft delay-700"></div>
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-7xl mx-auto flex z-10 relative">
        {/* Left Side - Hero/Branding (Hidden on mobile) */}
        <div className="hidden lg:flex w-1/2 flex-col justify-center p-12 lg:p-20">
          <div className="space-y-8">
            <div className="w-24 h-24 bg-linear-to-tr from-indigo-500 to-purple-500 rounded-3xl shadow-2xl shadow-indigo-500/30 flex items-center justify-center animate-float">
              <img
                src="/Lucky Pet Store Logo (Black).png"
                alt="Logo"
                className="w-full h-full object-cover p-2 opacity-90 invert dark:invert-0"
              />
            </div>
            <div>
              <h1 className="text-5xl lg:text-6xl font-black text-text-main tracking-tight leading-[1.1]">
                Manage like a <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-purple-500">
                  Pro.
                </span>
              </h1>
              <p className="mt-6 text-lg text-text-muted max-w-md leading-relaxed">
                Streamline pet shop operations with our all-in-one management
                dashboard.
              </p>
            </div>

            {/* Abstract Decor Cards */}
            <div className="flex gap-4 pt-4">
              <div className="glass-panel p-4 rounded-2xl flex items-center gap-3 animate-fade-in delay-200">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                  ✨
                </div>
                <div className="text-sm font-bold text-text-secondary">
                  Smart Queue
                </div>
              </div>
              <div className="glass-panel p-4 rounded-2xl flex items-center gap-3 animate-fade-in delay-300">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                  📊
                </div>
                <div className="text-sm font-bold text-text-secondary">
                  Live Analytics
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="glass-panel w-full max-w-md p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 border-white/40 dark:border-white/5 animate-scale-in">
            <div className="lg:hidden text-center mb-10">
              <div className="w-16 h-16 bg-linear-to-tr from-indigo-500 to-purple-500 rounded-2xl shadow-lg shadow-indigo-500/30 mx-auto flex items-center justify-center animate-float mb-6">
                <img
                  src="/Lucky Pet Store Logo (Black).png"
                  alt="Logo"
                  className="w-full h-full object-cover p-1 opacity-90 invert dark:invert-0"
                />
              </div>
              <h1 className="text-2xl font-black text-text-main">
                Lucky Pet Store
              </h1>
              <p className="text-sm text-text-muted mt-2">
                Sign in to your account
              </p>
            </div>

            <div className="hidden lg:block mb-10">
              <h2 className="text-2xl font-bold text-text-main">
                Welcome Back! 👋
              </h2>
              <p className="text-text-muted mt-2">
                Enter your credentials to access the dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">
                  Username
                </label>
                <div className="group relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`input-minimal pl-12 pr-4 py-4 rounded-2xl transition-all ${
                      errors.email
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : ""
                    }`}
                    placeholder="Enter username"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
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
                  <p className="text-red-500 text-xs font-bold ml-1 animate-pulse">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Password
                  </label>
                  <a
                    href="https://wa.me/6281286422525"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-primary hover:text-indigo-700 transition-colors"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="group relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`input-minimal pl-12 pr-4 py-4 rounded-2xl transition-all ${
                      errors.password
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : ""
                    }`}
                    placeholder="••••••••"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
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
                  <p className="text-red-500 text-xs font-bold ml-1 animate-pulse">
                    {errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 rounded-2xl flex justify-center items-center gap-2 mt-8 text-base shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
