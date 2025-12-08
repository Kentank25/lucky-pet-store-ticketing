import { useState, useEffect } from "react";
import { addTicket, updateTicketDetails } from "../../services/ticketService";
import { useRole } from "../../context/RoleContext";
import toast from "react-hot-toast";
import { SERVICE_TYPE, TICKET_STATUS } from "../../constants";
import { ticketSchema } from "../../utils/validationSchemas"; // Zod imports
import { FaCut, FaStethoscope } from "react-icons/fa";
import { FiArrowRight, FiChevronDown, FiAlertTriangle } from "react-icons/fi";

export default function TicketForm({ ticketToEdit, onCancel, className = "" }) {
  const { role } = useRole();
  const [formData, setFormData] = useState({
    nama: "",
    telepon: "",
    layanan: SERVICE_TYPE.GROOMING,
    tanggalRilis: new Date().toISOString().split("T")[0],
    jam: "",
    catatan: "",
  });
  const [loading, setLoading] = useState(false);
  const [isExpress, setIsExpress] = useState(false);
  const [errors, setErrors] = useState({}); // Zod errors state

  useEffect(() => {
    if (ticketToEdit) {
      setFormData({
        nama: ticketToEdit.nama,
        telepon: ticketToEdit.telepon || "",
        layanan: ticketToEdit.layanan,
        tanggalRilis: ticketToEdit.tanggalRilis,
        jam: ticketToEdit.jam || "",
        catatan: ticketToEdit.catatan || "",
      });
    }
  }, [ticketToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isGuest = !role; // If no role context, assume guest/public kiosk

    // Clean up data
    const cleanedFormData = {
      ...formData,
      catatan: formData.catatan.trim(),
      kontak: formData.telepon,
      nama: formData.nama.trim(),
    };

    // Zod Validation
    const validationResult = ticketSchema.safeParse(cleanedFormData);

    if (!validationResult.success) {
      const formatted = validationResult.error.flatten();
      const fieldErrors = {};
      Object.keys(formatted.fieldErrors).forEach((key) => {
        if (formatted.fieldErrors[key]?.length > 0) {
          fieldErrors[key] = formatted.fieldErrors[key][0];
        }
      });
      setErrors(fieldErrors);
      setLoading(false);
      toast.error("Mohon lengkapi data dengan benar");
      return;
    }

    setErrors({}); // Clear errors

    try {
      if (ticketToEdit) {
        await updateTicketDetails(
          ticketToEdit.id,
          cleanedFormData,
          ticketToEdit
        );
        toast.success("Tiket berhasil diperbarui");
        if (onCancel) onCancel();
      } else {
        // Create Logic
        const newStatus = isGuest
          ? TICKET_STATUS.PENDING
          : isExpress
          ? TICKET_STATUS.ACTIVE
          : null;

        await addTicket(
          cleanedFormData,
          role || "guest", // Pass 'guest' if role is null
          newStatus
        );

        toast.success(
          isGuest
            ? "Antrian berhasil dibuat! Mohon tunggu konfirmasi admin."
            : "Tiket berhasil dibuat"
        );

        // Reset Form
        setFormData({
          ...formData,
          nama: "",
          telepon: "",
          jam: "",
          catatan: "",
        });
        setIsExpress(false);
      }
    } catch (error) {
      toast.error("Gagal menyimpan tiket");
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
        slots.push(`${i.toString().padStart(2, "0")}:00`);
      }
    } else {
      startHour = 9;
      endHour = 15; // 09:00 - 15:00 (Grooming)
      for (let i = startHour; i < endHour; i++) {
        slots.push(`${i.toString().padStart(2, "0")}:00`);
        slots.push(`${i.toString().padStart(2, "0")}:30`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots(formData.layanan);

  // Kiosk/Guest Accessibility Tweaks
  const isKiosk = role === "kiosk" || !role; // Treat guest as kiosk UI
  const inputClass = isKiosk
    ? "w-full px-5 py-4 md:px-8 md:py-5 bg-gray-50 border-2 border-transparent focus:border-blue-200 rounded-2xl md:rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-100 text-gray-800 placeholder-gray-400 transition-all font-bold text-lg md:text-xl"
    : "w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 text-gray-800 placeholder-gray-400 transition-all font-bold";

  const labelClass = isKiosk
    ? "block text-base md:text-lg font-bold text-gray-600 mb-2 md:mb-3 ml-2"
    : "block text-sm font-bold text-gray-600 mb-2 ml-1";

  const buttonClass = isKiosk
    ? "flex-1 bg-gray-900 text-white py-4 md:py-6 px-6 md:px-8 rounded-2xl md:rounded-3xl hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-xl md:text-2xl shadow-xl shadow-gray-200 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
    : "flex-1 bg-gray-900 text-white py-4 px-6 rounded-2xl hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-lg shadow-xl shadow-gray-200 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2";

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      {/* Header is handled by parent or hidden if not needed */}

      <div className={isKiosk ? "space-y-6 md:space-y-8" : "space-y-5"}>
        <div>
          <label className={labelClass}>Nama Pelanggan / Hewan</label>
          <input
            type="text"
            required
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            className={`${inputClass} ${
              errors.nama ? "border-red-500 ring-2 ring-red-200" : ""
            }`}
            placeholder="Contoh: Budi / Mochi"
          />
          {errors.nama && (
            <p className="text-red-500 text-sm mt-1 font-bold ml-2">
              {errors.nama}
            </p>
          )}
        </div>

        <div>
          <label className={labelClass}>Nomor Telepon</label>
          <input
            type="tel"
            inputMode="numeric"
            required
            value={formData.telepon || ""}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setFormData({ ...formData, telepon: val });
            }}
            className={`${inputClass} tracking-wider ${
              errors.kontak ? "border-red-500 ring-2 ring-red-200" : ""
            }`}
            placeholder="08xxxxxxxxxx"
          />
          {errors.kontak && (
            <p className="text-red-500 text-sm mt-1 font-bold ml-2">
              {errors.kontak}
            </p>
          )}
        </div>

        <div>
          <label className={labelClass}>Layanan</label>
          {isKiosk ? (
            <div className="flex flex-col sm:flex-row gap-4">
              {[
                {
                  value: SERVICE_TYPE.GROOMING,
                  label: "Grooming",
                  icon: <FaCut />,
                  color: "blue",
                },
                {
                  value: SERVICE_TYPE.KLINIK,
                  label: "Klinik",
                  icon: <FaStethoscope />,
                  color: "rose",
                },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, layanan: option.value })
                  }
                  className={`flex-1 p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all font-bold text-lg md:text-xl flex flex-row sm:flex-col items-center justify-center sm:justify-start gap-3 md:gap-2 ${
                    formData.layanan === option.value
                      ? `bg-${option.color}-50 border-${option.color}-500 text-${option.color}-700 shadow-lg ring-4 ring-${option.color}-100`
                      : "bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-3xl md:text-4xl block mb-0 md:mb-2">
                    {option.icon}
                  </span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="relative">
              <select
                value={formData.layanan}
                onChange={(e) =>
                  setFormData({ ...formData, layanan: e.target.value })
                }
                disabled={!!ticketToEdit}
                className={`${inputClass} appearance-none cursor-pointer disabled:opacity-60`}
              >
                <option value={SERVICE_TYPE.GROOMING}>Grooming</option>
                <option value={SERVICE_TYPE.KLINIK}>Klinik</option>
              </select>
              <div
                className={`absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 ${
                  isKiosk ? "text-xl" : ""
                }`}
              >
                <FiChevronDown />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className={labelClass}>Tanggal & Jam</label>
          <div className={isKiosk ? "flex flex-col gap-4" : "flex gap-4"}>
            <input
              type="date"
              value={formData.tanggalRilis}
              onChange={(e) =>
                setFormData({ ...formData, tanggalRilis: e.target.value })
              }
              disabled={!!ticketToEdit}
              className={`${inputClass} ${
                isKiosk ? "w-full" : "w-2/3"
              } disabled:opacity-60`}
            />

            {isKiosk ? (
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2 md:gap-3 bg-gray-50 p-3 md:p-4 rounded-3xl border border-gray-100">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setFormData({ ...formData, jam: slot })}
                    className={`py-2 md:py-3 rounded-xl md:rounded-2xl font-bold text-base md:text-lg transition-all ${
                      formData.jam === slot
                        ? "bg-gray-900 text-white shadow-lg scale-105"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
                {timeSlots.length === 0 && (
                  <p className="col-span-4 text-center text-gray-400 py-4">
                    Pilih layanan terlebih dahulu
                  </p>
                )}
              </div>
            ) : (
              <div className="relative w-1/3">
                <select
                  value={formData.jam}
                  onChange={(e) =>
                    setFormData({ ...formData, jam: e.target.value })
                  }
                  disabled={!!ticketToEdit}
                  required
                  className={`${inputClass} appearance-none cursor-pointer disabled:opacity-60`}
                >
                  <option value="">Jam</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                <div
                  className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs ${
                    isKiosk ? "text-base right-6" : ""
                  }`}
                >
                  <FiChevronDown />
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className={labelClass}>Catatan (Opsional)</label>
          <textarea
            value={formData.catatan}
            onChange={(e) =>
              setFormData({ ...formData, catatan: e.target.value })
            }
            className={`${inputClass} resize-none font-medium`}
            placeholder={
              formData.layanan === SERVICE_TYPE.GROOMING
                ? "Contoh: Mandi Kutu, Potong Kuku..."
                : "Contoh: Muntah, Diare, Lemas..."
            }
            rows={isKiosk ? "4" : "3"}
          />
        </div>

        {/* Express Ticket Option (Admin Only) */}
        {role === "admin" && !ticketToEdit && (
          <div className="flex items-center gap-3 bg-red-50 p-4 rounded-xl border border-red-100">
            <input
              type="checkbox"
              id="express"
              checked={isExpress}
              onChange={(e) => setIsExpress(e.target.checked)}
              className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300 cursor-pointer"
            />
            <label htmlFor="express" className="cursor-pointer select-none">
              <span className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <FiAlertTriangle className="text-red-500" /> Emergency Ticket
                (Langsung Aktif)
              </span>
              <span className="block text-xs text-gray-500">
                Lewati proses validasi (untuk kondisi darurat).
              </span>
            </label>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading} className={buttonClass}>
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                {ticketToEdit
                  ? "Update Tiket"
                  : role === "kiosk"
                  ? "Ambil Antrian"
                  : "Simpan Tiket"}
                {!ticketToEdit && <FiArrowRight />}
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
