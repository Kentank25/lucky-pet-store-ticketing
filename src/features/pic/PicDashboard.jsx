import TicketList from '../../components/tickets/TicketList';
import { useTickets } from '../../hooks/useTickets';
import { useRole } from '../../context/RoleContext';

export default function PicDashboard() {
  const { tickets, loading } = useTickets();
  const { role } = useRole();
  
  const service = role === 'pic_grooming' ? 'Grooming' : 'Klinik';
  const isGrooming = service === 'Grooming';

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

  // PIC only sees WAITING/aktif tickets for their service
  const myTickets = tickets.filter(t => 
    (t.status === 'WAITING' || t.status === 'aktif') && 
    t.layanan === service
  );

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header Card */}
      <div className={`mb-10 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden ${
        isGrooming 
          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-200' 
          : 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-200'
      }`}>
        {/* Decorative Circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2 opacity-90">
               <span className="text-2xl">{isGrooming ? '✂️' : '🩺'}</span>
               <span className="font-medium tracking-wide uppercase text-sm">Dashboard PIC</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Layanan {service}</h2>
            <p className="text-white/80 text-lg">Kelola antrian aktif untuk pelanggan Anda.</p>
          </div>
          
          <div className="bg-white/20 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-center min-w-[100px]">
            <span className="text-4xl font-bold">{myTickets.length}</span>
            <span className="text-xs font-medium uppercase tracking-wider opacity-80">Antrian</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
           <h3 className="text-xl font-bold text-gray-700">Daftar Tugas</h3>
           <span className="text-sm text-gray-400">Terbaru di atas</span>
        </div>
        
        {myTickets.length > 0 ? (
           <TicketList tickets={myTickets} />
        ) : (
          <div className="text-center py-16 bg-white rounded-[2rem] border border-dashed border-gray-200">
             <div className="text-6xl mb-4 opacity-20">😴</div>
             <p className="text-gray-500 font-medium">Tidak ada antrian saat ini.</p>
             <p className="text-gray-400 text-sm">Nikmati waktu istirahat Anda!</p>
          </div>
        )}
      </div>
    </div>
  );
}
