import { useState } from 'react';
import TicketForm from '../../components/tickets/TicketForm';
import TicketList from '../../components/tickets/TicketList';
import LogList from '../../components/history/LogList';
import { useTickets } from '../../hooks/useTickets';

export default function AdminDashboard() {
  const { tickets, loading } = useTickets();
  const [ticketToEdit, setTicketToEdit] = useState(null);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

  const pendingTickets = tickets.filter(t => t.status === 'PENDING');
  const activeTickets = tickets.filter(t => t.status === 'WAITING' || t.status === 'aktif');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      {/* Left Column: Form & Logs (4 cols) */}
      <div className="lg:col-span-4 space-y-8">
        <TicketForm 
          ticketToEdit={ticketToEdit} 
          onCancel={() => setTicketToEdit(null)} 
        />
        
        <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-gray-100 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="bg-blue-100 p-2 rounded-lg text-blue-600">📜</span>
            Riwayat Aktivitas
          </h3>
          <LogList />
        </div>
      </div>

      {/* Right Column: Ticket Lists (8 cols) */}
      <div className="lg:col-span-8 space-y-8">
        {/* Validation Queue */}
        {pendingTickets.length > 0 && (
          <div className="bg-amber-50/50 p-8 rounded-[2.5rem] border border-amber-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-bl-[4rem] -z-10 opacity-50"></div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></div>
              Menunggu Validasi 
              <span className="bg-amber-200 text-amber-800 text-sm px-3 py-1 rounded-full">{pendingTickets.length}</span>
            </h3>
            <TicketList tickets={pendingTickets} />
          </div>
        )}

        {/* Active Queue */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            Antrian Aktif
            <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">{activeTickets.length}</span>
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
