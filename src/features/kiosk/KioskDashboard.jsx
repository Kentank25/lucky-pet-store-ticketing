import Card from "../../components/ui/Card";
import TicketForm from "../../components/tickets/TicketForm";

export default function KioskDashboard() {
  return (
    <main className="min-h-dvh w-full overflow-y-auto bg-bg-canvas px-4 py-6 text-text-main sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-full w-full max-w-xl flex-col justify-center gap-5 sm:gap-6">
        <header className="flex items-center gap-3.5 px-1">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border-subtle bg-bg-surface p-1.5 shadow-xs sm:h-14 sm:w-14">
            <img
              src="/Lucky Pet Store Logo (Black).png"
              alt="Logo Lucky Pet Store"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary">
              Lucky Pet Store
            </p>
            <h1 className="font-heading text-xl font-bold tracking-tight text-text-main sm:text-2xl">
              Ambil Antrian Baru
            </h1>
          </div>
        </header>

        <Card padding="lg" elevated className="rounded-3xl">
          <TicketForm isPublicKiosk />
        </Card>
      </div>
    </main>
  );
}
