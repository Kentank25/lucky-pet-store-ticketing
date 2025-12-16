import AccordionItem from "../../components/common/AccordionItem";
import TicketList from "../../components/tickets/TicketList";

export default function ValidationAccordion({
  title,
  items,
  isOpen,
  onToggle,
  icon,
  loading,
}) {
  if (items.length === 0) return null;

  return (
    <AccordionItem
      title={title}
      count={items.length}
      icon={icon}
      isOpen={isOpen}
      onToggle={onToggle}
      colorClass="amber"
    >
      <TicketList tickets={items} loading={loading} />
    </AccordionItem>
  );
}
