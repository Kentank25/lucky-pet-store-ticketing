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
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ticketToEdit) {
      setFormData({
        nama: ticketToEdit.nama,
        layanan: ticketToEdit.layanan,
        tanggalRilis: ticketToEdit.tanggalRilis,
        jam: ticketToEdit.jam || '',
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
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold mb-4">
        {ticketToEdit ? 'Edit Tiket' : role === 'kiosk' ? 'Ambil Antrian' : 'Buat Tiket Baru'}
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pelanggan / Hewan</label>
          <input
            type="text"
            required
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Contoh: Budi / Mochi"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Layanan</label>
          <select
            value={formData.layanan}
            onChange={(e) => setFormData({ ...formData, layanan: e.target.value })}
            disabled={!!ticketToEdit} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="Grooming">Grooming</option>
            <option value="Klinik">Klinik</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal & Jam</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={formData.tanggalRilis}
              onChange={(e) => setFormData({ ...formData, tanggalRilis: e.target.value })}
              disabled={!!ticketToEdit}
              className="w-2/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <select
              value={formData.jam}
              onChange={(e) => setFormData({ ...formData, jam: e.target.value })}
              disabled={!!ticketToEdit}
              required
              className="w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">Pilih Jam</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : ticketToEdit ? 'Update' : role === 'kiosk' ? 'Ambil Antrian' : 'Simpan'}
          </button>
          {ticketToEdit && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Batal
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
