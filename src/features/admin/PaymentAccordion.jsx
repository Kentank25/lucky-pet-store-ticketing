import AccordionItem from "../../components/common/AccordionItem";
import { SERVICE_TYPE } from "../../constants";

export default function PaymentAccordion({
  title,
  items,
  isOpen,
  onToggle,
  icon,
  selectedPaymentIds,
  onToggleSelect,
  onSelectAll,
}) {
  if (items.length === 0) return null;

  const allSelected = items.every((t) => selectedPaymentIds.has(t.id));
  const someSelected = items.some((t) => selectedPaymentIds.has(t.id));

  const headerCheckbox = (
    <div
      onClick={(e) => e.stopPropagation()}
      className="flex items-center bg-white/50 dark:bg-black/20 px-3 py-1.5 rounded-xl border border-white/10 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <input
        type="checkbox"
        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer mr-2 transition-transform active:scale-95"
        checked={allSelected}
        ref={(input) => {
          if (input) input.indeterminate = someSelected && !allSelected;
        }}
        onChange={(e) => onSelectAll(items, e.target.checked)}
      />
      <span className="text-xs font-bold text-text-secondary select-none">
        Pilih Semua
      </span>
    </div>
  );

  return (
    <AccordionItem
      title={title}
      count={items.length}
      icon={icon}
      isOpen={isOpen}
      onToggle={onToggle}
      colorClass="indigo"
      headerExtras={headerCheckbox}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((ticket) => (
          <div
            key={ticket.id}
            onClick={() => onToggleSelect(ticket.id)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 relative group flex flex-col justify-between ${
              selectedPaymentIds.has(ticket.id)
                ? "bg-indigo-50 border-indigo-200 shadow-md shadow-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800 dark:shadow-none bg-checked-pattern"
                : "bg-bg-surface/40 border-border-subtle hover:bg-bg-surface hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg hover:-translate-y-0.5"
            }`}
          >
            <div className="flex justify-between items-start mb-3">
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
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedPaymentIds.has(ticket.id)
                    ? "bg-indigo-500 border-indigo-500"
                    : "border-gray-300 dark:border-gray-600 group-hover:border-indigo-400"
                }`}
              >
                {selectedPaymentIds.has(ticket.id) && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>

            <div>
              <h5
                className={`font-bold text-sm mb-1 line-clamp-1 transition-colors ${
                  selectedPaymentIds.has(ticket.id)
                    ? "text-indigo-900 dark:text-indigo-100"
                    : "text-text-main"
                }`}
              >
                {ticket.nama}
              </h5>

              <div className="flex items-center gap-2 text-xs text-text-muted font-medium">
                <span>
                  {new Date(ticket.tanggalRilis).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                {ticket.jam && <span className="opacity-60">•</span>}
                {ticket.jam && <span>{ticket.jam}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AccordionItem>
  );
}
