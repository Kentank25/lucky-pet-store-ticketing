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
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { updateTicketStatus } from "../../services/ticketService";
import toast from "react-hot-toast";
import { TICKET_STATUS, SERVICE_TYPE } from "../../constants";
import TicketSkeleton from "../../components/tickets/TicketSkeleton";
import { useState } from "react";
import { SERVICE_ROOMS, compareQueueTickets, getRoom } from "../../utils/roomQueue";
import ThemeToggle from "../../components/common/ThemeToggle";
import ConfirmationModal from "../../components/modals/ConfirmationModal";
import CancellationModal from "../../components/modals/CancellationModal";

export default function PicDashboard() {
  const { tickets, loading } = useTickets();
  const { role } = useAuth();

  const service =
    role === "pic_grooming" ? SERVICE_TYPE.GROOMING : SERVICE_TYPE.KLINIK;
  const isGrooming = service === SERVICE_TYPE.GROOMING;

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

  if (loading)
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8 animate-fade-in pb-24 font-sans bg-slate-50 dark:bg-[#020617] min-h-screen transition-colors duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {[1, 2, 3, 4].map((i) => (
            <TicketSkeleton key={i} />
          ))}
        </div>
      </div>
    );

  const serviceRooms = SERVICE_ROOMS.filter((r) => r.service === service);
  const activeTickets = tickets.filter(
    (t) => t.status === TICKET_STATUS.ACTIVE && t.layanan === service
  );

  const waitingTickets = tickets
    .filter((t) => t.status === TICKET_STATUS.WAITING && t.layanan === service)
    .sort(compareQueueTickets);

  const unassignedTickets = [...activeTickets, ...waitingTickets].filter(
    (t) => !getRoom(t.roomId, service)
  );

  const completedCount = tickets.filter(
    (t) =>
      (t.status === TICKET_STATUS.COMPLETED ||
        t.status === TICKET_STATUS.PAYMENT) &&
      t.layanan === service
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
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8 animate-fade-in pb-24 font-sans min-h-screen transition-colors duration-500">
        <div className="fixed inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] pointer-events-none"></div>

        <div
          className={`relative rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl transition-all duration-500 glow-secondary group ${
            isGrooming
              ? "bg-linear-to-br from-blue-500 via-indigo-600 to-violet-700 dark:from-indigo-700 dark:via-indigo-800 dark:to-violet-900 shadow-indigo-500/30 dark:shadow-indigo-900/20"
              : "bg-linear-to-br from-rose-500 via-rose-600 to-pink-700 dark:from-rose-600 dark:via-rose-700 dark:to-pink-800 shadow-rose-500/30 dark:shadow-rose-500/20"
          }`}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-[0.1] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-[0.1] rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="px-4 py-1.5 rounded-full bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-md">
                  PIC Dashboard
                </div>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-sm flex items-center gap-4">
                  <span>Area {service}</span>
                  <ThemeIcon className="w-10 h-10 md:w-14 md:h-14 opacity-90" />
                </h1>
                <p className="text-indigo-50 dark:text-indigo-100 text-lg mt-3 font-medium max-w-xl leading-relaxed opacity-90">
                  Kelola antrian dengan efisien dan berikan pelayanan terbaik.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="p-5 bg-white/10 border border-white/20 rounded-3xl flex flex-col items-center justify-center min-w-[110px] backdrop-blur-md shadow-lg hover:bg-white/20 transition-colors">
                <span className="text-4xl font-black text-white">
                  {completedCount}
                </span>
                <span className="text-[10px] font-bold text-white uppercase tracking-widest mt-1 opacity-90">
                  Selesai
                </span>
              </div>
              <div className="p-5 bg-white/10 border border-white/20 rounded-3xl flex flex-col items-center justify-center min-w-[110px] backdrop-blur-md shadow-lg hover:bg-white/20 transition-colors">
                <span className="text-4xl font-black text-white">
                  {waitingTickets.length}
                </span>
                <span className="text-[10px] font-bold text-white uppercase tracking-widest mt-1 opacity-90">
                  Menunggu
                </span>
              </div>
            </div>
          </div>

          <div className="absolute top-6 right-6">
            <ThemeToggle className="bg-white/10 hover:bg-white/20 border-white/10 text-white" />
          </div>
        </div>

        {unassignedTickets.length > 0 && (
          <section role="alert" className="rounded-3xl border-2 border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-amber-700 dark:text-amber-300 shrink-0" aria-hidden="true" />
              <p className="text-amber-900 dark:text-amber-100 font-semibold">
                {unassignedTickets.length} tiket belum memiliki ruang yang valid. Admin harus menetapkan ruang agar tiket dapat dipanggil.
              </p>
            </div>
            <ul className="space-y-2">
              {unassignedTickets.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 bg-bg-surface rounded-2xl p-4 border border-border-subtle">
                  <div>
                    <p className="font-bold text-text-main">{t.queueNumber || t.id.slice(0, 6)} - {t.nama}</p>
                    <p className="text-sm text-text-secondary">{t.status} - {t.jam || "--:--"}</p>
                  </div>
                  {t.status === TICKET_STATUS.ACTIVE && (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleCompleteTicket(t)} disabled={processingId === t.id} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold disabled:opacity-70 disabled:cursor-not-allowed">Selesaikan</button>
                      <button type="button" onClick={() => handleCancelTicket(t)} disabled={processingId === t.id} className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold disabled:opacity-70 disabled:cursor-not-allowed">Batalkan</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {serviceRooms.map((room) => {
            const active = activeTickets.find((t) => t.roomId === room.id);
            const queue = waitingTickets.filter((t) => t.roomId === room.id);
            const next = queue[0];
            const rest = queue.slice(1);
            const busy = !!active;
            const staff = (t) => t.doctorName || t.groomerName || "-";
            return (
              <section key={room.id} aria-label={room.name} className="bg-bg-surface rounded-[2rem] p-6 md:p-8 border border-border-subtle shadow-xl space-y-6">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h2 className="text-2xl font-black text-text-main">{room.name}</h2>
                  <div className="flex items-center gap-2">
                    <span role="status" aria-atomic="true" className={`px-3 py-1 rounded-full text-xs font-bold ${busy ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200" : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"}`}>
                      {busy ? "Sedang Melayani" : "Ruang Tersedia"}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                      {queue.length} menunggu
                    </span>
                  </div>
                </div>

                {active ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-bold text-text-secondary">{active.queueNumber || active.id.slice(0, 6)}</p>
                      <h3 className="text-3xl font-black text-text-main">{active.nama}</h3>
                      <p className="text-text-secondary">Petugas: {staff(active)} - Jam {active.jam || "--:--"}</p>
                    </div>
                    {active.catatan && (
                      <div className="bg-bg-subtle/50 p-4 rounded-2xl border border-border-subtle flex gap-3 items-start">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-text-muted shrink-0 mt-0.5" aria-hidden="true" />
                        <p className="text-text-secondary italic">"{active.catatan}"</p>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button type="button" onClick={() => handleCompleteTicket(active)} disabled={processingId === active.id} className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                        {processingId === active.id ? (<><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Memproses...</span></>) : (<><CheckIcon className="w-5 h-5" aria-hidden="true" /><span>Selesaikan</span></>)}
                      </button>
                      <button type="button" onClick={() => handleCancelTicket(active)} disabled={processingId === active.id} className="flex-1 py-4 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl font-bold border-2 border-rose-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                        <XCircleIcon className="w-5 h-5" aria-hidden="true" /><span>Batalkan</span>
                      </button>
                    </div>
                  </div>
                ) : next ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-bold text-text-secondary">Berikutnya - {next.queueNumber || next.id.slice(0, 6)}</p>
                      <h3 className="text-3xl font-black text-text-main">{next.nama}</h3>
                      <p className="text-text-secondary">Petugas: {staff(next)} - Jam {next.jam || "--:--"}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button type="button" onClick={() => handleTakeTicket(next)} disabled={processingId === next.id} className={`flex-1 py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${isGrooming ? "bg-indigo-700 hover:bg-indigo-800" : "bg-rose-700 hover:bg-rose-800"}`}>
                        {processingId === next.id ? (<><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Memproses...</span></>) : (<><span>Panggil &amp; Mulai</span><ArrowRightIcon className="w-5 h-5" aria-hidden="true" /></>)}
                      </button>
                      <button type="button" onClick={() => handleCancelTicket(next)} disabled={processingId === next.id} className="flex-1 py-4 rounded-2xl text-rose-700 font-bold border-2 border-rose-200 hover:bg-rose-50 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                        <XCircleIcon className="w-5 h-5" aria-hidden="true" /><span>Batalkan</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-text-secondary">
                    <SparklesIcon className="w-8 h-8 mx-auto mb-2 text-text-muted" aria-hidden="true" />
                    <p>Belum ada antrean untuk ruang ini</p>
                  </div>
                )}

                {rest.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Antrean Selanjutnya</h4>
                    <ul className="space-y-2">
                      {rest.map((t) => (
                        <li key={t.id} className="flex justify-between gap-2 text-sm bg-bg-subtle/50 rounded-xl px-3 py-2 border border-border-subtle text-text-main">
                          <span className="font-bold">{t.queueNumber || t.id.slice(0, 6)} - {t.nama}</span>
                          <span className="text-text-secondary">{t.jam || "--:--"} - {staff(t)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
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
