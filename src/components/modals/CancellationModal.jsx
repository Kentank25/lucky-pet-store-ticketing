import { useState } from "react";
import { createPortal } from "react-dom";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const CANCELLATION_REASONS = [
  "Pelanggan Tidak Hadir (No Show)",
  "Permintaan Pelanggan",
  "Toko Tutup / Penuh",
  "Kesalahan Input",
  "Lainnya",
];

export default function CancellationModal({
  isOpen,
  onClose,
  onConfirm,
  ticketName,
}) {
  const [reason, setReason] = useState(CANCELLATION_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const finalReason = reason === "Lainnya" ? customReason : reason;
    await onConfirm(finalReason);
    setIsSubmitting(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-bg-surface rounded-4xl w-full max-w-sm shadow-2xl dark:shadow-none border border-border-subtle overflow-hidden scale-100 animate-scale-in">
        <div className="p-6 bg-rose-50 dark:bg-rose-900/20 border-b border-rose-100 dark:border-rose-900/30">
          <h3 className="text-xl font-bold text-rose-800 dark:text-rose-200 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-6 h-6" /> Batalkan Tiket
          </h3>
          <p className="text-rose-600/80 dark:text-rose-300/80 text-sm mt-1">
            Anda akan membatalkan tiket untuk{" "}
            <strong className="text-rose-900 dark:text-rose-100">
              {ticketName}
            </strong>
            .
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-text-muted mb-2">
              Alasan Pembatalan
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border-main bg-bg-subtle focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all text-text-main"
            >
              {CANCELLATION_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {reason === "Lainnya" && (
            <div className="animate-fade-in">
              <label className="block text-sm font-bold text-text-muted mb-2">
                Keterangan Tambahan
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Tulis alasan pembatalan..."
                className="w-full px-4 py-3 rounded-xl border border-border-main bg-bg-subtle text-text-main focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all min-h-[80px]"
                autoFocus
              />
            </div>
          )}
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-text-muted hover:bg-bg-subtle transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              isSubmitting || (reason === "Lainnya" && !customReason.trim())
            }
            className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 dark:shadow-none transition-all disabled:opacity-50 disabled:shadow-none"
          >
            {isSubmitting ? "Memproses..." : "Konfirmasi Pembatalan"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
