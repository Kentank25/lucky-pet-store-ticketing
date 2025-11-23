import TicketList from '../../components/tickets/TicketList';
import { useTickets } from '../../hooks/useTickets';
import { useRole } from '../../context/RoleContext';

export default function PicDashboard() {
  const { tickets, loading } = useTickets();
  const { role } = useRole();
  
  const service = role === 'pic_grooming' ? 'Grooming' : 'Klinik';

  if (loading) return <div className="text-center py-12">Loading...</div>;

  // PIC only sees WAITING/aktif tickets for their service
  const myTickets = tickets.filter(t => 
    (t.status === 'WAITING' || t.status === 'aktif') && 
    t.layanan === service
  );

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard PIC {service}</h2>
          <p className="text-gray-600">Daftar antrian aktif untuk layanan {service}.</p>
        </div>
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold text-xl">
          {myTickets.length}
        </div>
      </div>

      <TicketList tickets={myTickets} />
    </div>
  );
}
