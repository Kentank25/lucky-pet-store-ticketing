import {
  CheckIcon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { updateTicketStatus } from "../../services/ticketService";
import { TICKET_STATUS } from "../../constants";
import toast from "react-hot-toast";
import TicketSkeleton from "../../components/tickets/TicketSkeleton";
import { useState } from "react";

export default function ValidationAccordion({
  title,
  items,
  isOpen,
  onToggle,
  icon,
  loading,
}) {
  const [processingId, setProcessingId] = useState(null);

  const handleValidation = async (id, isValid, ticket) => {
    if (
      !confirm(
        isValid
          ? `Konfirmasi kedatangan untuk ${ticket.nama}?`
          : `Batalkan tiket untuk ${ticket.nama}?`
      )
    )
      return;

    setProcessingId(id);
    try {
      if (isValid) {
        await updateTicketStatus(
          id,
          TICKET_STATUS.WAITING,
          "Tamu dikonfirmasi hadir. Masuk daftar tunggu.",
          ticket
        );
        toast.success("Tamu dikonfirmasi!");
      } else {
        await updateTicketStatus(
          id,
          TICKET_STATUS.CANCELLED,
          "Dibatalkan oleh Admin (Tidak Hadir).",
          ticket
        );
        toast.success("Tiket dibatalkan.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal memperbarui status.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="glass-panel overflow-hidden rounded-3xl border border-white/20 dark:border-white/5 transition-all duration-500 mb-4 group hover:shadow-lg">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white/50 dark:bg-white/10 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300 shadow-sm">
            {icon}
          </div>
          <div className="text-left">
            <h4 className="font-bold text-lg text-text-main flex items-center gap-2">
              {title}
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {items.length}
              </span>
            </h4>
            <p className="text-xs text-text-secondary font-medium">
              Menunggu konfirmasi kedatangan
            </p>
          </div>
        </div>
        <ChevronDownIcon
          className={`w-5 h-5 text-text-muted transition-transform duration-500 ${
            isOpen ? "rotate-180 text-indigo-500" : ""
          }`}
        />
      </button>

      <div
        className={`transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-5 space-y-3 bg-white/30 dark:bg-slate-900/30 border-t border-white/20 dark:border-white/5">
          {loading ? (
            <TicketSkeleton />
          ) : items.length === 0 ? (
            <p className="text-center text-text-muted py-8 text-sm italic font-medium">
              Tidak ada antrian validasi.
            </p>
          ) : (
            items.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white/60 dark:bg-slate-800/60 p-5 rounded-2xl border border-white/40 dark:border-white/5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group/card"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold text-text-muted bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600">
                      ID: {ticket.id}
                    </span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                      {ticket.jam}
                    </span>
                  </div>
                  <h4 className="font-bold text-text-main text-lg">
                    {ticket.nama}
                  </h4>
                  <p className="text-sm text-text-secondary">
                    {ticket.hewan} ({ticket.jenisHewan})
                  </p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleValidation(ticket.id, false, ticket)}
                    disabled={processingId === ticket.id}
                    className="flex-1 sm:flex-none px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-sm transition-colors border border-rose-200 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 dark:text-rose-400 dark:border-rose-900/50 flex items-center justify-center gap-2"
                    title="Batalkan (Tidak Hadir)"
                  >
                    <XMarkIcon className="w-5 h-5" />
                    <span className="sm:hidden">Batal</span>
                  </button>
                  <button
                    onClick={() => handleValidation(ticket.id, true, ticket)}
                    disabled={processingId === ticket.id}
                    className="flex-1 sm:flex-none px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                    title="Konfirmasi Hadir"
                  >
                    {processingId === ticket.id ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <CheckIcon className="w-5 h-5 stroke-[2.5px]" />
                        <span className="hidden sm:inline">Konfirmasi</span>
                        <span className="sm:hidden">Hadir</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
