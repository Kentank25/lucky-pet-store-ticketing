import { useState } from 'react';
import TicketForm from '../../components/tickets/TicketForm';
import TicketList from '../../components/tickets/TicketList';
import LogList from '../../components/history/LogList';
import { useTickets } from '../../hooks/useTickets';
import { updateTicketStatus } from '../../services/ticketService';
import toast from 'react-hot-toast';
import AdminAnalytics from './AdminAnalytics';
import { TICKET_STATUS, SERVICE_TYPE } from '../../constants';

const PaymentAccordion = ({ title, items, isOpen, onToggle, icon, selectedPaymentIds, onToggleSelect, onSelectAll }) => {
  if (items.length === 0) return null;
  
  const allSelected = items.every(t => selectedPaymentIds.has(t.id));
  const someSelected = items.some(t => selectedPaymentIds.has(t.id));

  return (
    <div className="bg-white rounded-[2rem] border border-purple-100 overflow-hidden mb-6 shadow-lg shadow-purple-100/50 transition-all duration-300">
      <div 
          className="p-6 flex items-center justify-between bg-white cursor-pointer select-none hover:bg-gray-50 transition-colors" 
          onClick={onToggle}
      >
         <div className="flex items-center gap-4">
            <div onClick={(e) => e.stopPropagation()} className="flex items-center">
              <input 
                type="checkbox" 
                className="w-6 h-6 rounded-lg border-gray-300 text-purple-600 focus:ring-purple-500 transition-all cursor-pointer"
                checked={allSelected}
                ref={input => {
                  if (input) input.indeterminate = someSelected && !allSelected;
                }}
                onChange={(e) => onSelectAll(items, e.target.checked)}
              />
            </div>
            <div className="flex items-center gap-3">
                <span className="text-2xl bg-gray-100 w-10 h-10 flex items-center justify-center rounded-full">{icon}</span>
                <div>
                    <h4 className="font-bold text-gray-800 text-lg">{title}</h4>
                    <p className="text-gray-400 text-xs font-medium">{items.length} Menunggu Pembayaran</p>
                </div>
            </div>
         </div>
         <div className={`w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
             <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
           </svg>
         </div>
      </div>
      
      {isOpen && (
        <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          {items.map(ticket => (
            <div 
              key={ticket.id} 
              onClick={() => onToggleSelect(ticket.id)}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 relative group ${
              selectedPaymentIds.has(ticket.id) 
                  ? 'bg-purple-50 border-purple-400 shadow-md' 
                  : 'bg-white border-gray-100 hover:border-purple-200 hover:shadow-md'
            }`}>
               <div className="absolute top-5 right-5">
                   <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      checked={selectedPaymentIds.has(ticket.id)}
                      onChange={() => onToggleSelect(ticket.id)}
                      onClick={(e) => e.stopPropagation()}
                   />
               </div>

               <div className="pr-8">
                  <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                          ticket.layanan === SERVICE_TYPE.GROOMING ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                          {ticket.layanan}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">#{ticket.id.slice(-6)}</span>
                  </div>
                  
                  <h5 className="font-bold text-gray-800 text-lg mb-1">{ticket.nama}</h5>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                          📅 {new Date(ticket.tanggalRilis).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                      {ticket.jam && (
                          <span className="flex items-center gap-1">
                              ⏰ {ticket.jam}
                          </span>
                      )}
                  </div>
                  
                  {ticket.catatan && (
                      <p className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg italic line-clamp-2">
                          "{ticket.catatan}"
                      </p>
                  )}
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ValidationAccordion = ({ title, items, isOpen, onToggle, icon }) => {
  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-[2rem] border border-amber-100 overflow-hidden mb-6 shadow-lg shadow-amber-100/50 transition-all duration-300">
      <div 
          className="p-6 flex items-center justify-between bg-white cursor-pointer select-none hover:bg-gray-50 transition-colors" 
          onClick={onToggle}
      >
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
                <span className="text-2xl bg-gray-100 w-10 h-10 flex items-center justify-center rounded-full">{icon}</span>
                <div>
                    <h4 className="font-bold text-gray-800 text-lg">{title}</h4>
                    <p className="text-gray-400 text-xs font-medium">{items.length} Menunggu Validasi</p>
                </div>
            </div>
         </div>
         <div className={`w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
             <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
           </svg>
         </div>
      </div>
      
      {isOpen && (
        <div className="p-6 pt-0 animate-fade-in">
           <TicketList tickets={items} />
        </div>
      )}
    </div>
  );
};

export default function AdminDashboard() {
  const { tickets, loading } = useTickets();
  const [ticketToEdit, setTicketToEdit] = useState(null);
  const [selectedPaymentIds, setSelectedPaymentIds] = useState(new Set());
  const [expandedSections, setExpandedSections] = useState({ Grooming: true, Klinik: true });
  const [expandedValidationSections, setExpandedValidationSections] = useState({ Grooming: true, Klinik: true });
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

  const pendingTickets = tickets
    .filter(t => t.status === TICKET_STATUS.PENDING)
    .sort((a, b) => {
      const timeA = a.jam || '00:00';
      const timeB = b.jam || '00:00';
      const dateA = new Date(`${a.tanggalRilis}T${timeA}`);
      const dateB = new Date(`${b.tanggalRilis}T${timeB}`);
      return dateA - dateB;
    });
  const paymentTickets = tickets.filter(t => t.status === TICKET_STATUS.PAYMENT);
  const activeTickets = tickets.filter(t => t.status === TICKET_STATUS.WAITING || t.status === TICKET_STATUS.ACTIVE);

  const pendingGrooming = pendingTickets.filter(t => t.layanan === SERVICE_TYPE.GROOMING);
  const pendingKlinik = pendingTickets.filter(t => t.layanan === SERVICE_TYPE.KLINIK);

  const paymentGrooming = paymentTickets.filter(t => t.layanan === SERVICE_TYPE.GROOMING);
  const paymentKlinik = paymentTickets.filter(t => t.layanan === SERVICE_TYPE.KLINIK);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleValidationSection = (section) => {
    setExpandedValidationSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedPaymentIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPaymentIds(newSelected);
  };

  const selectAllGroup = (groupTickets, isSelected) => {
    const newSelected = new Set(selectedPaymentIds);
    groupTickets.forEach(t => {
      if (isSelected) {
        newSelected.add(t.id);
      } else {
        newSelected.delete(t.id);
      }
    });
    setSelectedPaymentIds(newSelected);
  };

  const handleConfirmPayments = async (idsToConfirm) => {
    if (idsToConfirm.length === 0) return;
    if (!confirm(`Konfirmasi pembayaran untuk ${idsToConfirm.length} tiket?`)) return;

    const toastId = toast.loading('Memproses pembayaran...');
    try {
      await Promise.all(idsToConfirm.map(id => {
        const ticket = tickets.find(t => t.id === id);
        return updateTicketStatus(id, TICKET_STATUS.COMPLETED, 'Pembayaran diterima (Bulk Action). Tiket selesai.', ticket);
      }));
      toast.success('Pembayaran berhasil dikonfirmasi!', { id: toastId });
      
      // Clear selection of confirmed tickets
      const newSelected = new Set(selectedPaymentIds);
      idsToConfirm.forEach(id => newSelected.delete(id));
      setSelectedPaymentIds(newSelected);

    } catch (error) {
      console.error(error);
      toast.error('Gagal memproses beberapa pembayaran.', { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex space-x-2 bg-white p-1 rounded-2xl w-fit shadow-sm border border-gray-100">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'dashboard'
              ? 'bg-blue-500 text-white shadow-md'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'analytics'
              ? 'bg-blue-500 text-white shadow-md'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Analytics
        </button>
      </div>

      {activeTab === 'analytics' ? (
        <AdminAnalytics />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          {/* Left Column: Form & Logs (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            <TicketForm 
              ticketToEdit={ticketToEdit} 
              onCancel={() => setTicketToEdit(null)} 
            />
            
            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-100 h-[600px] flex flex-col overflow-hidden">
              <div className="p-6 pb-4 bg-white z-10 border-b border-gray-50">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="bg-blue-100 p-2 rounded-lg text-blue-600">📜</span>
                  Riwayat Aktivitas
                </h3>
              </div>
              <div className="overflow-y-auto flex-1 p-6 pt-4">
                <LogList />
              </div>
            </div>
          </div>

          {/* Right Column: Ticket Lists (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Validation Queue (Moved to Top) */}
            {pendingTickets.length > 0 && (
              <div className="bg-amber-50/50 p-8 rounded-[2.5rem] border border-amber-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-bl-[4rem] -z-10 opacity-50"></div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></div>
                  Menunggu Validasi 
                  <span className="bg-amber-200 text-amber-800 text-sm px-3 py-1 rounded-full">{pendingTickets.length}</span>
                </h3>
                
                <div className="space-y-2">
                  <ValidationAccordion 
                      title="Grooming" 
                      items={pendingGrooming} 
                      isOpen={expandedValidationSections.Grooming}
                      onToggle={() => toggleValidationSection('Grooming')}
                      icon="✂️"
                  />
                  <ValidationAccordion 
                      title="Klinik" 
                      items={pendingKlinik} 
                      isOpen={expandedValidationSections.Klinik}
                      onToggle={() => toggleValidationSection('Klinik')}
                      icon="🩺"
                  />
                </div>
              </div>
            )}

            {/* Payment Queue (Modified with Accordion & Bulk Actions) */}
            {paymentTickets.length > 0 && (
              <div className="bg-purple-50/50 p-8 rounded-[2.5rem] border border-purple-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-bl-[4rem] -z-10 opacity-50"></div>
                
                <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse"></div>
                    Menunggu Pembayaran
                    <span className="bg-purple-200 text-purple-800 text-sm px-3 py-1 rounded-full">{paymentTickets.length}</span>
                  </h3>
                  
                  <div className="flex gap-2">
                    {selectedPaymentIds.size > 0 && (
                      <button 
                        onClick={() => handleConfirmPayments(Array.from(selectedPaymentIds))}
                        className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
                      >
                        Konfirmasi ({selectedPaymentIds.size})
                      </button>
                    )}
                    <button 
                      onClick={() => handleConfirmPayments(paymentTickets.map(t => t.id))}
                      className="px-4 py-2 bg-white text-purple-600 border border-purple-200 text-sm font-bold rounded-xl hover:bg-purple-50 transition-all"
                    >
                      Konfirmasi Semua
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <PaymentAccordion 
                      title="Grooming" 
                      items={paymentGrooming} 
                      isOpen={expandedSections.Grooming}
                      onToggle={() => toggleSection('Grooming')}
                      icon="✂️"
                      selectedPaymentIds={selectedPaymentIds}
                      onToggleSelect={toggleSelect}
                      onSelectAll={selectAllGroup}
                  />
                  <PaymentAccordion 
                      title="Klinik" 
                      items={paymentKlinik} 
                      isOpen={expandedSections.Klinik}
                      onToggle={() => toggleSection('Klinik')}
                      icon="🩺"
                      selectedPaymentIds={selectedPaymentIds}
                      onToggleSelect={toggleSelect}
                      onSelectAll={selectAllGroup}
                  />
                </div>
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
      )}
    </div>
  );
}
