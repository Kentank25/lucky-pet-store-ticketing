import { useState } from "react";
import { useTickets } from "../../hooks/useTickets";
import {
  ScissorsIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  ArrowRightIcon,
  SparklesIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { updateTicketStatus } from "../../services/ticketService";
import toast from "react-hot-toast";
import { TICKET_STATUS, SERVICE_TYPE } from "../../constants";
import TicketSkeleton from "../../components/tickets/TicketSkeleton";
import { SERVICE_ROOMS, compareQueueTickets, getRoom } from "../../utils/roomQueue";
import ConfirmationModal from "../../components/modals/ConfirmationModal";
import CancellationModal from "../../components/modals/CancellationModal";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";

export default function PicDashboard() {
  const { tickets, loading } = useTickets();
  const { user, role } = useAuth();

  const service =
    role === "pic_grooming" ? SERVICE_TYPE.GROOMING : SERVICE_TYPE.KLINIK;
  const isGrooming = service === SERVICE_TYPE.GROOMING;
  const assignedRoom = user?.roomId ? getRoom(user.roomId, service) : null;

  const [processingId, setProcessingId] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isDanger: false,
    confirmText: "Konfirmasi",
  });

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  const [cancellationModal, setCancellationModal] = useState({
    isOpen: false,
    ticket: null,
  });

  const closeCancellationModal = () => {
    setCancellationModal({ isOpen: false, ticket: null });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="h-24 rounded-2xl bg-bg-surface border border-border-subtle animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <TicketSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const serviceRooms = assignedRoom
    ? [assignedRoom]
    : SERVICE_ROOMS.filter((r) => r.service === service);
  const activeTickets = tickets.filter(
    (t) =>
      t.status === TICKET_STATUS.ACTIVE &&
      t.layanan === service &&
      (!assignedRoom || t.roomId === assignedRoom.id)
  );

  const waitingTickets = tickets
    .filter(
      (t) =>
        t.status === TICKET_STATUS.WAITING &&
        t.layanan === service &&
        (!assignedRoom || t.roomId === assignedRoom.id)
    )
    .sort(compareQueueTickets);

  const unassignedTickets = assignedRoom
    ? []
    : [...activeTickets, ...waitingTickets].filter(
        (t) => !getRoom(t.roomId, service)
      );

  const completedCount = tickets.filter(
    (t) =>
      (t.status === TICKET_STATUS.COMPLETED ||
        t.status === TICKET_STATUS.PAYMENT) &&
      t.layanan === service &&
      (!assignedRoom || t.roomId === assignedRoom.id)
  ).length;

  const handleTakeTicket = (ticket) => {
    const targetTicket = ticket || waitingTickets[0];
    if (!targetTicket) return;

    setConfirmModal({
      isOpen: true,
      title: "Ambil Antrian",
      message: `Ambil antrian untuk ${targetTicket.nama}?`,
      confirmText: "Ambil",
      isDanger: false,
      onConfirm: async () => {
        closeConfirmModal();
        setProcessingId(targetTicket.id);
        try {
          await updateTicketStatus(
            targetTicket.id,
            TICKET_STATUS.ACTIVE,
            "Tiket diambil oleh PIC.",
            targetTicket
          );
          toast.success(`Berhasil mengambil antrian: ${targetTicket.nama}`);
        } catch (error) {
          console.error(error);
          toast.error(`Gagal: ${error.message || "Terjadi kesalahan"}`);
        } finally {
          setProcessingId(null);
        }
      },
    });
  };

  const handleCompleteTicket = (ticket) => {
    setConfirmModal({
      isOpen: true,
      title: "Selesaikan Layanan",
      message: "Apakah layanan sudah selesai? Lanjut ke pembayaran?",
      confirmText: "Selesai",
      isDanger: false,
      onConfirm: async () => {
        closeConfirmModal();
        setProcessingId(ticket.id);
        try {
          await updateTicketStatus(
            ticket.id,
            TICKET_STATUS.PAYMENT,
            "Layanan selesai. Menunggu pembayaran.",
            ticket
          );
          toast.success("Layanan selesai!");
        } catch (error) {
          console.error(error);
          toast.error(`Gagal: ${error.message || "Terjadi kesalahan"}`);
        } finally {
          setProcessingId(null);
        }
      },
    });
  };

  const handleCancelTicket = (ticket) => {
    setCancellationModal({
      isOpen: true,
      ticket: ticket,
    });
  };

  const processCancellation = async (reason) => {
    const ticket = cancellationModal.ticket;
    if (!ticket) return;

    closeCancellationModal();
    setProcessingId(ticket.id);

    try {
      await updateTicketStatus(
        ticket.id,
        TICKET_STATUS.CANCELLED,
        `Dibatalkan oleh PIC. Alasan: ${reason}`,
        ticket
      );
      toast.success("Tiket berhasil dibatalkan.");
    } catch (error) {
      console.error(error);
      toast.error("Gagal membatalkan tiket.");
    } finally {
      setProcessingId(null);
    }
  };

  const ThemeIcon = isGrooming ? ScissorsIcon : HeartIcon;

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-20">
        {/* Compact Workspace Header */}
        <Card padding="md" className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                isGrooming
                  ? "bg-grooming-soft text-grooming border-grooming/20"
                  : "bg-primary-soft text-primary border-primary/20"
              }`}
            >
              <ThemeIcon className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-main tracking-tight">
                  Area {service}
                </h1>
                {assignedRoom && (
                  <Badge variant={isGrooming ? "grooming" : "klinik"} dot>
                    Ruang {assignedRoom.name}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-text-secondary mt-0.5">
                {assignedRoom
                  ? `Fokus antrian khusus untuk ruang ${assignedRoom.name}.`
                  : `Kelola antrian ruang layanan ${service.toLowerCase()} secara efisien.`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            <div className="rounded-xl border border-border-subtle bg-bg-subtle/50 px-3.5 py-2.5 text-center sm:text-left">
              <p className="text-xs font-medium text-text-secondary">Aktif</p>
              <p
                className={`font-heading text-xl font-bold tabular-nums mt-0.5 ${
                  isGrooming ? "text-grooming" : "text-primary"
                }`}
              >
                {activeTickets.length}
              </p>
            </div>
            <div className="rounded-xl border border-border-subtle bg-bg-subtle/50 px-3.5 py-2.5 text-center sm:text-left">
              <p className="text-xs font-medium text-text-secondary">Menunggu</p>
              <p className="font-heading text-xl font-bold tabular-nums text-text-main mt-0.5">
                {waitingTickets.length}
              </p>
            </div>
            <div className="rounded-xl border border-border-subtle bg-bg-subtle/50 px-3.5 py-2.5 text-center sm:text-left">
              <p className="text-xs font-medium text-text-secondary">Selesai</p>
              <p className="font-heading text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
                {completedCount}
              </p>
            </div>
          </div>
        </Card>

        {/* Legacy Unassigned Warning */}
        {unassignedTickets.length > 0 && (
          <section
            role="alert"
            className="rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800/70 p-5 space-y-4"
          >
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon
                className="w-5 h-5 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <p className="text-sm text-amber-900 dark:text-amber-100 font-semibold">
                {unassignedTickets.length} tiket belum memiliki ruang yang valid. Admin harus menetapkan ruang agar tiket dapat dipanggil.
              </p>
            </div>
            <ul className="space-y-2.5">
              {unassignedTickets.map((t) => (
                <li
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-3 bg-bg-surface rounded-xl p-3.5 border border-border-subtle"
                >
                  <div>
                    <p className="font-semibold text-text-main">
                      <span className="tabular-nums mr-1.5">
                        {t.queueNumber || t.id.slice(0, 6)}
                      </span>
                      — {t.nama}
                    </p>
                    <p className="text-xs text-text-secondary tabular-nums mt-0.5">
                      {t.status} · {t.jam || "--:--"}
                    </p>
                  </div>
                  {t.status === TICKET_STATUS.ACTIVE && (
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        loading={processingId === t.id}
                        onClick={() => handleCompleteTicket(t)}
                      >
                        Selesaikan
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={processingId === t.id}
                        onClick={() => handleCancelTicket(t)}
                      >
                        Batalkan
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Room Grid (Focused Single Room or 2-Column Multi-Room) */}
        <div
          className={
            serviceRooms.length === 1
              ? "grid grid-cols-1 max-w-3xl mx-auto gap-6"
              : "grid grid-cols-1 lg:grid-cols-2 gap-6"
          }
        >
          {serviceRooms.map((room) => {
            const active = activeTickets.find((t) => t.roomId === room.id);
            const queue = waitingTickets.filter((t) => t.roomId === room.id);
            const next = queue[0];
            const rest = queue.slice(1);
            const busy = !!active;
            const staff = (t) => t.doctorName || t.groomerName || "-";

            return (
              <Card
                key={room.id}
                padding="lg"
                className={`border-t-4 ${
                  isGrooming ? "border-t-grooming" : "border-t-primary"
                }`}
              >
                <section aria-label={room.name} className="flex flex-col h-full space-y-5">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h2 className="font-heading text-xl font-bold text-text-main">
                      {room.name}
                    </h2>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={busy ? "active" : "neutral"}
                        dot
                        role="status"
                        aria-atomic="true"
                      >
                        {busy ? "Sedang Melayani" : "Ruang Tersedia"}
                      </Badge>
                      <Badge variant="waiting" className="tabular-nums">
                        {queue.length} menunggu
                      </Badge>
                    </div>
                  </div>

                  {active ? (
                    <div className="space-y-4">
                      <div>
                        <span
                          className={`inline-flex items-center rounded-lg px-2.5 py-1 text-sm font-bold tabular-nums ${
                            isGrooming
                              ? "bg-grooming-soft text-grooming"
                              : "bg-primary-soft text-primary"
                          }`}
                        >
                          {active.queueNumber || active.id.slice(0, 6)}
                        </span>
                        <h3 className="font-heading text-2xl sm:text-3xl font-bold text-text-main mt-2">
                          {active.nama}
                        </h3>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
                          <span className="inline-flex items-center gap-1.5">
                            <UserIcon className="w-4 h-4 text-text-muted" aria-hidden="true" />
                            <span>Petugas: {staff(active)}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 tabular-nums">
                            <ClockIcon className="w-4 h-4 text-text-muted" aria-hidden="true" />
                            <span>Jam {active.jam || "--:--"}</span>
                          </span>
                        </div>
                      </div>

                      {active.catatan && (
                        <div className="bg-bg-subtle/60 p-3.5 rounded-xl border border-border-subtle flex gap-2.5 items-start">
                          <ChatBubbleLeftRightIcon
                            className="w-4 h-4 text-text-muted shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <p className="text-sm text-text-secondary italic">
                            &ldquo;{active.catatan}&rdquo;
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3 pt-1">
                        <Button
                          variant="primary"
                          size="lg"
                          className="flex-1"
                          loading={processingId === active.id}
                          onClick={() => handleCompleteTicket(active)}
                        >
                          {processingId !== active.id && (
                            <CheckIcon className="w-5 h-5" aria-hidden="true" />
                          )}
                          <span>
                            {processingId === active.id ? "Memproses..." : "Selesaikan"}
                          </span>
                        </Button>
                        <Button
                          variant="danger"
                          size="lg"
                          className="sm:w-auto"
                          disabled={processingId === active.id}
                          onClick={() => handleCancelTicket(active)}
                        >
                          <XCircleIcon className="w-5 h-5" aria-hidden="true" />
                          <span>Batalkan</span>
                        </Button>
                      </div>
                    </div>
                  ) : next ? (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                            Berikutnya
                          </span>
                          <span
                            className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-sm font-bold tabular-nums ${
                              isGrooming
                                ? "bg-grooming-soft text-grooming"
                                : "bg-primary-soft text-primary"
                            }`}
                          >
                            {next.queueNumber || next.id.slice(0, 6)}
                          </span>
                        </div>
                        <h3 className="font-heading text-2xl sm:text-3xl font-bold text-text-main mt-2">
                          {next.nama}
                        </h3>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
                          <span className="inline-flex items-center gap-1.5">
                            <UserIcon className="w-4 h-4 text-text-muted" aria-hidden="true" />
                            <span>Petugas: {staff(next)}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 tabular-nums">
                            <ClockIcon className="w-4 h-4 text-text-muted" aria-hidden="true" />
                            <span>Jam {next.jam || "--:--"}</span>
                          </span>
                        </div>
                      </div>

                      {next.catatan && (
                        <div className="bg-bg-subtle/60 p-3.5 rounded-xl border border-border-subtle flex gap-2.5 items-start">
                          <ChatBubbleLeftRightIcon
                            className="w-4 h-4 text-text-muted shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <p className="text-sm text-text-secondary italic">
                            &ldquo;{next.catatan}&rdquo;
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3 pt-1">
                        <Button
                          variant={isGrooming ? "grooming" : "klinik"}
                          size="lg"
                          className="flex-1"
                          loading={processingId === next.id}
                          onClick={() => handleTakeTicket(next)}
                        >
                          <span>
                            {processingId === next.id ? "Memproses..." : "Panggil & Mulai"}
                          </span>
                          {processingId !== next.id && (
                            <ArrowRightIcon className="w-5 h-5" aria-hidden="true" />
                          )}
                        </Button>
                        <Button
                          variant="danger"
                          size="lg"
                          className="sm:w-auto"
                          disabled={processingId === next.id}
                          onClick={() => handleCancelTicket(next)}
                        >
                          <XCircleIcon className="w-5 h-5" aria-hidden="true" />
                          <span>Batalkan</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <EmptyState
                      icon={SparklesIcon}
                      title="Belum ada antrean"
                      description="Antrean berikutnya untuk ruang ini akan muncul di sini."
                    />
                  )}

                  {rest.length > 0 && (
                    <div className="pt-4 border-t border-border-subtle">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2.5">
                        Antrean Selanjutnya ({rest.length})
                      </h4>
                      <ul className="space-y-2">
                        {rest.map((t) => (
                          <li
                            key={t.id}
                            className="flex items-center justify-between gap-3 text-sm bg-bg-subtle/50 rounded-xl px-3.5 py-2.5 border border-border-subtle text-text-main"
                          >
                            <span className="font-semibold truncate">
                              <span className="tabular-nums text-text-secondary mr-2">
                                {t.queueNumber || t.id.slice(0, 6)}
                              </span>
                              {t.nama}
                            </span>
                            <span className="text-xs text-text-secondary tabular-nums shrink-0">
                              {t.jam || "--:--"} · {staff(t)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              </Card>
            );
          })}
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDanger={confirmModal.isDanger}
      />
      <CancellationModal
        isOpen={cancellationModal.isOpen}
        onClose={closeCancellationModal}
        onConfirm={processCancellation}
        ticketName={cancellationModal.ticket?.nama || ""}
      />
    </>
  );
}
