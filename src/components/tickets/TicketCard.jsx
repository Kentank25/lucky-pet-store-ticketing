import { useRole } from '../../context/RoleContext';
import { updateTicketStatus } from '../../services/ticketService';
import toast from 'react-hot-toast';

export default function TicketCard({ ticket, onEdit, className = '' }) {
  const { role } = useRole();

  const handleStatusUpdate = async (newStatus, message) => {
    if (!confirm('Apakah Anda yakin?')) return;
    try {
      await updateTicketStatus(ticket.id, newStatus, message, ticket);
      toast.success('Status tiket diperbarui');
    } catch (error) {
      toast.error('Gagal memperbarui status');
      console.error(error);
    }
  };

  const isPending = ticket.status === 'PENDING';
  const isWaiting = ticket.status === 'WAITING' || ticket.status === 'aktif';
  const isPayment = ticket.status === 'PAYMENT';
  
  const isAdmin = role === 'admin';
  const isPicGrooming = role === 'pic_grooming';
  const isPicKlinik = role === 'pic_klinik';

  const canPicAct = (isPicGrooming && ticket.layanan === 'Grooming') || 
                    (isPicKlinik && ticket.layanan === 'Klinik');

  return (
    <div className={`p-6 bg-white rounded-3xl shadow-lg shadow-gray-100 border ${
      isPending ? 'border-yellow-200 bg-yellow-50/30' : 
      isPayment ? 'border-purple-200 bg-purple-50/30' :
      'border-transparent'
    } animate-fade-in hover:shadow-xl transition-shadow duration-300 ${className}`}>
      <div className="flex justify-between items-start flex-wrap gap-4 w-full">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <h3 className="font-bold text-gray-800 text-xl">{ticket.nama}</h3>
             <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              ticket.layanan === 'Grooming' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {ticket.layanan}
            </span>
          </div>
          
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 font-medium">
            <span className="flex items-center gap-1">
               📅 {new Date(ticket.tanggalRilis).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </span>
            {ticket.jam && (
                <span className="flex items-center gap-1">
                    ⏰ {ticket.jam}
                </span>
            )}
          </div>

          {ticket.catatan && (
            <div className="mt-3 bg-gray-50 p-3 rounded-xl text-sm text-gray-600 border border-gray-100">
              <span className="font-bold text-gray-400 text-xs uppercase tracking-wider block mb-1">Catatan:</span>
              {ticket.catatan}
            </div>
          )}
          
          <div className="mt-4 flex items-center gap-2">
             <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
              isPending ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
              isPayment ? 'bg-purple-100 text-purple-700 border-purple-200' :
              'bg-emerald-100 text-emerald-700 border-emerald-200'
            }`}>
              {ticket.status}
            </span>
             <p className="text-[10px] text-gray-300 font-mono uppercase tracking-wider">#{ticket.id.slice(-6)}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {/* Admin Validation Actions */}
          {isAdmin && isPending && (
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusUpdate('WAITING', 'Validasi Admin: Diterima. Masuk Antrian.')}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
              >
                Terima
              </button>
              <button
                onClick={() => handleStatusUpdate('CANCELLED', 'Validasi Admin: Ditolak.')}
                className="px-4 py-2 bg-white text-rose-600 border border-rose-100 text-sm font-bold rounded-xl hover:bg-rose-50 transition-all"
              >
                Tolak
              </button>
            </div>
          )}

          {/* Admin Payment Actions */}
          {isAdmin && isPayment && (
            <button
              onClick={() => handleStatusUpdate('COMPLETED', 'Pembayaran diterima. Tiket selesai.')}
              className="px-6 py-2 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
            >
              Konfirmasi Bayar
            </button>
          )}

          {/* Admin Edit/Delete Actions */}
          {isAdmin && isWaiting && (
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(ticket)}
                className="px-4 py-2 bg-amber-100 text-amber-700 text-sm font-bold rounded-xl hover:bg-amber-200 transition-all"
              >
                Edit
              </button>
              <button
                onClick={() => handleStatusUpdate('CANCELLED', 'Tiket dibatalkan oleh Admin.')}
                className="px-4 py-2 bg-rose-100 text-rose-700 text-sm font-bold rounded-xl hover:bg-rose-200 transition-all"
              >
                Batalkan
              </button>
            </div>
          )}

          {/* PIC Actions */}
          {canPicAct && isWaiting && (
            <button
              onClick={() => handleStatusUpdate('PAYMENT', `Layanan selesai. Menunggu pembayaran.`)}
              className="px-6 py-2 bg-emerald-500 text-white text-sm font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
            >
              Selesai
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
