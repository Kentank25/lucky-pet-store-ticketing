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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="glass-panel p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100 border border-white w-full max-w-md relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-rose-50 rounded-full blur-3xl opacity-50"></div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <img
              src="/Lucky Pet Store Logo (Black).png"
              className="w-20 h-20 mx-auto mb-4 block object-contain"
              alt="Logo"
            />
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">
              Login Portal
            </h1>
            <p className="text-gray-400 font-medium">
              Masuk untuk mengelola tiket
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`input-minimal px-6 py-4 rounded-2xl ${
                  errors.email ? "border-red-500 focus:border-red-500" : ""
                }`}
                placeholder="Masukkan username..."
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 font-bold ml-2">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`input-minimal px-6 py-4 rounded-2xl ${
                  errors.password ? "border-red-500 focus:border-red-500" : ""
                }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 font-bold ml-2">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 rounded-2xl flex justify-center items-center gap-2"
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
                  Lupa password?{" "}
                  <a
                    href="https://wa.me/6281286422525?text=Saya%20kesulitan%20masuk%20dan%20ingin%20meminta%20bantuan%20administrator."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors cursor-pointer"
                  >
                    Hubungi Administrator.
                  </a>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
