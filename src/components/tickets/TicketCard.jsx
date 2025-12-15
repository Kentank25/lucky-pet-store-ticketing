import { useAuth } from "../../context/AuthContext";
import { updateTicketStatus } from "../../services/ticketService";
import toast from "react-hot-toast";
import { TICKET_STATUS, SERVICE_TYPE } from "../../constants";
import { useState } from "react";
import { createPortal } from "react-dom";
import CancellationModal from "../modals/CancellationModal";
import QRCode from "react-qr-code";
import {
  PhoneIcon,
  CalendarIcon,
  ClockIcon,
  QrCodeIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";

export default function TicketCard({ ticket, onEdit, className = "" }) {
  const { role } = useAuth();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [cancelData, setCancelData] = useState(null);

  const handleStatusUpdate = async (newStatus, message) => {
    if (!confirm("Apakah Anda yakin?")) return;
    try {
      await updateTicketStatus(ticket.id, newStatus, message, ticket);
      toast.success("Status tiket diperbarui");
    } catch (error) {
      toast.error("Gagal memperbarui status");
      console.error(error);
    }
  };

  const openCancelModal = (status, defaultMsg) => {
    setCancelData({ status, defaultMsg });
    setIsCancelModalOpen(true);
  };

  const handleCancelConfirm = async (reason) => {
    try {
      const message = `${cancelData.defaultMsg} Alasan: ${reason}`;
      await updateTicketStatus(ticket.id, cancelData.status, message, ticket);
      toast.success("Tiket berhasil dibatalkan");
    } catch (error) {
      toast.error("Gagal membatalkan tiket");
      console.error(error);
    }
  };

  const isPending = ticket.status === TICKET_STATUS.PENDING;
  const isPayment = ticket.status === TICKET_STATUS.PAYMENT;

  const isAdmin = role === "admin";
  const isPicGrooming = role === "pic_grooming";
  const isPicKlinik = role === "pic_klinik";

  const canPicAct =
    (isPicGrooming && ticket.layanan === SERVICE_TYPE.GROOMING) ||
    (isPicKlinik && ticket.layanan === SERVICE_TYPE.KLINIK);

  return (
    <>
      <div
        className={`p-6 bg-bg-surface rounded-3xl shadow-lg shadow-gray-100 dark:shadow-none border ${
          isPending
            ? "border-yellow-200 dark:border-yellow-900/30 bg-yellow-50/30 dark:bg-yellow-900/10"
            : isPayment
            ? "border-purple-200 dark:border-purple-900/30 bg-purple-50/30 dark:bg-purple-900/10"
            : "border-transparent dark:border-border-subtle"
        } animate-fade-in hover-lift hover:shadow-xl transition-shadow duration-300 relative group overflow-hidden ${className}`}
      >
        <div className="flex flex-col md:flex-row justify-between items-start flex-wrap gap-4 w-full relative z-10">
          <div className="w-full md:w-auto">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h3 className="font-bold text-text-main text-xl">
                {ticket.nama}
              </h3>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  ticket.layanan === SERVICE_TYPE.GROOMING
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                }`}
              >
                {ticket.layanan}
              </span>
              {ticket.source === "kiosk" && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 flex items-center gap-1">
                  <DevicePhoneMobileIcon className="w-3 h-3" />
                  Self-Service
                </span>
              )}
            </div>

            {ticket.telepon && (
              <a
                href={`https://wa.me/${ticket.telepon
                  .replace(/^0/, "62")
                  .replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 mb-2 text-sm text-text-muted font-bold hover:text-green-600 transition-colors group/wa"
                title="Chat via WhatsApp"
              >
                <PhoneIcon className="w-4 h-4 text-text-muted group-hover/wa:text-green-600" />
                <span>{ticket.telepon}</span>
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full opacity-0 group-hover/wa:opacity-100 transition-opacity">
                  Chat WA
                </span>
              </a>
            )}

            <div className="flex items-center gap-3 mt-1 text-sm text-text-muted font-medium">
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4 text-text-muted" />
                {new Date(ticket.tanggalRilis).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
              {ticket.jam && (
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4 text-text-muted" /> {ticket.jam}
                </span>
              )}
            </div>

            {ticket.catatan && (
              <div className="mt-3 bg-bg-subtle p-3 rounded-xl text-sm text-text-secondary border border-border-subtle">
                <span className="font-bold text-text-muted text-xs uppercase tracking-wider block mb-1">
                  Catatan:
                </span>
                {ticket.catatan}
              </div>
            )}

            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold border ${
                  isPending
                    ? "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800"
                    : isPayment
                    ? "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800"
                    : "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
                }`}
              >
                {ticket.status}
              </span>
              <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
                #{ticket.id.slice(-6)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-auto">
            {/* Admin Validation Actions */}
            {isAdmin && isPending && (
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleStatusUpdate(
                      TICKET_STATUS.WAITING,
                      "Validasi Admin: Diterima. Masuk Antrian."
                    )
                  }
                  className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 dark:shadow-none"
                >
                  Terima
                </button>
                <button
                  onClick={() =>
                    openCancelModal(
                      TICKET_STATUS.CANCELLED,
                      "Validasi Admin: Ditolak."
                    )
                  }
                  className="flex-1 md:flex-none px-4 py-2 bg-white dark:bg-bg-subtle text-rose-600 border border-rose-100 dark:border-rose-900/30 text-sm font-bold rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                >
                  Tolak
                </button>
              </div>
            )}

            {/* Admin Payment Actions */}
            {isAdmin && isPayment && (
              <button
                onClick={() =>
                  handleStatusUpdate(
                    TICKET_STATUS.COMPLETED,
                    "Pembayaran diterima. Tiket selesai."
                  )
                }
                className="w-full md:w-auto px-6 py-2 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 dark:shadow-none"
              >
                Konfirmasi Bayar
              </button>
            )}

            {/* Admin Edit/Delete Actions */}
            {isAdmin &&
              (ticket.status === TICKET_STATUS.WAITING ||
                ticket.status === TICKET_STATUS.ACTIVE) && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(ticket)}
                    className="flex-1 md:flex-none px-4 py-2 bg-amber-100 text-amber-700 text-sm font-bold rounded-xl hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      openCancelModal(
                        TICKET_STATUS.CANCELLED,
                        "Tiket dibatalkan oleh Admin."
                      )
                    }
                    className="flex-1 md:flex-none px-4 py-2 bg-rose-100 text-rose-700 text-sm font-bold rounded-xl hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50 transition-all"
                  >
                    Batalkan
                  </button>
                </div>
              )}

            {/* PIC Actions */}
            {canPicAct &&
              (ticket.status === TICKET_STATUS.WAITING ||
                ticket.status === TICKET_STATUS.ACTIVE) && (
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleStatusUpdate(
                        TICKET_STATUS.PAYMENT,
                        `Layanan selesai. Menunggu pembayaran.`
                      )
                    }
                    className="flex-1 md:flex-none px-6 py-2 bg-emerald-500 text-white text-sm font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 dark:shadow-none"
                  >
                    Selesai
                  </button>
                  <button
                    onClick={() =>
                      openCancelModal(
                        TICKET_STATUS.CANCELLED,
                        "Tiket dibatalkan oleh PIC."
                      )
                    }
                    className="flex-1 md:flex-none px-4 py-2 bg-rose-100 text-rose-700 text-sm font-bold rounded-xl hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50 transition-all"
                  >
                    Batalkan
                  </button>
                </div>
              )}
          </div>
        </div>

        {/* QR Button Footer */}
        <div className="mt-6 pt-4 border-t border-border-subtle flex justify-end">
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="flex items-center gap-2 text-text-muted hover:text-text-main transition-colors font-bold text-sm bg-bg-subtle hover:bg-bg-muted px-4 py-2 rounded-xl"
          >
            <QrCodeIcon className="w-5 h-5" /> Show QR
          </button>
        </div>
      </div>

      <CancellationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        ticketName={ticket.nama}
      />

      {isQrModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-bg-surface rounded-3xl p-8 max-w-sm w-full shadow-2xl relative animate-scale-in text-center">
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors font-bold text-xl"
              >
                ×
              </button>

              <h3 className="text-2xl font-black text-text-main mb-2">
                Scan QR Code
              </h3>
              <p className="text-text-muted mb-6">
                Pantau status tiket ini secara real-time.
              </p>

              <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 inline-block mb-6 shadow-none">
                <QRCode
                  value={`${window.location.origin}/monitor/${ticket.id}`}
                  size={200}
                  viewBox={`0 0 256 256`}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-left">
                <p className="text-xs text-blue-600 font-bold uppercase mb-1">
                  Link Monitor:
                </p>
                <p className="text-sm text-gray-700 font-mono break-all leading-tight">
                  {`${window.location.origin}/monitor/${ticket.id}`}
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
