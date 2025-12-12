import { useState, useEffect } from "react";
import { addTicket, updateTicketDetails } from "../../services/ticketService";
import { useRole } from "../../context/RoleContext";
import toast from "react-hot-toast";
import { SERVICE_TYPE, TICKET_STATUS } from "../../constants";
import { ticketSchema } from "../../utils/validationSchemas"; // Zod imports
import { QRCode } from "react-qr-code"; // Import QRCode
import {
  ScissorsIcon,
  HeartIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function TicketForm({ ticketToEdit, onCancel, className = "" }) {
  const { role } = useRole();
  const [formData, setFormData] = useState({
    nama: "",
    telepon: "",
    layanan: SERVICE_TYPE.GROOMING,
    tanggalRilis: new Date().toLocaleDateString("en-CA"),
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

    const isGuest = !role;
    const isKioskMode = role === "kiosk" || isGuest;

    const cleanedFormData = {
      ...formData,
      catatan: formData.catatan.trim(),
      kontak: formData.telepon,
      nama: formData.nama.trim(),
    };

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

  // Modern Minimalist Styles
  const inputClass =
    "w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700 placeholder-slate-400"; // Using new minimalist input style manually or via @apply

  const labelClass = "block text-sm font-semibold text-slate-600 mb-2 ml-1";

  const buttonClass =
    "flex-1 bg-indigo-600 text-white py-3 px-6 rounded-xl hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all font-bold text-lg shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      {/* Header is handled by parent or hidden if not needed */}

      <div className="space-y-5 max-w-md mx-auto">
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
          <div className="flex gap-4">
            {[
              {
                value: SERVICE_TYPE.GROOMING,
                label: "Grooming",
                icon: <ScissorsIcon className="w-8 h-8" />,
                activeClass:
                  "bg-blue-50 border-blue-200 text-blue-600 ring-2 ring-blue-100",
              },
              {
                value: SERVICE_TYPE.KLINIK,
                label: "Klinik",
                icon: <HeartIcon className="w-8 h-8" />,
                activeClass:
                  "bg-rose-50 border-rose-200 text-rose-600 ring-2 ring-rose-100",
              },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, layanan: option.value })
                }
                className={`flex-1 p-4 rounded-2xl border transition-all font-bold text-lg flex flex-col items-center justify-center gap-2 ${
                  formData.layanan === option.value
                    ? option.activeClass
                    : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:border-slate-200"
                }`}
              >
                <span className="text-3xl mb-1">{option.icon}</span>
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

            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setFormData({ ...formData, jam: slot })}
                  className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                    formData.jam === slot
                      ? "bg-slate-800 text-white shadow-md transform scale-105"
                      : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  {slot}
                </button>
              ))}
              {timeSlots.length === 0 && (
                <p className="col-span-4 text-center text-slate-400 py-4 text-sm">
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
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />{" "}
                Emergency Ticket (Langsung Aktif)
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
                {!ticketToEdit && <ArrowRightIcon className="w-6 h-6" />}
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
