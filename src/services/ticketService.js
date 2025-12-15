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

  orderBy,
  arrayUnion
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

  const isKiosk = role === "kiosk" || role === "guest";
  
  const newTicket = {
    ...ticketData,
    tanggalSelesai: "",
    status: initialStatus,
    source: isKiosk ? "kiosk" : "admin",
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
  
  // Create the new log entry object
  const newLogEntry = {
    timestamp: new Date().toISOString(),
    message,
  };

  const updates = {
    status,
    // Use arrayUnion to append to the list atomically.
    // This avoids race conditions and overwrite issues.
    log: arrayUnion(newLogEntry),
  };

  if (status === TICKET_STATUS.COMPLETED) {
    updates.tanggalSelesai = new Date().toISOString();
  }

  await updateDoc(ticketRef, updates);

  // We still create the separate system log, but failure here won't rollback the ticket status
  // because they are separate operations.
  // Note: createLog usually doesn't throw, but just consoles error.
  await createLog(id, ticketData?.nama || "Unknown", ticketData?.layanan || "Unknown", message);
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
  
  // Helper to format date as YYYY-MM-DD in LOCAL time
  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Create date object from the input string (which is YYYY-MM-DD)
  // We treat this as a local date by parsing parts
  const [y, m, d] = selectedDateString.split('-').map(Number);
  const selectedDate = new Date(y, m - 1, d); // Local midnight

  let startStr, endStr;
  
  if (filterType === 'day') {
    // For 'day', we want exact match on the stored string
    startStr = selectedDateString;
    // We don't need endStr or range query for exact match
  } else if (filterType === 'week') {
    // Start of week (Monday)
    const day = selectedDate.getDay();
    const diff = selectedDate.getDate() - day + (day === 0 ? -6 : 1); 
    
    const startDate = new Date(selectedDate);
    startDate.setDate(diff); // Set to Monday
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // Set to Sunday

    startStr = formatDateLocal(startDate);
    endStr = formatDateLocal(endDate);
  } else if (filterType === 'month') {
    // Monthly view: 1st to End of Month
    const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    
    startStr = formatDateLocal(startDate);
    endStr = formatDateLocal(endDate);
  } else { // year
    // Annual view: Jan 1 to Dec 31
    const startDate = new Date(selectedDate.getFullYear(), 0, 1);
    const endDate = new Date(selectedDate.getFullYear(), 11, 31);
    
    startStr = formatDateLocal(startDate);
    endStr = formatDateLocal(endDate);
  }
  
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
  return tickets;
};
