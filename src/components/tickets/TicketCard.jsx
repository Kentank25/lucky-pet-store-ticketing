import { useRole } from '../../context/RoleContext';
import { updateTicketStatus } from '../../services/ticketService';
import toast from 'react-hot-toast';

export default function TicketCard({ ticket, onEdit }) {
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
  
  const isAdmin = role === 'admin';
  const isPicGrooming = role === 'pic_grooming';
  const isPicKlinik = role === 'pic_klinik';

  const canPicAct = (isPicGrooming && ticket.layanan === 'Grooming') || 
                    (isPicKlinik && ticket.layanan === 'Klinik');

  return (
    <div className={`p-4 bg-white rounded-lg shadow-sm border ${isPending ? 'border-yellow-200' : 'border-gray-200'} animate-fade-in`}>
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h3 className="font-bold text-gray-800 text-lg">{ticket.nama}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
              ticket.layanan === 'Grooming' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
            }`}>
              {ticket.layanan}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(ticket.tanggalRilis).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} {ticket.jam && `• ${ticket.jam}`}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded border ${
              isPending ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-green-50 text-green-700 border-green-200'
            }`}>
              {ticket.status}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2 font-mono">ID: {ticket.id}</p>
        </div>

        <div className="flex flex-col gap-2">
          {/* Admin Validation Actions */}
          {isAdmin && isPending && (
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusUpdate('WAITING', 'Validasi Admin: Diterima. Masuk Antrian.')}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                Terima
              </button>
              <button
                onClick={() => handleStatusUpdate('REJECTED', 'Validasi Admin: Ditolak.')}
                className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded hover:bg-red-200 transition-colors"
              >
                Tolak
              </button>
            </div>
          )}

          {/* Admin Edit/Delete Actions */}
          {isAdmin && isWaiting && (
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(ticket)}
                className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleStatusUpdate('dihapus', 'Tiket dihapus (diarsipkan) oleh Admin.')}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
              >
                Hapus
              </button>
            </div>
          )}

          {/* PIC Actions */}
          {canPicAct && isWaiting && (
            <button
              onClick={() => handleStatusUpdate('COMPLETED', `Tugas diselesaikan oleh PIC ${ticket.layanan}.`)}
              className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
            >
              Selesai
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
