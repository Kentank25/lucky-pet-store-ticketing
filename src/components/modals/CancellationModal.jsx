import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import {
  ExclamationTriangleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import Button from "../ui/Button";

const CANCELLATION_REASONS = [
  "Pelanggan Tidak Hadir (No Show)",
  "Permintaan Pelanggan",
  "Toko Tutup / Penuh",
  "Kesalahan Input",
  "Dibatalkan oleh PIC",
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

  const titleId = useId();
  const descId = useId();
  const selectId = useId();
  const customReasonId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isSubmitting) {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const finalReason = reason === "Lainnya" ? customReason.trim() : reason;
      await onConfirm(finalReason);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 text-left backdrop-blur-xs animate-fade-in"
    >
      <div className="w-full max-w-sm scale-100 overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface shadow-xl animate-scale-in dark:shadow-black/50">
        <div className="border-b border-red-200 bg-red-50 p-6 dark:border-red-900/40 dark:bg-red-950/30">
          <h3
            id={titleId}
            className="flex items-center gap-2 font-heading text-lg font-bold text-red-900 dark:text-red-200"
          >
            <ExclamationTriangleIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
            <span>Batalkan Tiket</span>
          </h3>
          <p
            id={descId}
            className="mt-1.5 text-sm text-red-800 dark:text-red-300"
          >
            Anda akan membatalkan tiket untuk{" "}
            <strong className="font-semibold text-red-950 dark:text-red-100">
              {ticketName}
            </strong>
            .
          </p>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <label
              htmlFor={selectId}
              className="mb-2 block text-sm font-semibold text-text-secondary"
            >
              Alasan Pembatalan
            </label>
            <div className="relative">
              <select
                id={selectId}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-11 w-full appearance-none rounded-xl border border-border-main bg-bg-subtle px-4 py-2.5 pr-10 text-sm font-medium text-text-main transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
              >
                {CANCELLATION_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-muted"
              >
                <ChevronDownIcon className="h-5 w-5" />
              </div>
            </div>
          </div>

          {reason === "Lainnya" && (
            <div className="animate-fade-in">
              <label
                htmlFor={customReasonId}
                className="mb-2 block text-sm font-semibold text-text-secondary"
              >
                Keterangan Tambahan
              </label>
              <textarea
                id={customReasonId}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Tulis alasan pembatalan..."
                className="min-h-20 w-full rounded-xl border border-border-main bg-bg-subtle px-4 py-2.5 text-sm text-text-main transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
                autoFocus
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={reason === "Lainnya" && !customReason.trim()}
            className="flex-1"
          >
            {isSubmitting ? "Memproses..." : "Konfirmasi"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
