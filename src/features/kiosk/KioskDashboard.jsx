import TicketForm from "../../components/tickets/TicketForm";

export default function KioskDashboard() {
  return (
    <main className="h-dvh w-full overflow-y-auto bg-slate-50 px-4 py-4 text-slate-900 sm:px-6 sm:py-6">
      <div className="mx-auto flex min-h-full w-full max-w-xl flex-col justify-center gap-4 sm:gap-6">
        <header className="flex items-center gap-3 px-1">
          <img src="/Lucky Pet Store Logo (Black).png" alt="" className="h-11 w-11 shrink-0 rounded-xl object-contain sm:h-12 sm:w-12" />
          <div>
            <p className="text-sm font-semibold text-slate-500">Lucky Pet Store</p>
            <h1 className="text-xl font-black text-slate-900 sm:text-2xl">Ambil Antrian Baru</h1>
          </div>
        </header>
        <section className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-xl shadow-indigo-100/50 sm:p-8">
          <TicketForm isPublicKiosk />
        </section>
      </div>
    </main>
  );
}
