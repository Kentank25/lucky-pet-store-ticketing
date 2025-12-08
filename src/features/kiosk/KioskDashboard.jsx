import TicketForm from "../../components/tickets/TicketForm";

export default function KioskDashboard() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 md:p-8 animate-fade-in mb-20 lg:mb-0">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Side: Welcome & Info (Visuals) */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-[2.5rem] rotate-3 opacity-20 group-hover:rotate-6 transition-transform duration-500 blur-xl"></div>

          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[2.5rem] p-8 md:p-14 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden transform transition-transform duration-500 hover:scale-[1.02]">
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-purple-500 opacity-20 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-18 md:h-18 bg-white/20 backdrop-blur-md rounded-3xl mb-8 md:mb-10 p-1 text-5xl shadow-inner border border-white/10 animate-bounce">
                <img
                  src="/src/assets/Lucky Pet Store Logo (Black).png"
                  alt="Black Logo"
                  className="w-full h-full p-1"
                ></img>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 leading-tight tracking-tight drop-shadow-sm">
                Selamat Datang <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-pink-200">
                  di Pet Shop!
                </span>
              </h2>

              <p className="text-indigo-100 text-lg md:text-xl font-medium opacity-90 leading-relaxed max-w-md mb-8 md:mb-12">
                Kami siap melayani hewan kesayangan Anda dengan sepenuh hati.
                Silakan ambil antrian.
              </p>

              {/* Service Indicators */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-3 md:p-4 rounded-2xl flex items-center gap-3 flex-1 min-w-[140px]">
                  <span className="text-2xl">✂️</span>
                  <div>
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-70">
                      Layanan
                    </p>
                    <p className="font-bold text-sm md:text-base">Grooming</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-3 md:p-4 rounded-2xl flex items-center gap-3 flex-1 min-w-[140px]">
                  <span className="text-2xl">🩺</span>
                  <div>
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-70">
                      Layanan
                    </p>
                    <p className="font-bold text-sm md:text-base">Klinik</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Container */}
        <div className="bg-white/80 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-white/50 relative">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl -z-10 opacity-50"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-100 rounded-full blur-3xl -z-10 opacity-50"></div>

          <div className="text-center mb-6 md:mb-8">
            <h3 className="text-xl md:text-2xl font-black text-gray-800 mb-2">
              Ambil Antrian Baru
            </h3>
            <p className="text-gray-500">Isi data diri Anda di bawah ini</p>
          </div>

          <TicketForm />
        </div>
      </div>
    </div>
  );
}
