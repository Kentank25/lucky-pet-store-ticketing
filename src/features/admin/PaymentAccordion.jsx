import TicketSkeleton from "../../components/tickets/TicketSkeleton";
import TicketCard from "../../components/tickets/TicketCard";
import AccordionItem from "../../components/common/AccordionItem";

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
  const isAllSelected =
    items.length > 0 && items.every((t) => selectedPaymentIds.has(t.id));

  return (
    <AccordionItem
      title={title}
      count={items.length}
      icon={icon}
      isOpen={isOpen}
      onToggle={onToggle}
      subtitle="Menunggu pembayaran"
      colorClass="indigo"
      headerExtras={
        <div onClick={(e) => e.stopPropagation()}>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-text-secondary hover:text-indigo-600 transition-colors">
            <input
              type="checkbox"
              className="rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 transition-all"
              checked={isAllSelected}
              onChange={(e) => onSelectAll(items, e.target.checked)}
            />
            Pilih Semua
          </label>
        </div>
      }
    >
      <div className="space-y-4">
        {loading ? (
          <TicketSkeleton />
        ) : items.length === 0 ? (
          <p className="text-center text-text-muted py-8 text-sm italic font-medium">
            Tidak ada pembayaran tertunda.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {items.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                isSelected={selectedPaymentIds.has(ticket.id)}
                onSelect={() => onToggleSelect(ticket.id)}
              />
            ))}
          </div>
        )}
      </div>
    </AccordionItem>
  );
}
