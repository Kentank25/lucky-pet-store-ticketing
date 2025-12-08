import { useState, useEffect } from "react";
import { addTicket, updateTicketDetails } from "../../services/ticketService";
import { useRole } from "../../context/RoleContext";
import toast from "react-hot-toast";
import { SERVICE_TYPE, TICKET_STATUS } from "../../constants";
import { ticketSchema } from "../../utils/validationSchemas"; // Zod imports
import QRCode from "react-qr-code"; // Import QRCode
import { FaCut, FaStethoscope } from "react-icons/fa";
import { FiArrowRight, FiAlertTriangle } from "react-icons/fi";

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
  const [successData, setSuccessData] = useState(null); // State for success modal

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
    const isKioskMode = role === "kiosk" || isGuest;

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
        const newStatus = isKioskMode
          ? TICKET_STATUS.PENDING
          : isExpress
          ? TICKET_STATUS.ACTIVE
          : null;

        const newTicketId = await addTicket(
          cleanedFormData,
          role || "guest", // Pass 'guest' if role is null
          newStatus
        );

        if (isKioskMode) {
          setSuccessData({
            id: newTicketId,
            nama: cleanedFormData.nama,
          });
        } else {
          toast.success("Tiket berhasil dibuat");
        }

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

  // Unified UI Styles (Kiosk Style for Everyone)
  const inputClass =
    "w-full px-5 py-4 md:px-8 md:py-5 bg-gray-50 border-2 border-transparent focus:border-blue-200 rounded-2xl md:rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-100 text-gray-800 placeholder-gray-400 transition-all font-bold text-lg md:text-xl";

  const labelClass =
    "block text-base md:text-lg font-bold text-gray-600 mb-2 md:mb-3 ml-2";

  const buttonClass =
    "flex-1 bg-gray-900 text-white py-4 md:py-6 px-6 md:px-8 rounded-2xl md:rounded-3xl hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-xl md:text-2xl shadow-xl shadow-gray-200 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3";

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      {/* Header is handled by parent or hidden if not needed */}

      <div className="space-y-6 md:space-y-8">
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
          {/* Unified Service Selection (Card Style) */}
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
        </div>

        <div>
          <label className={labelClass}>Tanggal & Jam</label>
          <div className="flex flex-col gap-4">
            <input
              type="date"
              value={formData.tanggalRilis}
              onChange={(e) =>
                setFormData({ ...formData, tanggalRilis: e.target.value })
              }
              disabled={!!ticketToEdit}
              className={`${inputClass} w-full disabled:opacity-60`}
            />

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
            rows="4"
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
              <>
                <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Memproses...</span>
              </>
            ) : (
              <>
                {ticketToEdit
                  ? "Update Tiket"
                  : role === "kiosk"
                  ? "Ambil Antrian"
                  : "Simpan Tiket"}
                {!ticketToEdit && (
                  <FiArrowRight className="text-xl md:text-2xl" />
                )}
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

      {/* Success Modal for Kiosk/Guest */}
      {successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-scale-in relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-blue-500 to-purple-500"></div>

            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 animate-bounce">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h3 className="text-2xl font-black text-gray-800 mb-2">
              Berhasil!
            </h3>
            <p className="text-gray-500 mb-6 font-medium">
              Tiket untuk{" "}
              <strong className="text-gray-800">{successData.nama}</strong>{" "}
              telah dibuat.
            </p>

            <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-gray-200 inline-block mb-6">
              <QRCode
                value={`${window.location.origin}/monitor/${successData.id}`}
                size={180}
              />
            </div>

            <p className="text-xs text-gray-400 mb-8 max-w-[200px] mx-auto">
              Scan QR Code ini untuk memantau status antrian Anda secara
              real-time.
            </p>

            <button
              onClick={() => setSuccessData(null)}
              className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95"
            >
              Selesai & Tutup
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
