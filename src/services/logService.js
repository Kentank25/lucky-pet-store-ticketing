import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

const COLLECTION_NAME = "petshop-app/v1/system-logs";

export const subscribeToLogs = (callback) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy("timestamp", "desc"));
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(logs);
  });
};

export const createLog = async (ticketId, nama, layanan, message) => {
  try {
    await addDoc(collection(db, COLLECTION_NAME), {
      timestamp: serverTimestamp(),
      ticketId: ticketId || "N/A",
      nama: nama || "N/A",
      layanan: layanan || "N/A",
      message,
    });
  } catch (error) {
    console.error("Error creating log:", error);
  }
};
