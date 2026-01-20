# Lucky Pet Shop - Smart Ticketing System 🐾

Sistem manajemen antrian dan ticketing modern untuk Lucky Pet Shop, dibangun untuk tugas akhir mata kuliah Web Programming.

## Fitur Utama

### 1. **Multi-Role Dashboard**

- **Admin**: Kontrol penuh (Validasi Tiket, Monitor Antrian, User Management, Analytics).
- **PIC (Grooming & Klinik)**: Dashboard khusus untuk memproses layanan yang sedang berjalan.
- **Kiosk (Self-Service)**: Mode layar sentuh untuk pelanggan mengambil nomor antrian sendiri.
- **Queue Monitor**: Halaman publik untuk memantau status antrian secara real-time.

### 2. **Real-Time Updates** (Firebase)

- Status tiket berubah langsung di semua layar tanpa refresh browser.
- Sinkronisasi instan antara Kiosk, Admin, dan Layar Monitor.

### 3. **Smart Features**

- **QR Code Tracking**: Pelanggan bisa scan QR di struk untuk memantau antrian dari HP masing-masing.
- **WhatsApp Integration**: Admin bisa chat pelanggan langsung (Direct Link) dari dashboard.
- **Skeleton Loading**: UX modern saat memuat data.

### 4. **Modern UI/UX**

- **Glassmorphism Design**: Tampilan 'frosted glass' yang estetik dan premium.
- **Mobile Responsive**: Dashboard bisa diakses dari Tablet/HP dengan layout yang menyesuaikan.
- **Micro-Interactions**: Animasi halus pada hover, klik, dan transisi halaman.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore (Real-Time)
- **Auth**: Firebase Authentication
- **Icons**: Heroicons
- **Validation**: Zod & React Hook Form Logic

---

## Cara Install & Jalankan

1. **Clone Repository**

   ```bash
   git clone <repository-url>
   cd project-pet-shop
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Jalankan Project**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:5173` di browser.

---

## 🔐 Akun Demo

Gunakan akun berikut untuk mencoba fitur dashboard:

| Role             | Email                       | Password         |
| ---------------- | --------------------------- | ---------------- |
| **Admin**        | `admin@example.com`         | `adminPass123`   |
| **PIC Grooming** | `pic_grooming1@example.com` | `picGrooming123` |
| **PIC Klinik**   | `pic_klinik1@example.com`   | `picKlinik123`   |

---

> **Catatan**:
>
> - Halaman Kiosk Publik tersedia di `/kiosk` (tanpa login).
> - Halaman Monitor Antrian tersedia via Scan QR atau link `/monitor/:id`.
