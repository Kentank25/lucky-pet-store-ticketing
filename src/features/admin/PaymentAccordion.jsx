// PaymentAccordion.jsx
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { updateTicketStatus } from "../../services/ticketService";
import { TICKET_STATUS, SERVICE_TYPE } from "../../constants";
import toast from "react-hot-toast";
import TicketSkeleton from "../../components/tickets/TicketSkeleton";
import { useState } from "react";

export default function PaymentAccordion({
  title,
  items,
  isOpen,
  onToggle,
  icon,
  selectedPaymentIds,
  onToggleSelect,
  onSelectAll,
  loading,
}) {
  const [processingId, setProcessingId] = useState(null);

  const handleConfirmPayment = async (id, ticket) => {
    if (!confirm(`Konfirmasi pembayaran untuk ${ticket.nama}?`)) return;

    setProcessingId(id);
    try {
      await updateTicketStatus(
        id,
        TICKET_STATUS.COMPLETED,
        "Pembayaran diterima. Tiket selesai.",
        ticket
      );
      toast.success("Pembayaran berhasil dikonfirmasi!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal memperbarui status.");
    } finally {
      setProcessingId(null);
    }
  };

  const isAllSelected =
    items.length > 0 && items.every((t) => selectedPaymentIds.has(t.id));

  return (
    <div className="glass-panel overflow-hidden rounded-3xl border border-white/20 dark:border-white/5 transition-all duration-500 mb-4 group hover:shadow-lg">
      <div
        className="w-full flex items-center justify-between p-5 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
        onClick={onToggle}
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
              Menunggu pembayaran
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div onClick={(e) => e.stopPropagation()}>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-text-secondary">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                checked={isAllSelected}
                onChange={(e) => onSelectAll(items, e.target.checked)}
              />
              Pilih Semua
            </label>
          </div>
          <ChevronDownIcon
            className={`w-5 h-5 text-text-muted transition-transform duration-500 ${
              isOpen ? "rotate-180 text-indigo-500" : ""
            }`}
          />
        </div>
      </div>

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
              Tidak ada pembayaran tertunda.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => onToggleSelect(ticket.id)}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer group/card relative overflow-hidden ${
                    selectedPaymentIds.has(ticket.id)
                      ? "bg-indigo-50/80 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 shadow-md ring-1 ring-indigo-500/20"
                      : "bg-white/60 dark:bg-slate-800/60 border-white/40 dark:border-white/5 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:scale-[1.01]"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`text-[10px] px-2 py-1 rounded-lg font-black uppercase tracking-widest ${
                        ticket.layanan === SERVICE_TYPE.GROOMING
                          ? "bg-blue-100/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : "bg-rose-100/80 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                      }`}
                    >
                      {ticket.layanan}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        selectedPaymentIds.has(ticket.id)
                          ? "bg-indigo-500 border-indigo-500 scale-110 shadow-lg shadow-indigo-500/30"
                          : "border-gray-300 dark:border-gray-600 group-hover/card:border-indigo-400 bg-white dark:bg-slate-800"
                      }`}
                    >
                      {selectedPaymentIds.has(ticket.id) && (
                        <CheckIcon className="w-4 h-4 text-white stroke-[3px]" />
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-text-muted bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-lg border border-gray-200 dark:border-gray-600">
                        ID: {ticket.id}
                      </span>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                        {ticket.jam}
                      </span>
                    </div>
                    <h4 className="font-bold text-text-main text-lg mb-1 line-clamp-1">
                      {ticket.nama}
                    </h4>
                    <p className="text-sm text-text-secondary line-clamp-1">
                      {ticket.hewan} ({ticket.jenisHewan})
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirmPayment(ticket.id, ticket);
                      }}
                      disabled={processingId === ticket.id}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 transition-all flex items-center gap-2 z-10"
                    >
                      {processingId === ticket.id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <CheckIcon className="w-4 h-4 stroke-[2.5px]" />
                          <span>Konfirmasi</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
