# Project Context: Pet Shop Management System

## Tech Stack
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **State Management**: Custom Hooks (`useTickets`), Context API (`RoleContext`)
- **Icons**: Standard SVG icons or React Icons
- **Notifications**: `react-hot-toast`

## Data Structure (Ticket Object)
Data tiket diambil menggunakan hook `useTickets()`. Struktur objek tiket adalah sebagai berikut:
```json
{
  "id": "string",
  "nama": "string (Nama Hewan/Pelanggan)",
  "layanan": "Grooming" | "Klinik",
  "status": "WAITING" | "aktif" | "PAYMENT" | "COMPLETED" | "CANCELLED",
  "tanggalRilis": "YYYY-MM-DD",
  "jam": "HH:mm",
  "catatan": "string"
}