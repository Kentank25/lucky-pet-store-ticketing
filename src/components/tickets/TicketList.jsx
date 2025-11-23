import TicketCard from './TicketCard';

export default function TicketList({ tickets, onEdit, filterStatus, filterService }) {
  let filteredTickets = tickets;

  if (filterStatus) {
    filteredTickets = filteredTickets.filter(t => filterStatus.includes(t.status));
  }

  if (filterService) {
    filteredTickets = filteredTickets.filter(t => t.layanan === filterService);
  }

  if (filteredTickets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
        Tidak ada tiket yang sesuai.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {filteredTickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} onEdit={onEdit} />
      ))}
    </div>
  );
}
