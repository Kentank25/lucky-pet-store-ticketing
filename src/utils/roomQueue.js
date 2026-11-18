import { SERVICE_TYPE, TICKET_STATUS } from "../constants.js";

export const SERVICE_ROOMS = [
  { id: "grooming-1", name: "Grooming 1", service: SERVICE_TYPE.GROOMING },
  { id: "grooming-2", name: "Grooming 2", service: SERVICE_TYPE.GROOMING },
  { id: "dokter-1", name: "Dokter 1", service: SERVICE_TYPE.KLINIK },
  { id: "dokter-2", name: "Dokter 2", service: SERVICE_TYPE.KLINIK },
];

export const getQueueDate = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

export const getRoom = (id, service) => SERVICE_ROOMS.find((room) => room.id === id && room.service === service);
export const formatQueueNumber = (service, sequence) => `${service === SERVICE_TYPE.GROOMING ? "G" : "K"}-${String(sequence).padStart(3, "0")}`;
export const compareQueueTickets = (a, b) => (a.jam || "").localeCompare(b.jam || "") ||
  (a.queueSequence ?? Number.MAX_SAFE_INTEGER) - (b.queueSequence ?? Number.MAX_SAFE_INTEGER) || a.id.localeCompare(b.id);
export const hasQueueIdentity = (ticket) => !!getRoom(ticket.roomId, ticket.layanan) && Number.isInteger(ticket.queueSequence) && ticket.queueSequence > 0 && ticket.queueNumber === formatQueueNumber(ticket.layanan, ticket.queueSequence);

export function summarizeRoomQueue(tickets, today = getQueueDate()) {
  const rooms = SERVICE_ROOMS.map((room) => ({ ...room, waiting: 0, active: 0, current: [], next: null }));
  const unassigned = { [SERVICE_TYPE.GROOMING]: 0, [SERVICE_TYPE.KLINIK]: 0 };

  for (const ticket of tickets) {
    if (![TICKET_STATUS.WAITING, TICKET_STATUS.ACTIVE].includes(ticket.status)) continue;
    if (ticket.tanggalRilis !== today) continue;
    if (!Object.hasOwn(unassigned, ticket.layanan)) continue;

    const room = rooms.find((item) => item.id === ticket.roomId && item.service === ticket.layanan);
    if (!room || !hasQueueIdentity(ticket)) {
      unassigned[ticket.layanan]++;
      continue;
    }
    if (ticket.status === TICKET_STATUS.ACTIVE) { room.active++; room.current.push(ticket.queueNumber); }
    else { room.waiting++; if (!room.next || compareQueueTickets(ticket, room.next) < 0) room.next = ticket; }
  }

  return { rooms, unassigned };
}
