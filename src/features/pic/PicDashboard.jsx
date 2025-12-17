import { useTickets } from "../../hooks/useTickets";
import {
  ScissorsIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  TicketIcon,
  CheckIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { updateTicketStatus } from "../../services/ticketService";
import toast from "react-hot-toast";
import { TICKET_STATUS, SERVICE_TYPE } from "../../constants";
import TicketSkeleton from "../../components/tickets/TicketSkeleton";
import { useState } from "react";
import ThemeToggle from "../../components/common/ThemeToggle";

export default function PicDashboard() {
  const { tickets, loading } = useTickets();
  const { role } = useAuth();

  const service =
    role === "pic_grooming" ? SERVICE_TYPE.GROOMING : SERVICE_TYPE.KLINIK;
  const isGrooming = service === SERVICE_TYPE.GROOMING;

  const [processingId, setProcessingId] = useState(null);

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

  // Filter tickets
  const activeTickets = tickets.filter(
    (t) => t.status === TICKET_STATUS.ACTIVE && t.layanan === service
  );

  // Get waiting tickets, sorted by date/time
  const waitingTickets = tickets
    .filter((t) => t.status === TICKET_STATUS.WAITING && t.layanan === service)
    .sort((a, b) => {
      const timeA = a.jam || "00:00";
      const timeB = b.jam || "00:00";
      const dateA = new Date(`${a.tanggalRilis}T${timeA}`);
      const dateB = new Date(`${b.tanggalRilis}T${timeB}`);
      return dateA - dateB; // Ascending
    });

  const completedCount = tickets.filter(
    (t) =>
      (t.status === TICKET_STATUS.COMPLETED ||
        t.status === TICKET_STATUS.PAYMENT) &&
      t.layanan === service
  ).length;

  const handleTakeTicket = async () => {
    if (waitingTickets.length === 0) return;
    const nextTicket = waitingTickets[0];

    if (!confirm(`Ambil antrian untuk ${nextTicket.nama}?`)) return;

    setProcessingId(nextTicket.id);
    try {
      await updateTicketStatus(
        nextTicket.id,
        TICKET_STATUS.ACTIVE,
        "Tiket diambil oleh PIC.",
        nextTicket
      );
      toast.success(`Berhasil mengambil antrian: ${nextTicket.nama}`);
    } catch (error) {
      console.error(error);
      toast.error(`Gagal: ${error.message || "Terjadi kesalahan"}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCompleteTicket = async (ticket) => {
    if (!confirm("Apakah layanan sudah selesai? Lanjut ke pembayaran?")) return;

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
  };

  const ThemeIcon = isGrooming ? ScissorsIcon : HeartIcon;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8 animate-fade-in pb-24 font-sans min-h-screen transition-colors duration-500">
      {/* Background Texture */}
      <div className="fixed inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] pointer-events-none"></div>

      {/* HEADER SECTION */}
      <div
        className={`relative rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl transition-all duration-500 glow-secondary group ${
          isGrooming
            ? "bg-linear-to-br from-blue-500 via-indigo-600 to-violet-700 dark:from-indigo-700 dark:via-indigo-800 dark:to-violet-900 shadow-indigo-500/30 dark:shadow-indigo-900/20"
            : "bg-linear-to-br from-rose-500 via-rose-600 to-pink-700 dark:from-rose-600 dark:via-rose-700 dark:to-pink-800 shadow-rose-500/30 dark:shadow-rose-500/20"
        }`}
      >
        {/* Dynamic Abstract Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-[0.1] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-[0.1] rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

        {/* Header Content */}
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

      {/* ACTIVE TICKET AREA */}
      {activeTickets.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-1">
            <div className="relative flex h-3 w-3">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-30 ${
                  isGrooming ? "bg-indigo-400" : "bg-rose-400"
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isGrooming ? "bg-indigo-500" : "bg-rose-500"
                }`}
              ></span>
            </div>
            <h2 className="text-lg font-bold text-text-secondary uppercase tracking-widest">
              Sedang Diproses
            </h2>
          </div>

          {activeTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-bg-surface p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-300 border border-border-subtle border-t-4 border-t-transparent hover:border-t-emerald-400"
            >
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative z-10">
                <div className="flex-1 space-y-6">
                  <div className="flex justify-between items-start">
                    <span
                      className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${
                        isGrooming
                          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                      }`}
                    >
                      {ticket.layanan}
                    </span>
                    <div className="text-right">
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                        Waktu Mulai
                      </p>
                      <p className="text-2xl font-black text-text-main font-mono">
                        {ticket.jam || "--:--"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-4xl md:text-5xl font-black text-text-main tracking-tight leading-none mb-2">
                      {ticket.nama}
                    </h3>
                    <p className="text-text-muted font-mono text-sm opacity-60">
                      ID: {ticket.id}
                    </p>
                  </div>

                  {ticket.catatan && (
                    <div className="bg-bg-subtle/50 p-6 rounded-3xl border border-border-subtle flex gap-4 items-start">
                      <ChatBubbleLeftRightIcon className="w-6 h-6 text-text-muted shrink-0 mt-1" />
                      <p className="text-text-secondary italic leading-relaxed">
                        "{ticket.catatan}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="lg:w-80 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-border-subtle pt-8 lg:pt-0 lg:pl-10">
                  <button
                    onClick={() => handleCompleteTicket(ticket)}
                    disabled={processingId === ticket.id}
                    className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group-hover:scale-105"
                  >
                    {processingId === ticket.id ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-6 h-6 stroke-[3px]" />
                        <span>Selesaikan</span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-text-muted mt-4 font-medium">
                    Klik jika layanan sudah selesai
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* WAITING LIST SECTION */}
      {activeTickets.length === 0 && waitingTickets.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <h2 className="text-lg font-bold text-text-secondary uppercase tracking-widest">
              Antrian Berikutnya
            </h2>
          </div>

          <div className="group bg-bg-surface rounded-[2.5rem] p-10 md:p-14 text-center border border-border-subtle shadow-2xl relative overflow-hidden">
            <div
              className={`absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 ${
                isGrooming ? "bg-indigo-600" : "bg-rose-600"
              }`}
            ></div>

            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <div className="inline-flex p-6 rounded-full bg-bg-subtle mb-4 group-hover:scale-110 transition-transform duration-500">
                <TicketIcon className="w-16 h-16 text-text-main opacity-80" />
              </div>

              <div>
                <h3 className="text-3xl md:text-4xl font-black text-text-main mb-2">
                  Siap untuk pelanggan berikutnya?
                </h3>
                <p className="text-xl text-text-secondary">
                  <strong className="text-text-main underline decoration-2 decoration-border-main underline-offset-4">
                    {waitingTickets[0].nama}
                  </strong>{" "}
                  sedang menunggu.
                </p>
              </div>

              <button
                onClick={handleTakeTicket}
                disabled={!!processingId}
                className={`w-full md:w-auto px-12 py-5 rounded-2xl text-white font-bold text-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 mx-auto ${
                  isGrooming
                    ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30"
                    : "bg-rose-600 hover:bg-rose-700 shadow-rose-500/30"
                }`}
              >
                <span>Panggil & Mulai</span>
                <ArrowRightIcon className="w-6 h-6 stroke-[3px]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}
      {activeTickets.length === 0 && waitingTickets.length === 0 && (
        <div className="py-24 text-center glass-panel rounded-[3rem] border-dashed border-2 border-border-subtle/50">
          <div className="w-24 h-24 bg-bg-subtle rounded-full flex items-center justify-center mx-auto mb-6">
            <SparklesIcon className="w-10 h-10 text-text-muted" />
          </div>
          <h3 className="text-2xl font-bold text-text-main mb-2">
            Semua Beres!
          </h3>
          <p className="text-text-secondary max-w-xs mx-auto">
            Tidak ada antrian saat ini. Silakan beristirahat.
          </p>
        </div>
      )}
    </div>
  );
}
