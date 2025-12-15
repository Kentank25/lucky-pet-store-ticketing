import TicketCard from "./TicketCard";
import TicketSkeleton from "./TicketSkeleton";

export default function TicketList({
  tickets,
  onEdit,
  filterStatus,
  filterService,
  cardClassName,
}) {
  let filteredTickets = tickets;

  if (filterStatus) {
    filteredTickets = filteredTickets.filter((t) =>
      filterStatus.includes(t.status)
    );
  }

  if (filterService) {
    filteredTickets = filteredTickets.filter(
      (t) => t.layanan === filterService
    );
  }

  if (filteredTickets.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted bg-bg-surface rounded-lg border border-dashed border-border-subtle">
        Tidak ada tiket yang sesuai.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {filteredTickets.map((ticket, index) => (
        <div
          key={ticket.id}
          style={{ animationDelay: `${index * 100}ms` }}
          className="animate-fade-in"
        >
          <TicketCard
            ticket={ticket}
            onEdit={onEdit}
            className={`${cardClassName} !animate-none`}
          />
        </div>
      ))}
    </div>
  );
}
