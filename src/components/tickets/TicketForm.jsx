import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { addTicket, updateTicketDetails } from "../../services/ticketService";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { SERVICE_TYPE, TICKET_STATUS } from "../../constants";
import { ticketSchema } from "../../utils/validationSchemas";
import { QRCode } from "react-qr-code";
import {
  ScissorsIcon,
  HeartIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentCheckIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { sendWhatsAppMessage } from "../../services/whatsappService";

export default function TicketForm({
  ticketToEdit,
  onCancel,
  className = "",
  isPublicKiosk = false,
}) {
  const { role } = useAuth();
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
  const [errors, setErrors] = useState({});
  const [successData, setSuccessData] = useState(null);

  const isGuest = !role;
  const isKioskMode = isPublicKiosk || role === "kiosk" || isGuest;

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

    setErrors({});

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
          role || "guest",
          newStatus
        );

        if (isKioskMode) {
          setSuccessData({
            id: newTicketId,
            nama: cleanedFormData.nama,
            telepon: cleanedFormData.telepon,
          });
        } else {
          toast.success("Tiket berhasil dibuat");
        }

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
      endHour = 18;
      for (let i = startHour; i < endHour; i++) {
        slots.push(`${i.toString().padStart(2, "0")}:00`);
      }
    } else {
      startHour = 9;
      endHour = 15;
      for (let i = startHour; i < endHour; i++) {
        slots.push(`${i.toString().padStart(2, "0")}:00`);
        slots.push(`${i.toString().padStart(2, "0")}:30`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots(formData.layanan);
  const labelClass = "block text-sm font-semibold text-text-muted mb-2 ml-1";

  const handleCopyLink = () => {
    const link = `${window.location.origin}/monitor/${successData.id}`;
    navigator.clipboard.writeText(link);
    toast.success("Link berhasil disalin!");
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("ticket-qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `Ticket-${successData.nama}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      toast.success("QR Code berhasil disimpan!");
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleSendWhatsApp = async () => {
    if (!successData?.id || !successData?.telepon) {
      toast.error("Data tidak lengkap untuk mengirim WhatsApp");
      return;
    }

    const toastId = toast.loading("Mengirim WhatsApp...");
    try {
      const link = `${window.location.origin}/monitor/${successData.id}`;
      const message = `Halo ${successData.nama},\n\nTerima kasih telah mengambil antrian di Lucky Pet Store.\n\nBerikut adalah link untuk memantau antrian Anda:\n${link}\n\nMohon simpan link ini. Terima kasih!`;

      await sendWhatsAppMessage(successData.telepon, message);
      toast.success("Pesan WhatsApp berhasil dikirim!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengirim WhatsApp. Pastikan server WAHA aktif.", {
        id: toastId,
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative ${className}`}
      noValidate
    >
      <div className="space-y-5 max-w-md mx-auto">
        <div>
          <label className={labelClass}>Nama Pelanggan / Hewan</label>
          <input
            type="text"
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            className={`input-minimal ${
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
            value={formData.telepon || ""}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setFormData({ ...formData, telepon: val });
            }}
            className={`input-minimal tracking-wider ${
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
          <div className="flex gap-4">
            {[
              {
                value: SERVICE_TYPE.GROOMING,
                label: "Grooming",
                icon: <ScissorsIcon className="w-8 h-8" />,
                activeClass:
                  "bg-blue-50 border-blue-200 text-blue-600 ring-2 ring-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300 dark:ring-blue-900/50",
              },
              {
                value: SERVICE_TYPE.KLINIK,
                label: "Klinik",
                icon: <HeartIcon className="w-8 h-8" />,
                activeClass:
                  "bg-rose-50 border-rose-200 text-rose-600 ring-2 ring-rose-100 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300 dark:ring-rose-900/50",
              },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, layanan: option.value })
                }
                className={`flex-1 p-4 rounded-2xl border transition-all font-bold text-lg flex flex-col items-center justify-center gap-2 hover:scale-105 active:scale-95 ${
                  formData.layanan === option.value
                    ? option.activeClass
                    : "bg-bg-surface border-border-subtle text-text-muted hover:bg-bg-subtle hover:border-border-main"
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
              className={`input-minimal w-full disabled:opacity-60`}
            />

            <div
              className={`grid grid-cols-3 md:grid-cols-4 gap-2 ${
                errors.jam ? "ring-2 ring-red-200 rounded-lg p-1" : ""
              }`}
            >
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setFormData({ ...formData, jam: slot })}
                  className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                    formData.jam === slot
                      ? "bg-primary text-white shadow-lg shadow-primary/30 transform scale-105 border border-primary"
                      : "bg-bg-surface text-text-secondary border border-border-subtle hover:bg-bg-subtle hover:border-border-main dark:bg-bg-subtle dark:text-text-muted dark:hover:bg-bg-muted"
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
            {errors.jam && (
              <p className="text-red-500 text-sm mt-1 font-bold ml-1">
                {errors.jam}
              </p>
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between">
            <label className={labelClass}>Catatan (Opsional)</label>
            <span
              className={`text-xs font-bold ${
                formData.catatan.length > 200
                  ? "text-red-500"
                  : "text-text-muted"
              }`}
            >
              {formData.catatan.length}/200
            </span>
          </div>
          <textarea
            value={formData.catatan}
            onChange={(e) =>
              setFormData({ ...formData, catatan: e.target.value })
            }
            className={`input-minimal resize-none font-medium ${
              errors.catatan ? "border-red-500 ring-2 ring-red-200" : ""
            }`}
            placeholder={
              formData.layanan === SERVICE_TYPE.GROOMING
                ? "Contoh: Mandi Kutu, Potong Kuku..."
                : "Contoh: Muntah, Diare, Lemas..."
            }
            rows="4"
          />
          {errors.catatan && (
            <p className="text-red-500 text-sm mt-1 font-bold ml-2">
              {errors.catatan}
            </p>
          )}
        </div>

        {role === "admin" && !isPublicKiosk && !ticketToEdit && (
          <div className="flex items-center gap-3 bg-red-50 p-4 rounded-xl border border-red-100 dark:bg-red-900/10 dark:border-red-900/30">
            <input
              type="checkbox"
              id="express"
              checked={isExpress}
              onChange={(e) => setIsExpress(e.target.checked)}
              className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300 cursor-pointer"
            />
            <label htmlFor="express" className="cursor-pointer select-none">
              <span className="font-bold text-text-main text-sm flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />{" "}
                Tiket Darurat (Langsung Aktif)
              </span>
              <span className="block text-xs text-text-muted">
                Lewati proses validasi (untuk kondisi darurat).
              </span>
            </label>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Memproses...</span>
              </>
            ) : (
              <>
                {ticketToEdit
                  ? "Update Tiket"
                  : isKioskMode
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
              className="px-6 py-4 bg-bg-subtle text-text-secondary rounded-2xl hover:bg-bg-muted font-bold transition-colors"
            >
              Batal
            </button>
          )}
        </div>
      </div>

      {successData &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-bg-surface rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-scale-in relative overflow-hidden">
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

              <h3 className="text-2xl font-black text-text-main mb-2">
                Berhasil!
              </h3>
              <p className="text-text-muted mb-6 font-medium">
                Tiket untuk{" "}
                <strong className="text-text-main">{successData.nama}</strong>{" "}
                telah dibuat.
              </p>

              <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-border-subtle inline-block mb-6">
                <QRCode
                  id="ticket-qr-code"
                  value={`${window.location.origin}/monitor/${successData.id}`}
                  size={180}
                />
              </div>

              <div className="flex gap-3 justify-center mb-6">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors font-bold text-sm"
                >
                  <ClipboardDocumentCheckIcon className="w-5 h-5" />
                  Salin Link
                </button>
                <button
                  onClick={handleSendWhatsApp}
                  className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors font-bold text-sm"
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  Kirim WA
                </button>
                <button
                  onClick={handleDownloadQR}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors font-bold text-sm"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  Simpan QR
                </button>
              </div>

              <p className="text-xs text-text-muted mb-8 max-w-[200px] mx-auto">
                Pindai Kode QR ini untuk memantau status antrian Anda secara
                real-time.
              </p>

              <button
                onClick={() => setSuccessData(null)}
                className="w-full py-4 bg-text-main text-bg-canvas font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg active:scale-95"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>,
          document.body
        )}
    </form>
  );
}
