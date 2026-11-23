import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import QRCode from "react-qr-code";
import { useAuth } from "../../context/AuthContext";
import { updateTicketStatus } from "../../services/ticketService";
import { TICKET_STATUS, SERVICE_TYPE } from "../../constants";
import { getRoom } from "../../utils/roomQueue";
import CancellationModal from "../modals/CancellationModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
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
  BuildingStorefrontIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

const STATUS_BADGE_MAP = {
  [TICKET_STATUS.PENDING]: "pending",
  [TICKET_STATUS.WAITING]: "waiting",
  [TICKET_STATUS.ACTIVE]: "active",
  [TICKET_STATUS.PAYMENT]: "payment",
  [TICKET_STATUS.COMPLETED]: "completed",
  [TICKET_STATUS.CANCELLED]: "cancelled",
};

export default function TicketCard({
  ticket,
  onEdit,
  className = "",
  isSelected,
  onSelect,
}) {
  const { role } = useAuth();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isDanger: false,
    confirmText: "Konfirmasi",
  });
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [cancelData, setCancelData] = useState(null);

  useEffect(() => {
    if (!isQrModalOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsQrModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isQrModalOpen]);

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleStatusUpdate = (newStatus, message) => {
    setConfirmModal({
      isOpen: true,
      title: "Update Status Tiket",
      message: "Apakah Anda yakin ingin memperbarui status tiket ini?",
      confirmText: "Ya, Update",
      isDanger: false,
      onConfirm: async () => {
        closeConfirmModal();
        try {
          await updateTicketStatus(ticket.id, newStatus, message, ticket);
          toast.success("Status tiket diperbarui");
        } catch (error) {
          toast.error("Gagal memperbarui status");
          console.error(error);
        }
      },
    });
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
  const isGrooming = ticket.layanan === SERVICE_TYPE.GROOMING;
  const isAdmin = role === "admin";
  const isPicGrooming = role === "pic_grooming";
  const isPicKlinik = role === "pic_klinik";

  const canPicAct =
    (isPicGrooming && isGrooming) ||
    (isPicKlinik && ticket.layanan === SERVICE_TYPE.KLINIK);

  const canActWaitingOrActive =
    (isAdmin || canPicAct) &&
    (ticket.status === TICKET_STATUS.WAITING ||
      ticket.status === TICKET_STATUS.ACTIVE);

  const roomName =
    getRoom(ticket.roomId, ticket.layanan)?.name || ticket.roomId;
  const staffName = ticket.doctorName || ticket.groomerName;
  const statusBadgeVariant = STATUS_BADGE_MAP[ticket.status] || "neutral";

  const cardSurfaceClass = isSelected
    ? "border-primary bg-primary-soft/40 ring-2 ring-primary/25"
    : isPending
    ? "border-amber-200 bg-amber-50/40 dark:border-amber-800/50 dark:bg-amber-950/20"
    : isPayment
    ? "border-purple-200 bg-purple-50/40 dark:border-purple-800/50 dark:bg-purple-950/20"
    : "";

  const monitorUrl = `${window.location.origin}/monitor/${ticket.id}`;
  const whatsappNumber = ticket.telepon
    ? ticket.telepon.replace(/^0/, "62").replace(/\D/g, "")
    : "";

  return (
    <>
      <Card
        padding="sm"
        className={`relative min-w-0 transition-colors ${cardSurfaceClass} ${className}`}
      >
        <div className="flex flex-col items-stretch gap-2.5 md:flex-row md:gap-3">
          {onSelect && (
            <button
              type="button"
              onClick={onSelect}
              aria-label={`Pilih tiket ${ticket.nama}`}
              aria-pressed={isSelected}
              className="flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center gap-2 self-start rounded-xl px-2 transition-colors hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:px-0"
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors ${
                  isSelected
                    ? "border-primary bg-primary text-white"
                    : "border-border-main bg-bg-surface"
                }`}
              >
                {isSelected && (
                  <CheckIcon className="h-3.5 w-3.5 stroke-[3px]" aria-hidden="true" />
                )}
              </span>
              <span className="text-xs font-semibold text-text-secondary md:sr-only">
                Pilih tiket
              </span>
            </button>
          )}

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            {/* Header: Queue Number, Service & Source Badges, Status Badge */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                  {ticket.queueNumber && (
                    <span className="inline-flex items-center rounded-lg border border-border-subtle bg-bg-subtle px-2 py-0.5 font-heading text-xs font-extrabold tracking-tight tabular-nums text-text-main">
                      {ticket.queueNumber}
                    </span>
                  )}
                  <Badge variant={isGrooming ? "grooming" : "klinik"}>
                    {ticket.layanan}
                  </Badge>
                  {ticket.source === "kiosk" && (
                    <Badge variant="neutral">
                      <DevicePhoneMobileIcon
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      Kiosk
                    </Badge>
                  )}
                </div>
                <h3 className="wrap-anywhere font-heading text-lg leading-tight font-bold text-text-main">
                  {ticket.nama}
                </h3>
              </div>

              <Badge variant={statusBadgeVariant} dot>
                {ticket.status}
              </Badge>
            </div>

            {/* Metadata: Room/Staff, Phone + WA, Date & Time */}
            <div className="flex flex-col gap-1.5 border-l-2 border-border-subtle pl-3 text-sm font-medium text-text-secondary">
              {(roomName || staffName) && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  {roomName && (
                    <span className="inline-flex items-center gap-1.5 text-text-main">
                      <BuildingStorefrontIcon
                        className="h-4 w-4 shrink-0 text-text-muted"
                        aria-hidden="true"
                      />
                      <span>{roomName}</span>
                    </span>
                  )}
                  {staffName && (
                    <span className="inline-flex items-center gap-1.5">
                      <UserIcon
                        className="h-4 w-4 shrink-0 text-text-muted"
                        aria-hidden="true"
                      />
                      <span>{staffName}</span>
                    </span>
                  )}
                </div>
              )}

              {ticket.telepon && (
                <div className="flex flex-wrap items-center gap-2">
                  <PhoneIcon
                    className="h-4 w-4 shrink-0 text-text-muted"
                    aria-hidden="true"
                  />
                  <span className="tabular-nums">{ticket.telepon}</span>
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-7 items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800 transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-200"
                  >
                    WA
                  </a>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <CalendarIcon
                  className="h-4 w-4 shrink-0 text-text-muted"
                  aria-hidden="true"
                />
                <span className="tabular-nums">
                  {new Date(ticket.tanggalRilis).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                {ticket.jam && (
                  <>
                    <span className="text-text-muted" aria-hidden="true">
                      •
                    </span>
                    <ClockIcon
                      className="h-4 w-4 shrink-0 text-text-muted"
                      aria-hidden="true"
                    />
                    <span className="tabular-nums">{ticket.jam}</span>
                  </>
                )}
              </div>
            </div>

            {/* Notes */}
            {ticket.catatan && (
              <div className="rounded-xl border border-border-subtle bg-bg-subtle/60 p-3 text-sm">
                <div className="flex items-start gap-2">
                  <InformationCircleIcon
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <p className="min-w-0 wrap-anywhere italic text-text-secondary">
                    "{ticket.catatan}"
                  </p>
                </div>
              </div>
            )}

            {/* ID & QR Trigger */}
            <div className="flex items-center justify-between pt-1">
              <span className="font-mono text-[11px] tabular-nums text-text-muted">
                ID: {ticket.id.slice(0, 8)}...
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsQrModalOpen(true)}
                className="min-h-10 min-w-10 px-2"
                aria-label="Tampilkan kode QR"
              >
                <QrCodeIcon className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>

            {/* Quick Actions */}
            {(isAdmin && isPending) ||
            (isAdmin && isPayment) ||
            canActWaitingOrActive ? (
              <div className="grid grid-cols-2 gap-2 border-t border-border-subtle pt-3">
                {isAdmin && isPending && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        handleStatusUpdate(
                          TICKET_STATUS.WAITING,
                          "Validasi: Diterima"
                        )
                      }
                    >
                      <CheckBadgeIcon className="h-4 w-4" aria-hidden="true" />
                      Terima
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        openCancelModal(
                          TICKET_STATUS.CANCELLED,
                          "Validasi: Ditolak"
                        )
                      }
                    >
                      <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                      Tolak
                    </Button>
                  </>
                )}

                {isAdmin && isPayment && (
                  <Button
                    variant="primary"
                    size="md"
                    className="col-span-2"
                    onClick={() =>
                      handleStatusUpdate(
                        TICKET_STATUS.COMPLETED,
                        "Pembayaran Lunas"
                      )
                    }
                  >
                    <BanknotesIcon className="h-4 w-4" aria-hidden="true" />
                    Konfirmasi Pembayaran
                  </Button>
                )}

                {canActWaitingOrActive && (
                  <>
                    {canPicAct ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          handleStatusUpdate(
                            TICKET_STATUS.PAYMENT,
                            "Pekerjaan Selesai"
                          )
                        }
                      >
                        <CheckBadgeIcon className="h-4 w-4" aria-hidden="true" />
                        Selesai
                      </Button>
                    ) : (
                      onEdit && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onEdit(ticket)}
                        >
                          <PencilSquareIcon
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                          Edit
                        </Button>
                      )
                    )}

                    <Button
                      variant="danger"
                      size="sm"
                      className={!canPicAct && !onEdit ? "col-span-2" : ""}
                      onClick={() =>
                        openCancelModal(
                          TICKET_STATUS.CANCELLED,
                          isAdmin ? "Dibatalkan Admin" : "Dibatalkan PIC"
                        )
                      }
                    >
                      <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                      Batal
                    </Button>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      <CancellationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        ticketName={ticket.nama}
      />

      {isQrModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="qr-modal-title"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setIsQrModalOpen(false);
            }}
          >
            <div className="relative w-full max-w-sm rounded-3xl border border-border-subtle bg-bg-surface p-6 text-center shadow-xl sm:p-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsQrModalOpen(false)}
                aria-label="Tutup modal QR"
                className="absolute top-4 right-4 min-h-10 min-w-10 rounded-full px-0"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </Button>

              <h3
                id="qr-modal-title"
                className="mb-1.5 font-heading text-xl font-bold text-text-main"
              >
                Scan QR Code
              </h3>
              <p className="mb-5 text-sm text-text-secondary">
                Arahkan kamera ke QR code ini untuk memantau status antrian.
              </p>

              <div className="mb-5 inline-block rounded-2xl border border-border-subtle bg-white p-4 shadow-xs">
                <QRCode value={monitorUrl} size={180} />
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary-soft p-3.5 text-left">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                  Direct Link
                </p>
                <p className="break-all font-mono text-xs leading-relaxed text-text-secondary">
                  {monitorUrl}
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDanger={confirmModal.isDanger}
      />
    </>
  );
}
