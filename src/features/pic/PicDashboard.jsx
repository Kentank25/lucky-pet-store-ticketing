import TicketList from '../../components/tickets/TicketList';
import { useTickets } from '../../hooks/useTickets';
import { useRole } from '../../context/RoleContext';
import { updateTicketStatus } from '../../services/ticketService';
import toast from 'react-hot-toast';

export default function PicDashboard() {
  const { tickets, loading } = useTickets();
  const { role } = useRole();
  
  const service = role === 'pic_grooming' ? 'Grooming' : 'Klinik';
  const isGrooming = service === 'Grooming';

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

  // Filter tickets
  const activeTickets = tickets.filter(t => t.status === 'aktif' && t.layanan === service);
  
  // Get waiting tickets and sort by date ascending (Oldest first) - FIFO
  const waitingTickets = tickets
    .filter(t => t.status === 'WAITING' && t.layanan === service)
    .sort((a, b) => {
      const timeA = a.jam || '00:00';
      const timeB = b.jam || '00:00';
      const dateA = new Date(`${a.tanggalRilis}T${timeA}`);
      const dateB = new Date(`${b.tanggalRilis}T${timeB}`);
      return dateA - dateB;
    });

  const completedCount = tickets.filter(t => 
    (t.status === 'COMPLETED' || t.status === 'PAYMENT') && 
    t.layanan === service
  ).length;

  const handleTakeTicket = async () => {
    if (waitingTickets.length === 0) return;
    const nextTicket = waitingTickets[0];
    
    if (!confirm(`Ambil antrian untuk ${nextTicket.nama}?`)) return;

    try {
      await updateTicketStatus(nextTicket.id, 'aktif', 'Tiket diambil oleh PIC.', nextTicket);
      toast.success(`Berhasil mengambil antrian: ${nextTicket.nama}`);
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengambil tiket.');
    }
  };

  const handleCompleteTicket = async (ticket) => {
    if (!confirm('Apakah layanan sudah selesai? Lanjut ke pembayaran?')) return;
    try {
      await updateTicketStatus(ticket.id, 'PAYMENT', 'Layanan selesai. Menunggu pembayaran.', ticket);
      toast.success('Layanan selesai!');
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengupdate status.');
    }
  };

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
            <span className="text-4xl font-bold">{completedCount}</span>
            <span className="text-xs font-medium uppercase tracking-wider opacity-80 text-center">Selesai</span>
          </div>
        </div>
      </div>

      {/* Queue Status Card */}
      <div className="mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                   waitingTickets.length > 0 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'
                }`}>
                   ⏳
                </div>
                <div>
                   <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Sisa Antrian</p>
                   <h3 className="text-2xl font-bold text-gray-800">{waitingTickets.length} Pelanggan</h3>
                </div>
            </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        
        {/* Active Ticket Section */}
        {activeTickets.length > 0 && (
          <div className="mb-8">
             <div className="flex items-center justify-between px-4 mb-4">
                <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                  Sedang Dikerjakan
                </h3>
             </div>
             
             {/* Custom Active Ticket Card */}
             {activeTickets.map(ticket => (
               <div key={ticket.id} className="bg-white rounded-3xl shadow-lg shadow-gray-100 border border-gray-100 p-8 min-h-[300px] flex flex-col justify-between relative overflow-hidden animate-fade-in">
                  {/* Decorative background */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full -mr-8 -mt-8 z-0"></div>
                  
                  <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                          <div>
                              <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-2 ${
                                  isGrooming ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                              }`}>
                                  {ticket.layanan}
                              </span>
                              <h2 className="text-4xl font-bold text-gray-800">{ticket.nama}</h2>
                              <p className="text-gray-400 font-mono mt-1">#{ticket.id.slice(-6)}</p>
                          </div>
                          <div className="text-right">
                               <div className="text-sm text-gray-500 font-medium mb-1">Waktu Masuk</div>
                               <div className="text-xl font-bold text-gray-700">{ticket.jam || '-'}</div>
                          </div>
                      </div>

                      {ticket.catatan && (
                          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6">
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Catatan Pelanggan</h4>
                              <p className="text-gray-700 text-lg italic whitespace-pre-wrap">"{ticket.catatan}"</p>
                          </div>
                      )}
                  </div>

                  <div className="relative z-10 mt-auto pt-6 border-t border-gray-100">
                      <button 
                          onClick={() => handleCompleteTicket(ticket)}
                          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                      >
                          <span>Selesaikan Layanan</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                      </button>
                  </div>
               </div>
             ))}
          </div>
        )}

        {/* Action Section: Take Ticket */}
        {activeTickets.length === 0 && waitingTickets.length > 0 && (
          <div className="mb-8">
             <div className="flex items-center justify-between px-4 mb-4">
                <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                  Menunggu Tindakan
                </h3>
             </div>
             
             <div className="bg-white rounded-3xl shadow-lg shadow-gray-100 border border-gray-100 p-8 flex flex-col items-center justify-center text-center min-h-[300px] animate-fade-in hover:shadow-xl transition-shadow duration-300">
                 <div className="text-6xl mb-6">🎫</div>
                 <h3 className="text-2xl font-bold text-gray-800 mb-2">Antrian Tersedia</h3>
                 <p className="text-gray-500 mb-8 text-center max-w-md">
                   Ada pelanggan yang menunggu layanan Anda.
                 </p>
                 <button 
                    onClick={handleTakeTicket}
                    className={`px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-xl hover:scale-105 transition-transform flex items-center gap-3 ${
                      isGrooming ? 'bg-blue-600 shadow-blue-200' : 'bg-rose-600 shadow-rose-200'
                    }`}
                 >
                    <span>Ambil Antrian Berikutnya</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                 </button>
             </div>
          </div>
        )}

        {/* Empty State */}
        {activeTickets.length === 0 && waitingTickets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[2rem] border border-dashed border-gray-200 shadow-sm min-h-[300px]">
             <div className="text-6xl mb-4 opacity-20">😴</div>
             <p className="text-gray-500 font-medium">Tidak ada antrian saat ini.</p>
             <p className="text-gray-400 text-sm">Nikmati waktu istirahat Anda!</p>
          </div>
        )}
      </div>
    </div>
  );
}
