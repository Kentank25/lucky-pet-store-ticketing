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
  CheckBadgeIcon,
  XMarkIcon,
  BanknotesIcon,
  PencilSquareIcon,
  InformationCircleIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

export default function TicketCard({
  ticket,
  onEdit,
  className = "",
  isSelected,
  onSelect,
}) {
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

  const cardStyles = isPending
    ? "bg-amber-50/50 border-amber-200/60 dark:bg-amber-900/10 dark:border-amber-900/30"
    : isPayment
    ? "bg-indigo-50/50 border-indigo-200/60 dark:bg-indigo-900/10 dark:border-indigo-900/30"
    : "glass-panel dark:bg-slate-800/40";

  const selectionStyles = isSelected
    ? "!bg-indigo-50/90 dark:!bg-indigo-900/40 !border-indigo-500 ring-4 ring-indigo-500/10 shadow-lg shadow-indigo-500/20"
    : "";

  const CardContent = () => (
    <div className="flex flex-col gap-4 w-full">
      {/* Header: Name & Service & Source */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                ticket.layanan === SERVICE_TYPE.GROOMING
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
              }`}
            >
              {ticket.layanan}
            </span>
            {ticket.source === "kiosk" && (
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 flex items-center gap-1">
                <DevicePhoneMobileIcon className="w-3 h-3" />
                App
              </span>
            )}
          </div>
          <h3 className="font-extrabold text-text-main text-lg leading-tight line-clamp-2">
            {ticket.nama}
          </h3>
        </div>

        {/* Status Badge */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm ${
            isPending
              ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
              : isPayment
              ? "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800"
              : "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isPending
                  ? "bg-amber-500"
                  : isPayment
                  ? "bg-indigo-500"
                  : "bg-emerald-500"
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isPending
                  ? "bg-amber-500"
                  : isPayment
                  ? "bg-indigo-500"
                  : "bg-emerald-500"
              }`}
            ></span>
          </span>
          {ticket.status}
        </div>
      </div>

      {/* Details: WhatsApp, Date, Time */}
      <div className="flex flex-col gap-2 text-sm text-text-secondary font-medium pl-1 border-l-2 border-border-subtle">
        {ticket.telepon && (
          <div className="flex items-center gap-2">
            <PhoneIcon className="w-4 h-4 text-text-muted" />
            <span>{ticket.telepon}</span>
            <a
              href={`https://wa.me/${ticket.telepon
                .replace(/^0/, "62")
                .replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold bg-green-100 text-green-700 px-2 rounded-md hover:bg-green-200 transition-colors"
            >
              WA
            </a>
          </div>
        )}
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-text-muted" />
          <span>
            {new Date(ticket.tanggalRilis).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            })}
          </span>
          {ticket.jam && (
            <>
              <span className="text-text-muted">•</span>
              <ClockIcon className="w-4 h-4 text-text-muted" />
              <span>{ticket.jam}</span>
            </>
          )}
        </div>
      </div>

      {/* Notes */}
      {ticket.catatan && (
        <div className="bg-bg-canvas/50 dark:bg-black/20 p-3 rounded-xl border border-black/5 dark:border-white/5 text-sm">
          <div className="flex items-start gap-2">
            <InformationCircleIcon className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
            <p className="text-text-secondary italic">"{ticket.catatan}"</p>
          </div>
        </div>
      )}

      {/* Universal Footer: ID & QR */}
      <div className="flex items-center justify-between pt-2">
        <span className="font-mono text-[10px] text-text-muted opacity-60">
          ID: {ticket.id.slice(0, 8)}...
        </span>
        <button
          onClick={() => setIsQrModalOpen(true)}
          className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-bg-subtle transition-colors"
          title="Show QR"
        >
          <QrCodeIcon className="w-5 h-5" />
        </button>
      </div>

      {/* ACTION BUTTON GRID */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-4 border-t border-border-subtle/50">
        {/* Pending State for Admin */}
        {isAdmin && isPending && (
          <>
            <button
              onClick={() =>
                handleStatusUpdate(TICKET_STATUS.WAITING, "Validasi: Diterima")
              }
              className="col-span-1 btn-primary py-2 text-xs flex items-center justify-center gap-2"
            >
              <CheckBadgeIcon className="w-4 h-4" /> Terima
            </button>
            <button
              onClick={() =>
                openCancelModal(TICKET_STATUS.CANCELLED, "Validasi: Ditolak")
              }
              className="col-span-1 px-3 py-2 rounded-xl bg-bg-subtle hover:bg-red-50 text-text-secondary hover:text-red-600 font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <XMarkIcon className="w-4 h-4" /> Tolak
            </button>
          </>
        )}

        {/* Payment State for Admin */}
        {isAdmin && isPayment && (
          <button
            onClick={() =>
              handleStatusUpdate(TICKET_STATUS.COMPLETED, "Pembayaran Lunas")
            }
            className="col-span-2 btn-primary py-2.5 text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none"
            style={{ background: "var(--color-primary)" }} // Override for stronger look
          >
            <BanknotesIcon className="w-4 h-4" />
            Konfirmasi Pembayaran
          </button>
        )}

        {/* Active State Actions */}
        {((isAdmin &&
          (ticket.status === TICKET_STATUS.WAITING ||
            ticket.status === TICKET_STATUS.ACTIVE)) ||
          (canPicAct &&
            (ticket.status === TICKET_STATUS.WAITING ||
              ticket.status === TICKET_STATUS.ACTIVE))) && (
          <>
            {/* Main Action: PIC Selesai / Admin Edit */}
            {canPicAct ? (
              <button
                onClick={() =>
                  handleStatusUpdate(TICKET_STATUS.PAYMENT, "Pekerjaan Selesai")
                }
                className="col-span-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-none transition-all"
              >
                <CheckBadgeIcon className="w-4 h-4" /> Selesai
              </button>
            ) : (
              <button
                onClick={() => onEdit(ticket)}
                className="col-span-1 bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
              >
                <PencilSquareIcon className="w-4 h-4" /> Edit
              </button>
            )}

            {/* Secondary Action: Cancel */}
            <button
              onClick={() =>
                openCancelModal(
                  TICKET_STATUS.CANCELLED,
                  isAdmin ? "Dibatalkan Admin" : "Dibatalkan PIC"
                )
              }
              className="col-span-1 px-3 py-2 rounded-xl bg-bg-subtle hover:bg-rose-50 text-text-secondary hover:text-rose-600 font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <XMarkIcon className="w-4 h-4" /> Batal
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div
        onClick={onSelect ? onSelect : undefined}
        className={`relative p-6 rounded-3xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group ${cardStyles} ${selectionStyles} ${className} ${
          onSelect ? "cursor-pointer" : ""
        }`}
      >
        <div className="flex gap-4 items-stretch">
          {onSelect && (
            <div className="flex items-center shrink-0 border-r border-gray-100 dark:border-white/5 pr-4">
              <div
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                  isSelected
                    ? "bg-indigo-500 border-indigo-500 scale-110 shadow-lg shadow-indigo-500/30"
                    : "border-gray-300 dark:border-gray-600 group-hover:border-indigo-400 bg-white dark:bg-slate-800"
                }`}
              >
                {isSelected && (
                  <CheckIcon className="w-4 h-4 text-white stroke-[3px]" />
                )}
              </div>
            </div>
          )}
          <CardContent />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="bg-bg-surface rounded-4xl p-8 max-w-sm w-full shadow-2xl relative animate-scale-in text-center border border-white/10">
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-bg-subtle rounded-full flex items-center justify-center text-text-muted hover:bg-red-50 hover:text-red-500 transition-colors font-bold text-xl"
              >
                ×
              </button>

              <h3 className="text-2xl font-black text-text-main mb-2">
                Scan QR Code
              </h3>
              <p className="text-text-muted mb-6 text-sm">
                Arahkan kamera ke QR code ini untuk memantau status.
              </p>

              <div className="bg-white p-4 rounded-3xl border-2 border-gray-100 dark:border-gray-800 inline-block mb-6 shadow-sm">
                <QRCode
                  value={`${window.location.origin}/monitor/${ticket.id}`}
                  size={180}
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/50 text-left">
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase mb-1 tracking-wider">
                  Direct Link
                </p>
                <p className="text-xs text-text-secondary font-mono break-all leading-relaxed opacity-80">
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
