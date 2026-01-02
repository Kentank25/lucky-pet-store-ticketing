import { WAHA_CONFIG } from "../constants";
import toast from "react-hot-toast";

/**
 * Formats a phone number to the International format required by WhatsApp (e.g., 628xxx).
 * Assumes Indonesian numbers (starts with 08 -> 628).
 * @param {string} phoneNumber
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  let formatted = phoneNumber.replace(/\D/g, ""); // Remove non-digits

  if (formatted.startsWith("0")) {
    formatted = "62" + formatted.slice(1);
  } else if (formatted.startsWith("8")) {
    formatted = "62" + formatted;
  }

  return formatted;
};

/**
 * Sends a WhatsApp message using the WAHA API.
 * @param {string} phoneNumber - The destination phone number.
 * @param {string} message - The text message to send.
 * @returns {Promise<any>} The API response.
 */
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * Helper to get the API URL (Dynamic from DB or Static from Config)
 */
const getApiUrl = async () => {
  try {
    // 1. Coba ambil dari Firestore dynamic config
    const configRef = doc(db, "config", "waha");
    const configSnap = await getDoc(configRef);

    if (configSnap.exists() && configSnap.data().apiUrl) {
      console.log("Using dynamic WAHA URL:", configSnap.data().apiUrl);
      return configSnap.data().apiUrl;
    }
  } catch (err) {
    console.warn("Failed to fetch dynamic config, using fallback.");
  }

  // 2. Fallback ke yang ada di code/.env
  return WAHA_CONFIG.API_URL;
};

export const sendWhatsAppMessage = async (phoneNumber, message) => {
  try {
    const formattedNumber = formatPhoneNumber(phoneNumber);
    const chatId = `${formattedNumber}@c.us`;

    // Get URL dynamically
    const apiUrl = await getApiUrl();
    console.log(`Sending to: ${apiUrl}`);

    const response = await fetch(`${apiUrl}/api/sendText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": WAHA_CONFIG.API_KEY,
      },
      body: JSON.stringify({
        session: WAHA_CONFIG.SESSION,
        chatId: chatId,
        text: message,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
    throw error;
  }
};
