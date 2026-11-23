import TicketSkeleton from "../../components/tickets/TicketSkeleton";
import TicketCard from "../../components/tickets/TicketCard";
import AccordionItem from "../../components/common/AccordionItem";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";

export default function ValidationAccordion({
  title,
  items,
  isOpen,
  onToggle,
  icon,
  loading,
}) {
  const isGrooming = title?.toLowerCase().includes("grooming");
  const serviceVariant = isGrooming ? "grooming" : "klinik";

  return (
    <AccordionItem
      title={title}
      count={items.length}
      icon={icon}
      isOpen={isOpen}
      onToggle={onToggle}
      subtitle="Menunggu konfirmasi kedatangan"
      colorClass={serviceVariant}
      headerExtras={
        <Badge variant={serviceVariant} dot className="shrink-0">
          {isGrooming ? "Grooming" : "Klinik"}
        </Badge>
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
              Tidak ada antrian validasi.
            </p>
          </Card>
        ) : (
          items.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
        )}
      </div>
    </AccordionItem>
  );
}
