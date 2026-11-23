import { useLogs } from "../../hooks/useLogs";
import {
  PlusCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayCircleIcon,
  FlagIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import EmptyState from "../ui/EmptyState";

const getLogMeta = (msg = "") => {
  if (msg.includes("dibuat")) {
    return {
      icon: PlusCircleIcon,
      dotClass: "bg-sky-600 text-white",
      badgeVariant: "waiting",
      badgeLabel: "Tiket Dibuat",
    };
  }
  if (msg.includes("Diterima")) {
    return {
      icon: CheckCircleIcon,
      dotClass: "bg-emerald-600 text-white",
      badgeVariant: "completed",
      badgeLabel: "Diterima",
    };
  }
  if (
    msg.includes("Ditolak") ||
    msg.includes("dibatalkan") ||
    msg.includes("Batal")
  ) {
    return {
      icon: XCircleIcon,
      dotClass: "bg-rose-600 text-white",
      badgeVariant: "cancelled",
      badgeLabel: "Dibatalkan",
    };
  }
  if (msg.includes("diambil")) {
    return {
      icon: PlayCircleIcon,
      dotClass: "bg-[#0D9488] text-white",
      badgeVariant: "active",
      badgeLabel: "Diproses",
    };
  }
  if (msg.includes("Layanan selesai")) {
    return {
      icon: FlagIcon,
      dotClass: "bg-purple-600 text-white",
      badgeVariant: "payment",
      badgeLabel: "Siap Bayar",
    };
  }
  if (msg.includes("Pembayaran")) {
    return {
      icon: CurrencyDollarIcon,
      dotClass: "bg-emerald-600 text-white",
      badgeVariant: "completed",
      badgeLabel: "Lunas",
    };
  }

  return {
    icon: DocumentTextIcon,
    dotClass: "bg-slate-600 text-white",
    badgeVariant: "neutral",
    badgeLabel: "Aktivitas",
  };
};

export default function LogList() {
  const { logs, loading } = useLogs();

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border-subtle border-t-primary" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <EmptyState
        icon={DocumentTextIcon}
        title="Belum ada riwayat"
        description="Aktivitas tiket dan perubahan status akan muncul di sini."
      />
    );
  }

  return (
    <div className="relative pl-3">
      {/* Timeline Line */}
      <div
        aria-hidden="true"
        className="absolute bottom-2 left-3 top-2 w-0.5 bg-border-subtle"
      />

      <div className="space-y-4">
        {logs.map((log) => {
          const meta = getLogMeta(log.message);
          const IconComponent = meta.icon;
          const isGrooming = log.layanan === "Grooming";

          return (
            <div key={log.id} className="group relative pl-8">
              {/* Timeline Dot with Icon */}
              <div
                aria-hidden="true"
                className={`absolute -left-1 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-bg-surface shadow-xs ${meta.dotClass}`}
              >
                <IconComponent className="h-4 w-4" />
              </div>

              <Card padding="sm" className="transition-shadow hover:shadow-md">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <p className="text-sm font-medium leading-snug text-text-main">
                    {log.message}
                  </p>
                  <span className="shrink-0 rounded-lg border border-border-subtle bg-bg-subtle px-2 py-1 text-[11px] font-bold tabular-nums text-text-secondary">
                    {log.timestamp?.toDate
                      ? log.timestamp.toDate().toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Baru saja"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={meta.badgeVariant} dot>
                    {meta.badgeLabel}
                  </Badge>
                  {log.layanan && (
                    <Badge variant={isGrooming ? "grooming" : "klinik"}>
                      {log.layanan}
                    </Badge>
                  )}
                  {log.nama && (
                    <span className="text-xs font-semibold text-text-secondary">
                      • {log.nama}
                    </span>
                  )}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
