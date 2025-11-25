import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc
} from "firebase/firestore";
import { db } from "./firebase";
import { createLog } from "./logService";

const COLLECTION_NAME = "petshop-app/v1/tickets";

export const subscribeToTickets = (callback) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("status", "in", ["PENDING", "WAITING", "COMPLETED", "aktif", "PAYMENT", "CANCELLED"])
  );

  return onSnapshot(q, (snapshot) => {
    const tickets = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    // Sort by release date and time descending
    tickets.sort((a, b) => {
      const timeA = a.jam || '00:00';
      const timeB = b.jam || '00:00';
      const dateA = new Date(`${a.tanggalRilis}T${timeA}`);
      const dateB = new Date(`${b.tanggalRilis}T${timeB}`);
      return dateB - dateA;
    });
    callback(tickets);
  });
};

export const addTicket = async (ticketData, role) => {
  const initialStatus = role === "kiosk" ? "PENDING" : "WAITING";
  const logMsg = role === "kiosk" 
    ? `Tiket dibuat via Kiosk (${ticketData.layanan}). Menunggu validasi.`
    : `Tiket dibuat oleh Admin (${ticketData.layanan}). Langsung antrian.`;

  const newTicket = {
    ...ticketData,
    tanggalSelesai: "",
    status: initialStatus,
    log: [
      {
        timestamp: new Date().toISOString(),
        message: logMsg,
      },
    ],
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), newTicket);
  await createLog(docRef.id, newTicket.nama, newTicket.layanan, logMsg);
  return docRef.id;
};

export const updateTicketStatus = async (id, status, message, ticketData) => {
  const ticketRef = doc(db, COLLECTION_NAME, id);
  
  await updateDoc(ticketRef, {
    status,
    log: [
      ...(ticketData.log || []),
      {
        timestamp: new Date().toISOString(),
        message,
      },
    ],
  });

  await createLog(id, ticketData.nama, ticketData.layanan, message);
};

export const updateTicketDetails = async (id, updates, ticketData) => {
  const ticketRef = doc(db, COLLECTION_NAME, id);
  
  await updateDoc(ticketRef, {
    ...updates,
    log: [
      ...(ticketData.log || []),
      {
        timestamp: new Date().toISOString(),
        message: "Detail tiket diperbarui oleh Admin.",
      },
    ],
  });
};
