import { useState } from 'react';
import TicketForm from '../../components/tickets/TicketForm';
import TicketList from '../../components/tickets/TicketList';
import LogList from '../../components/history/LogList';
import { useTickets } from '../../hooks/useTickets';

export default function AdminDashboard() {
  const { tickets, loading } = useTickets();
  const [ticketToEdit, setTicketToEdit] = useState(null);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  const pendingTickets = tickets.filter(t => t.status === 'PENDING');
  const activeTickets = tickets.filter(t => t.status === 'WAITING' || t.status === 'aktif');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Left Column: Form & Logs */}
      <div className="space-y-8">
        <TicketForm 
          ticketToEdit={ticketToEdit} 
          onCancel={() => setTicketToEdit(null)} 
        />
        
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">Riwayat Aktivitas</h3>
          <LogList />
        </div>
      </div>

      {/* Right Column: Ticket Lists */}
      <div className="lg:col-span-2 space-y-8">
        {/* Validation Queue */}
        {pendingTickets.length > 0 && (
          <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              Menunggu Validasi ({pendingTickets.length})
            </h3>
            <TicketList tickets={pendingTickets} />
          </div>
        )}

        {/* Active Queue */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Antrian Aktif ({activeTickets.length})
          </h3>
          <TicketList 
            tickets={activeTickets} 
            onEdit={setTicketToEdit} 
          />
        </div>
      </div>
    </div>
  );
}
