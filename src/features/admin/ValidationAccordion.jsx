import TicketSkeleton from "../../components/tickets/TicketSkeleton";
import TicketCard from "../../components/tickets/TicketCard";
import AccordionItem from "../../components/common/AccordionItem";

export default function ValidationAccordion({
  title,
  items,
  isOpen,
  onToggle,
  icon,
  loading,
}) {
  return (
    <AccordionItem
      title={title}
      count={items.length}
      icon={icon}
      isOpen={isOpen}
      onToggle={onToggle}
      subtitle="Menunggu konfirmasi kedatangan"
      colorClass="amber"
    >
      <div className="space-y-4">
        {loading ? (
          <TicketSkeleton />
        ) : items.length === 0 ? (
          <p className="text-center text-text-muted py-8 text-sm italic font-medium">
            Tidak ada antrian validasi.
          </p>
        ) : (
          items.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
        )}
      </div>
    </AccordionItem>
  );
}
