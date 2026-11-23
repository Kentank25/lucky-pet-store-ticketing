# Project Context: Pet Shop Management System

## Tech Stack
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **State Management**: Custom Hooks (`useTickets`), Context API (`AuthContext`)
- **Icons**: Standard SVG icons or React Icons
- **Notifications**: `react-hot-toast`

## Data Structure (Ticket Object)
Data tiket diambil menggunakan hook `useTickets()`. Struktur objek tiket adalah sebagai berikut:
```json
{
  "id": "string",
  "nama": "string (Nama Hewan/Pelanggan)",
  "layanan": "Grooming" | "Klinik",
  "status": "PENDING" | "WAITING" | "aktif" | "PAYMENT" | "COMPLETED" | "CANCELLED",
  "tanggalRilis": "YYYY-MM-DD",
  "jam": "HH:mm",
  "catatan": "string",`r`n  "roomId": "grooming-1" | "grooming-2" | "dokter-1" | "dokter-2",`r`n  "queueSequence": 1,`r`n  "queueNumber": "G-001" | "K-001",`r`n  "doctorId": "doctor-1" | "doctor-2" (opsional, Klinik),`r`n  "doctorName": "string (opsional)",`r`n  "groomerId": "groomer-1" | "groomer-2" (opsional, Grooming),`r`n  "groomerName": "string (opsional)",`r`n  "source": "kiosk" | "admin"
}

Catatan: `PENDING` = menunggu validasi admin sebelum menjadi `WAITING`. `roomId`, `queueSequence`, `queueNumber` dan field petugas opsional pada data lama.
