import { useState, useEffect } from 'react';
import { addTicket, updateTicketDetails } from '../../services/ticketService';
import { useRole } from '../../context/RoleContext';
import toast from 'react-hot-toast';

export default function TicketForm({ ticketToEdit, onCancel }) {
  const { role } = useRole();
  const [formData, setFormData] = useState({
    nama: '',
    layanan: 'Grooming',
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
    try {
      if (ticketToEdit) {
        await updateTicketDetails(ticketToEdit.id, formData, ticketToEdit);
        toast.success('Tiket berhasil diperbarui');
        if (onCancel) onCancel();
      } else {
        await addTicket(formData, role);
        toast.success(role === 'kiosk' ? 'Antrian berhasil diambil!' : 'Tiket berhasil dibuat');
        setFormData({ ...formData, nama: '', jam: '' }); 
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

    if (service === 'Klinik') {
      startHour = 9;
      endHour = 18; // 09:00 - 18:00
    } else {
      startHour = 9;
      endHour = 15; // 09:00 - 15:00 (Grooming)
    }

    for (let i = startHour; i < endHour; i++) {
      const time = `${i.toString().padStart(2, '0')}:00`;
      slots.push(time);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots(formData.layanan);

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-white/50 relative overflow-hidden">
      {/* Decorative background blob */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[4rem] -z-0 opacity-50"></div>

      <h3 className="text-2xl font-bold mb-8 text-gray-800 relative z-10">
        {ticketToEdit ? 'Edit Tiket' : role === 'kiosk' ? 'Ambil Antrian' : 'Buat Tiket Baru'}
      </h3>
      
      <div className="space-y-6 relative z-10">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2 ml-1">Nama Pelanggan / Hewan</label>
          <input
            type="text"
            required
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 text-gray-800 placeholder-gray-400 transition-all font-medium"
            placeholder="Contoh: Budi / Mochi"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2 ml-1">Layanan</label>
          <div className="relative">
            <select
              value={formData.layanan}
              onChange={(e) => setFormData({ ...formData, layanan: e.target.value })}
              disabled={!!ticketToEdit} 
              className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 text-gray-800 appearance-none font-medium disabled:opacity-60"
            >
              <option value="Grooming">✂️ Grooming</option>
              <option value="Klinik">🩺 Klinik</option>
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              ▼
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2 ml-1">Tanggal & Jam</label>
          <div className="flex gap-3">
            <input
              type="date"
              value={formData.tanggalRilis}
              onChange={(e) => setFormData({ ...formData, tanggalRilis: e.target.value })}
              disabled={!!ticketToEdit}
              className="w-2/3 px-6 py-4 bg-gray-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 text-gray-800 font-medium disabled:opacity-60"
            />
            <div className="relative w-1/3">
              <select
                value={formData.jam}
                onChange={(e) => setFormData({ ...formData, jam: e.target.value })}
                disabled={!!ticketToEdit}
                required
                className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 text-gray-800 appearance-none font-medium disabled:opacity-60"
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
          <label className="block text-sm font-semibold text-gray-600 mb-2 ml-1">Catatan (Opsional)</label>
          <textarea
            value={formData.catatan}
            onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 text-gray-800 placeholder-gray-400 transition-all font-medium resize-none"
            placeholder={formData.layanan === 'Grooming' ? "Contoh: Mandi Kutu, Potong Kuku..." : "Contoh: Muntah, Diare, Lemas..."}
            rows="3"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gray-900 text-white py-4 px-6 rounded-2xl hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-lg shadow-lg shadow-gray-200 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? 'Menyimpan...' : ticketToEdit ? 'Update' : role === 'kiosk' ? 'Ambil Antrian ➔' : 'Simpan'}
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
