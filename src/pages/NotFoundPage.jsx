import { HomeIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-rose-100 rounded-full blur-3xl opacity-50"></div>

      <div className="glass-panel p-10 md:p-16 rounded-[3rem] text-center max-w-lg w-full relative z-10 animate-fade-in shadow-2xl shadow-indigo-100">
        <img
          src="/Icon Error Page.png"
          alt="Error 404 Illustration"
          className="w-48 h-48 object-contain mb-6 drop-shadow-xl mx-auto hover:scale-105 transition-transform duration-300"
        />

        <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">
          Oops! Nyasar?
        </h1>

        <p className="text-slate-500 text-lg mb-10 leading-relaxed font-medium">
          Halaman yang Anda cari sepertinya sudah diadopsi orang lain atau
          memang tidak ada.
        </p>

        <button
          onClick={() => navigate("/", { replace: true })}
          className="btn-primary w-full md:w-auto inline-flex items-center justify-center gap-2 text-lg py-4 px-8 hover-lift"
        >
          <HomeIcon className="w-6 h-6" />
          <span>Kembali ke Beranda</span>
        </button>
      </div>
    </div>
  );
}
