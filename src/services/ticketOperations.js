import { collection, doc, runTransaction, getDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { formatQueueNumber, getRoom, hasQueueIdentity } from "../utils/roomQueue.js";
import { TICKET_STATUS } from "../constants.js";

export const TICKETS = "petshop-app/v1/tickets";
export const COUNTERS = "petshop-app/v1/queue-counters";
export const ROOMS = "petshop-app/v1/room-states";
export const counterId = (ticket) => `${ticket.layanan === "Grooming" ? "G" : "K"}-${ticket.tanggalRilis}`;

// Use the provided database and resolve the current actor for audit events.
export function createTicketOperations(db, getActor = () => null) {
  const event = (transaction, ticket, message, fromStatus = null) => {
    transaction.set(doc(collection(db, "petshop-app/v1/system-logs")), {
      ticketId: ticket.id, nama: ticket.nama, layanan: ticket.layanan,
      message, actorId: getActor(), fromStatus, toStatus: ticket.status,
      timestamp: serverTimestamp(),
    });
  };
  const roomRef = (ticket) => doc(db, ROOMS, ticket.roomId);
  const assertRoom = (ticket) => {
    if (!getRoom(ticket.roomId, ticket.layanan)) throw new Error("Pilih ruang yang sesuai layanan.");
  };
  const logEntry = (message) => ({ timestamp: new Date().toISOString(), message });

  return {
    newId: () => doc(collection(db, TICKETS)).id,
    async create(input, { id, express = false, source = "kiosk" } = {}) {
      assertRoom(input);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(input.tanggalRilis)) throw new Error("Tanggal tidak valid.");
      const ref = id ? doc(db, TICKETS, id) : doc(collection(db, TICKETS));
      let attemptedSequence;
      const commit = () => runTransaction(db, async (transaction) => {
        const existing = await transaction.get(ref);
        if (existing.exists()) return { id: ref.id, ...existing.data() };
        const countRef = doc(db, COUNTERS, counterId(input));
        const counter = await transaction.get(countRef);
        const occupancy = express ? await transaction.get(roomRef(input)) : null;
        if (occupancy?.exists() && occupancy.data().ticketId) throw new Error("Ruang masih melayani tiket lain.");
        const sequence = (counter.exists() ? counter.data().sequence : 0) + 1;
        attemptedSequence = sequence;
        const message = express ? "Tiket darurat dibuat langsung aktif." : "Tiket dibuat. Menunggu validasi admin.";
        const ticket = {
          nama: input.nama, telepon: input.telepon, kontak: input.telepon,
          layanan: input.layanan, tanggalRilis: input.tanggalRilis, jam: input.jam,
          catatan: input.catatan || "", roomId: input.roomId,
          ...(input.doctorId ? { doctorId: input.doctorId, doctorName: input.doctorName } : {}),
          ...(input.groomerId ? { groomerId: input.groomerId, groomerName: input.groomerName } : {}),
          queueSequence: sequence, queueNumber: formatQueueNumber(input.layanan, sequence),
          status: express ? TICKET_STATUS.ACTIVE : TICKET_STATUS.PENDING,
          source, tanggalSelesai: "", createdAt: serverTimestamp(),
          ...(express ? { startedAt: serverTimestamp() } : {}),
          log: [logEntry(message)],
        };
        transaction.set(countRef, { sequence, lastTicketId: ref.id, layanan: input.layanan, tanggalRilis: input.tanggalRilis });
        transaction.set(ref, ticket);
        if (express) transaction.set(roomRef(input), { ticketId: ref.id });
        event(transaction, { ...ticket, id: ref.id }, message);
        return { ...ticket, id: ref.id };
      });
      // Rules can observe a competing counter commit before the SDK reports a conflict.
      // Retry only a verified counter race, keeping the same ticket ID.
      for (let attempt = 0; ; attempt++) {
        try { return await commit(); }
        catch (error) {
          if (error.code !== "permission-denied" || attempt >= 4 || !attemptedSequence) throw error;
          const latest = await getDoc(doc(db, COUNTERS, counterId(input)));
          if (!latest.exists() || latest.data().sequence < attemptedSequence) throw error;
        }
      }
    },
    async transition(id, status, message) {
      const ref = doc(db, TICKETS, id);
      return runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(ref);
        if (!snapshot.exists()) throw new Error("Tiket tidak ditemukan.");
        const ticket = { id, ...snapshot.data() };
        const allowed = {
          PENDING: ["WAITING", "CANCELLED"], WAITING: ["aktif", "CANCELLED"],
          aktif: ["PAYMENT", "CANCELLED"], PAYMENT: ["COMPLETED"],
        };
        if (!allowed[ticket.status]?.includes(status)) throw new Error("Status tiket sudah berubah atau aksi tidak diizinkan.");
        if (["WAITING", "aktif"].includes(status) && !hasQueueIdentity(ticket)) throw new Error("Admin perlu menetapkan ruang dan nomor terlebih dahulu.");
        const managedRoom = getRoom(ticket.roomId, ticket.layanan);
        const occupancy = managedRoom && (status === "aktif" || ticket.status === "aktif")
          ? await transaction.get(roomRef(ticket)) : null;
        if (status === "aktif" && occupancy?.exists() && occupancy.data().ticketId) throw new Error("Ruang sudah melayani tiket lain. Muat ulang antrean.");
        const updates = { status, log: arrayUnion(logEntry(message)) };
        if (status === "aktif") {
          updates.startedAt = serverTimestamp();
          transaction.set(roomRef(ticket), { ticketId: id });
        }
        if (ticket.status === "aktif" && occupancy?.data()?.ticketId === id) transaction.set(roomRef(ticket), { ticketId: null });
        if (status === "COMPLETED") updates.tanggalSelesai = new Date().toISOString();
        transaction.update(ref, updates);
        event(transaction, { ...ticket, status }, message, ticket.status);
      });
    },
    async edit(id, input) {
      const ref = doc(db, TICKETS, id);
      return runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(ref);
        if (!snapshot.exists()) throw new Error("Tiket tidak ditemukan.");
        const ticket = { id, ...snapshot.data() };
        if (!["PENDING", "WAITING"].includes(ticket.status)) throw new Error("Tiket hanya bisa diedit sebelum layanan dimulai.");
        if (input.layanan !== ticket.layanan || input.tanggalRilis !== ticket.tanggalRilis) throw new Error("Layanan dan tanggal tidak dapat diubah. Batalkan lalu buat tiket baru.");
        assertRoom(input);
        const needsNumber = !Number.isInteger(ticket.queueSequence);
        const countRef = doc(db, COUNTERS, counterId(ticket));
        const counter = needsNumber ? await transaction.get(countRef) : null;
        const message = ticket.roomId !== input.roomId ? "Ruang layanan diubah oleh admin." : "Detail tiket diperbarui oleh admin.";
        const updates = {
          nama: input.nama, telepon: input.telepon, kontak: input.telepon,
          jam: input.jam, catatan: input.catatan || "", roomId: input.roomId,
          ...(ticket.doctorId && input.doctorId ? { doctorId: input.doctorId, doctorName: input.doctorName } : {}),
          ...(ticket.groomerId && input.groomerId ? { groomerId: input.groomerId, groomerName: input.groomerName } : {}),
          log: arrayUnion(logEntry(message)),
        };
        if (needsNumber) {
          updates.queueSequence = (counter?.exists() ? counter.data().sequence : 0) + 1;
          updates.queueNumber = formatQueueNumber(ticket.layanan, updates.queueSequence);
          transaction.set(countRef, { sequence: updates.queueSequence, lastTicketId: id, layanan: ticket.layanan, tanggalRilis: ticket.tanggalRilis });
        }
        transaction.update(ref, updates);
        event(transaction, { ...ticket, ...updates }, message, ticket.status);
      });
    },
  };
}
