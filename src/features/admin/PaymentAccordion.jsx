import TicketSkeleton from "../../components/tickets/TicketSkeleton";
import TicketCard from "../../components/tickets/TicketCard";
import AccordionItem from "../../components/common/AccordionItem";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

export default function PaymentAccordion({
  title,
  items,
  isOpen,
  onToggle,
  icon,
  selectedPaymentIds,
  onToggleSelect,
  onSelectAll,
  loading,
}) {
  const isGrooming = title?.toLowerCase().includes("grooming");
  const serviceVariant = isGrooming ? "grooming" : "klinik";
  const selectedCount = items.filter((t) => selectedPaymentIds.has(t.id)).length;
  const isAllSelected = items.length > 0 && selectedCount === items.length;

  return (
    <AccordionItem
      title={title}
      count={items.length}
      icon={icon}
      isOpen={isOpen}
      onToggle={onToggle}
      colorClass={serviceVariant}
      subtitle={
        selectedCount > 0
          ? `${selectedCount} dari ${items.length} dipilih`
          : "Menunggu konfirmasi pembayaran"
      }
      headerExtras={
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant={serviceVariant} dot>
            {isGrooming ? "Grooming" : "Klinik"}
          </Badge>
          {items.length > 0 && (
            <Button
              variant={isAllSelected ? "primary" : "secondary"}
              size="sm"
              aria-pressed={isAllSelected}
              onClick={() => onSelectAll(items, !isAllSelected)}
              className="tabular-nums"
            >
              {isAllSelected ? "Batal Pilih" : "Pilih Semua"}
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {loading ? (
          <TicketSkeleton />
        ) : items.length === 0 ? (
          <Card
            padding="md"
            className="border-dashed bg-bg-subtle/50 text-center shadow-none"
          >
            <p className="text-sm font-medium text-text-muted">
              Tidak ada pembayaran tertunda.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {items.map((ticket) => {
              const isSelected = selectedPaymentIds.has(ticket.id);
              return (
                <div
                  key={ticket.id}
                  className={`rounded-2xl transition-all ${
                    isSelected
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-bg-surface"
                      : ""
                  }`}
                >
                  <TicketCard
                    ticket={ticket}
                    isSelected={isSelected}
                    onSelect={() => onToggleSelect(ticket.id)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AccordionItem>
  );
}
