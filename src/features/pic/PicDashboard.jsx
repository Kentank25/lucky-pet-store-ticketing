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

export default function PicDashboard() {
  const { tickets, loading } = useTickets();
  const { role } = useAuth();

  const service =
    role === "pic_grooming" ? SERVICE_TYPE.GROOMING : SERVICE_TYPE.KLINIK;
  const isGrooming = service === SERVICE_TYPE.GROOMING;

  const [processingId, setProcessingId] = useState(null);

  if (loading)
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8 animate-fade-in pb-24">
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

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8 animate-fade-in pb-24">
      {/* Hero Header Section */}
      <div
        className={`relative rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 overflow-hidden shadow-2xl transition-all duration-500 ${
          isGrooming
            ? "bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 shadow-blue-200"
            : "bg-linear-to-br from-rose-500 via-pink-600 to-orange-500 shadow-rose-200"
        }`}
      >
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl mix-blend-overlay animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl mix-blend-overlay"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs md:text-sm font-bold tracking-wider uppercase border border-white/10 shadow-lg">
                Dashboard PIC
              </span>
              <span className="text-2xl">
                {isGrooming ? (
                  <ScissorsIcon className="w-6 h-6 md:w-8 md:h-8" />
                ) : (
                  <HeartIcon className="w-6 h-6 md:w-8 md:h-8" />
                )}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-black text-white tracking-tight mb-3 drop-shadow-sm">
              {service} Area
            </h1>
            <p className="text-white/90 text-sm md:text-lg font-medium max-w-md leading-relaxed">
              Selamat bekerja! Kelola antrian pelanggan dengan senyuman.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-4 w-full lg:w-auto overflow-x-auto no-scrollbar pb-2">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 md:p-5 rounded-2xl md:rounded-3xl flex flex-col items-center flex-1 min-w-[100px] md:min-w-[120px] shadow-xl hover:bg-white/20 transition-all cursor-default group">
              <span className="text-2xl md:text-4xl font-black text-white mb-1 group-hover:scale-110 transition-transform">
                {completedCount}
              </span>
              <span className="text-[10px] md:text-xs font-bold text-white/70 uppercase tracking-widest">
                Selesai
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 md:p-5 rounded-2xl md:rounded-3xl flex flex-col items-center flex-1 min-w-[100px] md:min-w-[120px] shadow-xl hover:bg-white/20 transition-all cursor-default group">
              <span className="text-2xl md:text-4xl font-black text-white mb-1 group-hover:scale-110 transition-transform">
                {waitingTickets.length}
              </span>
              <span className="text-[10px] md:text-xs font-bold text-white/70 uppercase tracking-widest">
                Antrian
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-8">
        {/* ACTIVE TICKET SECTION */}
        {activeTickets.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
              <h3 className="text-xl font-bold text-gray-700">
                Sedang Dikerjakan
              </h3>
            </div>

            {activeTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="group glass-panel rounded-4xl p-8 md:p-10 relative overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1"
              >
                {/* Decorative Side Bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-3 ${
                    isGrooming ? "bg-blue-500" : "bg-rose-500"
                  }`}
                ></div>

                <div className="relative z-10 flex flex-col lg:flex-row gap-8 lg:gap-12">
                  {/* Left: Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-6">
                      <span
                        className={`inline-block px-5 py-2 rounded-2xl text-sm font-bold mb-4 ${
                          isGrooming
                            ? "bg-blue-50 text-blue-600"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {ticket.layanan}
                      </span>
                      <div className="text-right">
                        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
                          Waktu Masuk
                        </div>
                        <div className="text-2xl font-black text-gray-800 font-mono">
                          {ticket.jam || "-"}
                        </div>
                      </div>
                    </div>

                    <h2 className="text-5xl font-black text-gray-800 mb-2 tracking-tight">
                      {ticket.nama}
                    </h2>
                    <p className="text-gray-400 font-medium text-lg mb-8">
                      ID: #{ticket.id.slice(-6)}
                    </p>

                    {ticket.catatan && (
                      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 relative">
                        <ChatBubbleLeftRightIcon className="absolute -top-3 -left-2 text-4xl opacity-20 w-8 h-8" />
                        <p className="text-gray-600 text-lg italic relative z-10 pl-4">
                          {ticket.catatan}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right: Action */}
                  <div className="lg:w-1/3 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-gray-100 pt-8 lg:pt-0 lg:pl-12">
                    <div className="mb-6 text-center lg:text-left">
                      <p className="text-gray-500 mb-2">Status Pengerjaan</p>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-2/3 animate-pulse rounded-full"></div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCompleteTicket(ticket)}
                      disabled={processingId === ticket.id}
                      className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-3 group-hover:shadow-emerald-300 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {processingId === ticket.id ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <>
                          <span>Selesaikan Layanan</span>
                          <CheckIcon className="h-6 w-6" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAKE TICKET SECTION */}
        {activeTickets.length === 0 && waitingTickets.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <h3 className="text-xl font-bold text-gray-700">
                Menunggu Tindakan
              </h3>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-10 text-center relative overflow-hidden group">
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ${
                  isGrooming ? "bg-blue-600" : "bg-rose-600"
                }`}
              ></div>

              <div className="relative z-10 max-w-2xl mx-auto">
                <div className="flex justify-center mb-6">
                  <TicketIcon className="text-7xl animate-bounce text-gray-800 w-20 h-20" />
                </div>
                <h3 className="text-3xl font-black text-gray-800 mb-3">
                  Antrian Tersedia
                </h3>
                <p className="text-gray-500 text-lg mb-10">
                  Pelanggan{" "}
                  <span className="font-bold text-gray-800">
                    {waitingTickets[0].nama}
                  </span>{" "}
                  sedang menunggu layanan Anda.
                </p>

                <button
                  onClick={handleTakeTicket}
                  className={`mx-auto px-10 py-5 rounded-2xl text-white font-bold text-xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 ${
                    isGrooming
                      ? "bg-blue-600 shadow-blue-200 hover:bg-blue-700"
                      : "bg-rose-600 shadow-rose-200 hover:bg-rose-700"
                  }`}
                >
                  <span>Panggil & Ambil Antrian</span>
                  <ArrowRightIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {activeTickets.length === 0 && waitingTickets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-6 animate-pulse">
              <SparklesIcon className="text-gray-600 w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">
              Tidak ada antrian
            </h3>
            <p className="text-gray-400">Silakan istirahat sejenak.</p>
          </div>
        )}
      </div>
    </div>
  );
}
