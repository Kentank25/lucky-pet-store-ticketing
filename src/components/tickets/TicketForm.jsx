import { useState, useEffect } from 'react';
import { addTicket, updateTicketDetails } from '../../services/ticketService';
import { useRole } from '../../context/RoleContext';
import toast from 'react-hot-toast';
import { SERVICE_TYPE } from '../../constants';

export default function TicketForm({ ticketToEdit, onCancel, className = '' }) {
  const { role } = useRole();
  const [formData, setFormData] = useState({
    nama: '',
    layanan: SERVICE_TYPE.GROOMING,
    tanggalRilis: new Date().toISOString().split('T')[0],
    jam: '',
    catatan: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ticketToEdit) {
      setFormData({
        nama: ticketToEdit.nama,
        layanan: ticketToEdit.layanan,
        tanggalRilis: ticketToEdit.tanggalRilis,
        jam: ticketToEdit.jam || '',
        catatan: ticketToEdit.catatan || '',
      });
    }
  }, [ticketToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Clean up catatan to remove trailing newlines/spaces
    const cleanedFormData = {
      ...formData,
      catatan: formData.catatan.trim()
    };

    try {
      if (ticketToEdit) {
        await updateTicketDetails(ticketToEdit.id, cleanedFormData, ticketToEdit);
        toast.success('Tiket berhasil diperbarui');
        if (onCancel) onCancel();
      } else {
        await addTicket(cleanedFormData, role);
        toast.success(role === 'kiosk' ? 'Antrian berhasil diambil!' : 'Tiket berhasil dibuat');
        setFormData({ ...formData, nama: '', jam: '', catatan: '' }); 
      }
    } catch (error) {
      toast.error('Gagal menyimpan tiket');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = (service) => {
    const slots = [];
    let startHour, endHour;

    if (service === SERVICE_TYPE.KLINIK) {
      startHour = 9;
      endHour = 18; // 09:00 - 18:00
      for (let i = startHour; i < endHour; i++) {
        slots.push(`${i.toString().padStart(2, '0')}:00`);
      }
    } else {
      startHour = 9;
      endHour = 15; // 09:00 - 15:00 (Grooming)
      for (let i = startHour; i < endHour; i++) {
        slots.push(`${i.toString().padStart(2, '0')}:00`);
        slots.push(`${i.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots(formData.layanan);

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      {/* Header is handled by parent or hidden if not needed */}
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-600 mb-2 ml-1">Nama Pelanggan / Hewan</label>
          <input
            type="text"
            required
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 text-gray-800 placeholder-gray-400 transition-all font-bold"
            placeholder="Contoh: Budi / Mochi"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-2 ml-1">Layanan</label>
          <div className="relative">
            <select
              value={formData.layanan}
              onChange={(e) => setFormData({ ...formData, layanan: e.target.value })}
              disabled={!!ticketToEdit} 
              className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 text-gray-800 appearance-none font-bold disabled:opacity-60 cursor-pointer"
            >
              <option value={SERVICE_TYPE.GROOMING}>✂️ Grooming</option>
              <option value={SERVICE_TYPE.KLINIK}>🩺 Klinik</option>
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              ▼
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-2 ml-1">Tanggal & Jam</label>
          <div className="flex gap-3">
            <input
              type="date"
              value={formData.tanggalRilis}
              onChange={(e) => setFormData({ ...formData, tanggalRilis: e.target.value })}
              disabled={!!ticketToEdit}
              className="w-2/3 px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 text-gray-800 font-bold disabled:opacity-60"
            />
            <div className="relative w-1/3">
              <select
                value={formData.jam}
                onChange={(e) => setFormData({ ...formData, jam: e.target.value })}
                disabled={!!ticketToEdit}
                required
                className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 text-gray-800 appearance-none font-bold disabled:opacity-60 cursor-pointer"
              >
                <option value="">Jam</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">
                ▼
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-2 ml-1">Catatan (Opsional)</label>
          <textarea
            value={formData.catatan}
            onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 text-gray-800 placeholder-gray-400 transition-all font-medium resize-none"
            placeholder={formData.layanan === SERVICE_TYPE.GROOMING ? "Contoh: Mandi Kutu, Potong Kuku..." : "Contoh: Muntah, Diare, Lemas..."}
            rows="3"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gray-900 text-white py-4 px-6 rounded-2xl hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-lg shadow-xl shadow-gray-200 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                {ticketToEdit ? 'Update Tiket' : role === 'kiosk' ? 'Ambil Antrian' : 'Simpan Tiket'}
                {!ticketToEdit && <span>➔</span>}
              </>
            )}
          </button>
          {ticketToEdit && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 font-bold transition-colors"
            >
              Batal
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
