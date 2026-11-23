import { useState } from "react";
import { Link } from "react-router-dom";
import {
  UserIcon,
  LockClosedIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { loginSchema } from "../utils/validationSchemas";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F8FAF9] text-[#0F172A] px-4 py-8">
      <div className="w-full max-w-md">
        <Card
          padding="lg"
          elevated
          className="bg-white border-[#E2E8F0] text-[#0F172A]"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#F0FDFA] border border-[#CCFBF1] mx-auto flex items-center justify-center mb-4">
              <img
                src="/Lucky Pet Store Logo (Black).png"
                alt="Lucky Pet Store Logo"
                className="w-11 h-11 object-contain"
              />
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Lucky Pet Store
            </h1>
            <p className="mt-1.5 text-sm font-medium text-[#475569]">
              Portal Manajemen Antrean &amp; Layanan
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label
                htmlFor="login-username"
                className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5"
              >
                Email / Username
              </label>
              <div className="relative">
                <UserIcon
                  aria-hidden="true"
                  className="w-5 h-5 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email ? "login-username-error" : undefined
                  }
                  placeholder="nama@luckypetstore.id"
                  className={`w-full min-h-11 rounded-xl border bg-white pl-11 pr-4 py-2.5 text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
                    errors.email
                      ? "border-[#DC2626] focus-visible:ring-[#DC2626]"
                      : "border-[#CBD5E1] hover:border-[#94A3B8] focus-visible:border-[#0D9488] focus-visible:ring-[#0D9488]"
                  }`}
                />
              </div>
              {errors.email && (
                <p
                  id="login-username-error"
                  role="alert"
                  className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#DC2626]"
                >
                  <ExclamationCircleIcon
                    aria-hidden="true"
                    className="w-4 h-4 shrink-0"
                  />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <LockClosedIcon
                  aria-hidden="true"
                  className="w-5 h-5 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "login-password-error" : undefined
                  }
                  placeholder="••••••••"
                  className={`w-full min-h-11 rounded-xl border bg-white pl-11 pr-4 py-2.5 text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
                    errors.password
                      ? "border-[#DC2626] focus-visible:ring-[#DC2626]"
                      : "border-[#CBD5E1] hover:border-[#94A3B8] focus-visible:border-[#0D9488] focus-visible:ring-[#0D9488]"
                  }`}
                />
              </div>
              {errors.password && (
                <p
                  id="login-password-error"
                  role="alert"
                  className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#DC2626]"
                >
                  <ExclamationCircleIcon
                    aria-hidden="true"
                    className="w-4 h-4 shrink-0"
                  />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            <div className="pt-1">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                {loading ? "Memproses..." : "Masuk ke Dashboard"}
              </Button>
            </div>

            <div className="text-center pt-1">
              <a
                href="https://wa.me/6281286422525"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center min-h-10 px-2 text-xs font-semibold text-[#0D9488] hover:text-[#0F766E] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
              >
                Lupa Password? Hubungi Admin
              </a>
            </div>
          </form>
        </Card>

        <footer className="mt-6 text-center space-y-2">
          <nav
            aria-label="Tautan layanan publik"
            className="flex items-center justify-center gap-4 text-xs font-semibold text-[#475569]"
          >
            <Link
              to="/kiosk"
              className="inline-flex items-center min-h-10 px-2 hover:text-[#0D9488] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
            >
              Kiosk Antrean
            </Link>
            <span aria-hidden="true" className="text-[#CBD5E1]">
              •
            </span>
            <Link
              to="/display"
              className="inline-flex items-center min-h-10 px-2 hover:text-[#0D9488] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
            >
              Layar Antrean
            </Link>
          </nav>
          <p className="text-[11px] text-[#64748B]">
            © {new Date().getFullYear()} Lucky Pet Store. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
