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

const COLLECTION_NAME = "petshop-app/v1/tickets";

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

export const addTicket = async (ticketData, role) => {
  const initialStatus = TICKET_STATUS.PENDING;
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

export const getChartData = async (filterType) => {
  const coll = collection(db, COLLECTION_NAME);
  let startDate = new Date();
  
  if (filterType === 'day') {
    startDate.setDate(startDate.getDate() - 30); // Last 30 days for daily view
  } else if (filterType === 'week') {
    startDate.setMonth(startDate.getMonth() - 3); // Last 3 months
  } else {
    startDate.setFullYear(startDate.getFullYear() - 1); // Last 1 year
  }
  
  const dateString = startDate.toISOString().split('T')[0];
  
  const q = query(
    coll, 
    where("tanggalRilis", ">=", dateString)
  );

  const snapshot = await getDocs(q);
  const tickets = snapshot.docs.map(doc => doc.data());
  
  // Filter for COMPLETED/CANCELLED in memory
  return tickets.filter(t => t.status === TICKET_STATUS.COMPLETED || t.status === TICKET_STATUS.CANCELLED);
};
