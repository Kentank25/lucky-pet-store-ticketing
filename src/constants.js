export const TICKET_STATUS = {
  PENDING: "PENDING",
  WAITING: "WAITING",
  ACTIVE: "aktif",
  PAYMENT: "PAYMENT",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export const SERVICE_TYPE = {
  GROOMING: "Grooming",
  KLINIK: "Klinik",
};

export const WAHA_CONFIG = {
  // Dalam production (Firebase), proxy '/waha' tidak jalan.
  // Kita harus pakai URL lengkap (misal: https://api.ngrok.app)
  API_URL: import.meta.env.VITE_WAHA_API_URL || "/waha",
  SESSION: "default",
  API_KEY: "123",
};
