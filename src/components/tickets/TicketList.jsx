import { useState } from "react";
import { MagnifyingGlassIcon, InboxIcon } from "@heroicons/react/24/outline";
import { SERVICE_TYPE } from "../../constants";
import TicketCard from "./TicketCard";
import TicketSkeleton from "./TicketSkeleton";
import EmptyState from "../ui/EmptyState";

export default function TicketList({
  tickets = [],
  onEdit,
  filterStatus,
  filterService,
  cardClassName,
  gridClassName = "",
  loading = false,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState("ALL");

  if (loading) {
    return (
      <div className={`grid grid-cols-1 items-start gap-3 sm:gap-4 ${gridClassName}`}>
        {[1, 2, 3].map((item) => (
          <TicketSkeleton key={item} />
        ))}
      </div>
    );
  }

  let filteredTickets = tickets;

  if (filterStatus) {
    filteredTickets = filteredTickets.filter((t) =>
      filterStatus.includes(t.status)
    );
  }

  const activeServiceFilter =
    filterService || (selectedService !== "ALL" ? selectedService : null);

  if (activeServiceFilter) {
    filteredTickets = filteredTickets.filter(
      (t) => t.layanan === activeServiceFilter
    );
  }

  const query = searchQuery.trim().toLowerCase();
  if (query) {
    filteredTickets = filteredTickets.filter(
      (t) =>
        (t.nama || "").toLowerCase().includes(query) ||
        (t.telepon || "").toLowerCase().includes(query) ||
        (t.queueNumber || "").toLowerCase().includes(query)
    );
  }

  return (
    <div className="space-y-4">
      {tickets.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <MagnifyingGlassIcon
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, telepon, atau no. antrian..."
              aria-label="Cari tiket"
              className="input-minimal min-h-10 w-full py-2 pl-10 pr-3 text-sm"
            />
          </div>

          {!filterService && (
            <div
              className="flex flex-wrap items-center gap-1.5"
              role="group"
              aria-label="Filter layanan"
            >
              {[
                { key: "ALL", label: "Semua" },
                { key: SERVICE_TYPE.GROOMING, label: "Grooming" },
                { key: SERVICE_TYPE.KLINIK, label: "Klinik" },
              ].map((option) => {
                const isActive = selectedService === option.key;
                const activeStyle =
                  option.key === SERVICE_TYPE.GROOMING
                    ? "border-grooming bg-grooming-soft text-grooming"
                    : option.key === SERVICE_TYPE.KLINIK
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-primary bg-primary-soft text-primary";

                return (
                  <button
                    key={option.key}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setSelectedService(option.key)}
                    className={`min-h-10 cursor-pointer rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                      isActive
                        ? activeStyle
                        : "border-border-subtle bg-bg-surface text-text-secondary hover:border-border-main hover:bg-bg-subtle"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {filteredTickets.length === 0 ? (
        <EmptyState
          icon={InboxIcon}
          title="Tidak ada tiket yang sesuai"
          description={
            query || activeServiceFilter
              ? "Coba ubah kata kunci pencarian atau filter layanan."
              : "Belum ada tiket pada daftar ini."
          }
        />
      ) : (
        <div
          className={`grid grid-cols-1 items-start gap-3 sm:gap-4 ${gridClassName}`}
        >
          {filteredTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onEdit={onEdit}
              className={cardClassName}
            />
          ))}
        </div>
      )}
    </div>
  );
}
