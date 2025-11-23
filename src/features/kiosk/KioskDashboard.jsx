import TicketForm from '../../components/tickets/TicketForm';

export default function KioskDashboard() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 md:p-8">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        
        {/* Welcome Card - Bento Style */}
        <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-[2.5rem] p-8 md:p-12 text-white flex flex-col justify-between shadow-2xl shadow-indigo-200 relative overflow-hidden group">
          {/* Decorative Circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mb-8 text-4xl shadow-inner border border-white/10">
              🐾
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight tracking-tight">
              Selamat Datang <br/> di Pet Shop!
            </h2>
            <p className="text-indigo-100 text-lg md:text-xl font-medium opacity-90 leading-relaxed max-w-md">
              Silakan ambil antrian untuk layanan <span className="text-white font-bold">Grooming</span> atau <span className="text-white font-bold">Klinik</span> kesayangan Anda.
            </p>
          </div>

          <div className="relative z-10 mt-12 flex items-center gap-3 opacity-60">
             <div className="h-1.5 w-12 bg-white rounded-full"></div>
             <div className="h-1.5 w-2 bg-white rounded-full"></div>
             <div className="h-1.5 w-2 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Form Container - Glass/Clean Style */}
        <div className="flex flex-col justify-center">
           <TicketForm />
        </div>
      </div>
    </div>
  );
}
