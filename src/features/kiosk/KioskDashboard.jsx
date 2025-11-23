import TicketForm from '../../components/tickets/TicketForm';

export default function KioskDashboard() {
  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Selamat Datang</h2>
        <p className="text-gray-600 mt-2">Silakan ambil antrian untuk layanan Grooming atau Klinik.</p>
      </div>
      <TicketForm />
    </div>
  );
}
