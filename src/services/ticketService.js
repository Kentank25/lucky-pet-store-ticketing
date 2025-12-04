import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc,
  getCountFromServer,
  getDocs
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
  const initialStatus = "PENDING";
  const logMsg = role === "kiosk" 
    ? `Tiket dibuat via Kiosk (${ticketData.layanan}). Menunggu validasi.`
    : `Tiket dibuat oleh Admin (${ticketData.layanan}). Menunggu validasi.`;

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

export const getAnalyticsStats = async () => {
  const coll = collection(db, COLLECTION_NAME);
  
  const completedQuery = query(coll, where("status", "==", "COMPLETED"));
  const cancelledQuery = query(coll, where("status", "==", "CANCELLED"));
  const groomingQuery = query(coll, where("layanan", "==", "Grooming"));
  const klinikQuery = query(coll, where("layanan", "==", "Klinik"));

  const [completedSnap, cancelledSnap, groomingSnap, klinikSnap] = await Promise.all([
    getCountFromServer(completedQuery),
    getCountFromServer(cancelledQuery),
    getCountFromServer(groomingQuery),
    getCountFromServer(klinikQuery)
  ]);

  return {
    completed: completedSnap.data().count,
    cancelled: cancelledSnap.data().count,
    grooming: groomingSnap.data().count,
    klinik: klinikSnap.data().count
  };
};

export const getChartData = async (filterType) => {
  const coll = collection(db, COLLECTION_NAME);
  let startDate = new Date();
  
  if (filterType === 'day') {
    startDate.setDate(startDate.getDate() - 1); // Last 24h or just today? Usually means "Today" or "Recent days". Let's grab last 7 days for daily view?
    // The UI has "Harian", "Mingguan", "Bulanan".
    // Usually "Harian" means show data per day (e.g. for the last 7 days).
    // "Mingguan" means show data per week (e.g. last 4 weeks).
    // "Bulanan" means show data per month (e.g. last 12 months).
    startDate.setDate(startDate.getDate() - 30); // Let's fetch last 30 days for daily view
  } else if (filterType === 'week') {
    startDate.setMonth(startDate.getMonth() - 3); // Last 3 months
  } else {
    startDate.setFullYear(startDate.getFullYear() - 1); // Last 1 year
  }
  
  const dateString = startDate.toISOString().split('T')[0];

  // We need an index for this composite query: status IN [...] AND tanggalRilis >= date
  // If index is missing, this will fail.
  // Safer approach without guaranteed index: Query by status only (if dataset small) or Query by date only.
  // Given "Pet Shop", date query is probably safer to limit data size.
  
  const q = query(
    coll, 
    where("tanggalRilis", ">=", dateString)
  );

  const snapshot = await getDocs(q);
  const tickets = snapshot.docs.map(doc => doc.data());
  
  // Filter for COMPLETED/CANCELLED in memory
  return tickets.filter(t => t.status === 'COMPLETED' || t.status === 'CANCELLED');
};
