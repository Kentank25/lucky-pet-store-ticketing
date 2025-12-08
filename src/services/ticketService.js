import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc,
  getCountFromServer,
  getDocs,
  orderBy
} from "firebase/firestore";
import { db } from "./firebase";
import { createLog } from "./logService";
import { TICKET_STATUS, SERVICE_TYPE } from "../constants";

export const COLLECTION_NAME = "petshop-app/v1/tickets";

export const subscribeToTickets = (callback) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("status", "in", Object.values(TICKET_STATUS)),
    orderBy("tanggalRilis", "desc"),
    orderBy("jam", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const tickets = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    // Client-side sorting removed as we now use Firestore orderBy
    callback(tickets);
  });
};

export const addTicket = async (ticketData, role, customStatus = null) => {
  const initialStatus = customStatus || TICKET_STATUS.PENDING;
  const logMsg = customStatus 
    ? `Tiket dibuat via Emergency (Admin). Status langsung: ${customStatus}.`
    : role === "kiosk" 
    ? `Tiket dibuat via Kiosk (${ticketData.layanan}). Menunggu validasi.`
    : role === "guest"
    ? `Tiket dibuat oleh Tamu/Public (${ticketData.layanan}). Menunggu validasi Admin.`
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
  
  const updates = {
    status,
    log: [
      ...(ticketData.log || []),
      {
        timestamp: new Date().toISOString(),
        message,
      },
    ],
  };

  if (status === TICKET_STATUS.COMPLETED) {
    updates.tanggalSelesai = new Date().toISOString();
  }

  await updateDoc(ticketRef, updates);

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
  
  const completedQuery = query(coll, where("status", "==", TICKET_STATUS.COMPLETED));
  const cancelledQuery = query(coll, where("status", "==", TICKET_STATUS.CANCELLED));
  const groomingQuery = query(coll, where("layanan", "==", SERVICE_TYPE.GROOMING));
  const klinikQuery = query(coll, where("layanan", "==", SERVICE_TYPE.KLINIK));

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

export const getChartData = async (filterType, selectedDateString) => {
  const coll = collection(db, COLLECTION_NAME);
  
  // Calculate date range based on filterType and selectedDateString
  const selectedDate = new Date(selectedDateString);
  let startDate = new Date(selectedDate);
  let endDate = new Date(selectedDate);
  
  if (filterType === 'day') {
    // Exact day match: 00:00 to 23:59
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
  } else if (filterType === 'week') {
    // Week surrounding the date (Mon-Sun or Sun-Sat depending on locale? Let's do Monday start)
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startDate.setDate(diff);
    startDate.setHours(0,0,0,0);

    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  } else { // month
    // Entire month
    startDate.setDate(1);
    startDate.setHours(0,0,0,0);
    
    endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + 1);
    endDate.setDate(0); // Last day of previous month (which is the month we want)
    endDate.setHours(23, 59, 59, 999);
  }
  
  // Convert to string for comparison if storing as YYYY-MM-DD
  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];
  
  // Note: Since 'tanggalRilis' is YYYY-MM-DD string, we can compare strings directly for range.
  // EXCEPT for 'day' filter where we want exact match. 
  // But wait, the previous code filtered by `ticket.status`.
  // Also existing data `tanggalRilis` is likely just "YYYY-MM-DD".
  
  let q;
  if (filterType === 'day') {
      q = query(
        coll, 
        where("tanggalRilis", "==", startStr)
      );
  } else {
      q = query(
        coll, 
        where("tanggalRilis", ">=", startStr),
        where("tanggalRilis", "<=", endStr)
      );
  }

  const snapshot = await getDocs(q);
  const tickets = snapshot.docs.map(doc => doc.data());
  
  // Filter for COMPLETED/CANCELLED in memory as before
  return tickets.filter(t => t.status === TICKET_STATUS.COMPLETED || t.status === TICKET_STATUS.CANCELLED);
};
