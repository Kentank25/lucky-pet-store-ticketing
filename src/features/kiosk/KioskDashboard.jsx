import { useEffect } from "react";
import TicketForm from "../../components/tickets/TicketForm";
import { useTheme } from "../../context/ThemeContext";
import { ScissorsIcon, HeartIcon } from "@heroicons/react/24/outline";

export default function KioskDashboard() {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 animate-fade-in relative overflow-hidden bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white transition-colors duration-500">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/30 dark:bg-indigo-600/30 rounded-full blur-[120px] animate-pulse-soft transition-colors duration-700"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-400/30 dark:bg-rose-600/20 rounded-full blur-[120px] animate-float transition-colors duration-700"></div>
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[300px] h-[300px] bg-pink-400/30 dark:bg-violet-600/20 rounded-full blur-[100px] animate-pulse-soft delay-1000 transition-colors duration-700"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] dark:opacity-[0.03]"></div>
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch relative z-10">
        <div className="relative group h-full">
          <div className="h-full flex flex-col justify-center bg-white/60 dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-14 border border-white/40 dark:border-white/10 shadow-2xl shadow-indigo-100/50 dark:shadow-black/50 relative overflow-hidden transform transition-all duration-500 hover:scale-[1.01] group-hover:border-white/60 dark:group-hover:border-white/20">
            <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10 flex flex-col justify-center h-full">
              <div className="inline-flex items-center w-16 h-16 md:w-18 md:h-18 bg-white/40 dark:bg-white/10 backdrop-blur-md rounded-3xl mb-8 md:mb-10 p-1 text-5xl shadow-inner border border-white/20">
                <img
                  src="/Lucky Pet Store Logo (Black).png"
                  alt="Logo"
                  className="w-full h-full p-1 object-contain opacity-90 dark:invert brightness-110"
                />
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 leading-tight tracking-tight drop-shadow-sm text-slate-900 dark:text-white transition-colors">
                Selamat Datang <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-violet-600 dark:from-blue-300 dark:to-purple-300">
                  di Pet Shop!
                </span>
              </h2>

              <p className="text-slate-600 dark:text-indigo-100 text-lg md:text-xl font-medium opacity-90 leading-relaxed max-w-md mb-8 md:mb-12 transition-colors">
                Kami siap melayani hewan kesayangan Anda dengan sepenuh hati.
                Silakan ambil antrian.
              </p>

              <div className="flex flex-wrap gap-4">
                <div className="bg-white/40 dark:bg-white/10 backdrop-blur-sm border border-white/20 p-3 md:p-4 rounded-2xl flex items-center gap-3 flex-1 min-w-[140px] hover:bg-white/60 dark:hover:bg-white/20 transition-colors">
                  <ScissorsIcon className="text-2xl w-8 h-8 text-indigo-600 dark:text-indigo-300" />
                  <div>
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-70 text-slate-500 dark:text-indigo-200">
                      Layanan
                    </p>
                    <p className="font-bold text-sm md:text-base text-slate-900 dark:text-white">
                      Grooming
                    </p>
                  </div>
                </div>
                <div className="bg-white/40 dark:bg-white/10 backdrop-blur-sm border border-white/20 p-3 md:p-4 rounded-2xl flex items-center gap-3 flex-1 min-w-[140px] hover:bg-white/60 dark:hover:bg-white/20 transition-colors">
                  <HeartIcon className="text-2xl w-8 h-8 text-rose-600 dark:text-rose-300" />
                  <div>
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-70 text-slate-500 dark:text-rose-200">
                      Layanan
                    </p>
                    <p className="font-bold text-sm md:text-base text-slate-900 dark:text-white">
                      Klinik
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-full flex flex-col justify-center bg-white/60 dark:bg-white/5 backdrop-blur-3xl p-6 md:p-10 rounded-[2.5rem] relative border border-white/40 dark:border-white/10 shadow-2xl shadow-indigo-100/50 dark:shadow-black/50">
          <div className="text-center mb-6 md:mb-8">
            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2 transition-colors">
              Ambil Antrian Baru
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Isi data diri Anda di bawah ini
            </p>
          </div>

          <TicketForm isPublicKiosk={true} />
        </div>
      </div>
    </div>
  );
}
