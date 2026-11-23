# Handoff Backend Laravel — Lucky Pet Store

Tanggal pemeriksaan: 3 November 2026. Referensi commit: `6054131`.

> **Pembaruan implementasi per 18 November 2026:** pelanggan Klinik memilih dokter berdasarkan jadwal mingguan mock atau "Dokter mana saja". Pelanggan Grooming memilih groomer mock atau "Groomer mana saja". Pilihan jam mengikuti tanggal dan jadwal petugas yang dipilih; pilihan "mana saja" menampilkan gabungan jam tersedia. Perubahan petugas atau tanggal mengosongkan jam yang sudah tidak valid. Setiap petugas mempunyai ruang tetap. Penempatan otomatis membandingkan jumlah tiket `PENDING`, `WAITING`, dan `aktif` pada tanggal layanan, lalu memakai ID ruang untuk memecahkan seri. Tiket baru menyimpan `roomId` dan identitas dokter atau groomer; data lama mungkin belum memilikinya. Nomor G/K dialokasikan per layanan dan tanggal dalam transaksi. Admin dapat mengganti petugas sebelum layanan dimulai. Monitor pelanggan menghitung posisi per ruang dan tanggal tiket. Firestore rules lokal memeriksa pasangan petugas dan ruang, tetapi jadwal mock masih divalidasi di frontend. Bagian audit di bawah menjelaskan baseline sebelum fitur antrean ruang dan petugas.

## 1. Tujuan dan batas dokumen

Dokumen ini menjelaskan aplikasi existing agar developer backend dapat membangun penggantinya menggunakan PHP Laravel dan mengintegrasikannya dengan frontend React yang ada.

**Existing** berarti terkonfirmasi dari source repository, bukan hasil pengujian aplikasi berjalan. **Usulan** berarti rancangan backend baru yang belum diimplementasikan atau disepakati. **Perlu keputusan** berarti aturan bisnis belum cukup jelas dari kode.

Audit tidak mengakses data Firebase, menguji akun demo, atau memverifikasi konfigurasi cloud yang deployed. Repository belum memiliki backend Laravel. Dokumen ini tidak menetapkan versi PHP/Laravel, database, maupun package autentikasi; tentukan saat setup backend sesuai environment deployment.

## 2. Ringkasan aplikasi existing

Lucky Pet Store mengelola antrean dua layanan: `Grooming` dan `Klinik`. Pelanggan membuat tiket melalui kiosk publik, admin memvalidasi tiket, PIC menangani layanan, dan admin mengonfirmasi pembayaran. Pelanggan dapat membuka tautan/QR untuk melihat progres.

| Area | Kondisi existing |
| --- | --- |
| Frontend | React 19, Vite 7, JavaScript/JSX, React Router 7 |
| UI | Tailwind CSS 4, Heroicons, react-hot-toast |
| Validasi | Zod 4 di browser |
| Data | Firebase Firestore, akses langsung dari browser |
| Login | Firebase Authentication, email/password |
| Role | Dibaca dari dokumen Firestore `users/{uid}` |
| Pembaruan langsung | Firestore `onSnapshot` |
| Grafik | Chart.js melalui react-chartjs-2 |
| QR | react-qr-code, mengandung URL monitor |
| Hosting | Konfigurasi Firebase Hosting untuk output `dist` |

Tidak ditemukan pengelolaan stok, produk, rekam medis hewan, tarif layanan, payment gateway, saldo, atau laporan pendapatan dalam modul yang diperiksa. Kata “pembayaran” saat ini berarti konfirmasi status oleh admin, bukan transaksi finansial terintegrasi. WhatsApp hanya membuka tautan `wa.me`; tidak ada pengiriman pesan otomatis melalui backend.

## 3. Arsitektur dan titik integrasi

```text
Browser / React
  main.jsx → AuthProvider + ThemeProvider + BrowserRouter
  App.jsx → dashboard dan halaman publik
  Komponen → hooks/services → Firebase Auth / Firestore
```

Frontend sekarang belum menggunakan REST API. Penggantian backend membutuhkan perubahan service, hooks, autentikasi, dan mekanisme pembaruan data; membuat API saja belum cukup.

| File/modul | Tanggung jawab existing | Dampak saat integrasi Laravel |
| --- | --- | --- |
| `src/main.jsx`, `src/App.jsx` | Bootstrap, routing, pemilihan dashboard berdasarkan role | Pertahankan halaman; sesuaikan pemuatan sesi |
| `src/context/AuthContext.jsx` | Login, logout, ambil profil/role | Ganti dengan sesi/API backend |
| `src/services/firebase.js` | Inisialisasi Firebase | Hentikan pemakaian setelah cutover penuh |
| `src/services/ticketService.js` | Create, edit, status, query tiket | Ganti dengan HTTP client |
| `src/services/userService.js` | CRUD profil, pembuatan akun Firebase | Ganti dengan API admin |
| `src/services/logService.js` | Aktivitas sistem | Ganti dengan API log |
| `src/hooks/useTickets.js`, `useLogs.js` | Subscription real-time | Ganti dengan fetch + refresh/polling/event |
| `src/features/admin/*` | Validasi, pembayaran, analytics, user management | Konsumsi endpoint sesuai hak akses |
| `src/features/pic/PicDashboard.jsx` | Antrean PIC per layanan | Backend wajib membatasi layanan PIC |
| `src/components/tickets/TicketForm.jsx` | Form tiket, express, QR, WhatsApp | Selaraskan field, validasi, tracking token |
| `src/pages/QueueMonitor.jsx` | Tiket publik dan hitung posisi antrean | Gunakan endpoint publik dengan data minimal |

Routes frontend: `/login`, `/` untuk dashboard, `/kiosk`, `/monitor/:id`, dan halaman not found. Route `:id` saat ini menggunakan ID dokumen Firestore.

## 4. Aktor dan hak akses

### Existing: perilaku UI

| Aktor | Kemampuan yang terlihat |
| --- | --- |
| Guest/pelanggan | Buat tiket lewat kiosk, buka monitor melalui tautan |
| `admin` | Buat/edit tiket, validasi/tolak, express, batalkan antrean aktif/menunggu, konfirmasi pembayaran individu/bulk, analytics, user management, log |
| `pic_grooming` | Antrean Grooming, ambil tiket, selesaikan layanan menuju pembayaran, batalkan |
| `pic_klinik` | Sama dengan PIC Grooming untuk Klinik |
| `kiosk` | Role legacy masih dikenali di beberapa kondisi frontend |

Role `kiosk` tidak tersedia dalam schema pembuatan user saat ini. Di route `/`, role ini juga dirender sebagai PIC sebelum pesan tautan kiosk muncul; karena pemilihan layanan PIC menggunakan fallback, perilakunya dapat mengarah ke Klinik. **Usulan:** kiosk publik tidak memerlukan akun staff; tentukan penanganan role legacy saat migrasi.

**Penting:** pembatasan UI bukan satu-satunya lapisan. `firestore.rules` lokal kini menegakkan role (`users` hanya admin/pemilik, `system-logs` dibaca admin), alokasi nomor atomik lewat `queue-counters`, kunci okupansi ruang lewat `room-states` (satu tiket `aktif` per ruang), pasangan dokter/groomer dengan ruang, serta pembatasan transisi status per layanan PIC. Pengecualian: **baca tiket tetap publik** (`allow read: if true`) agar `/monitor/:id` berfungsi, sehingga payload tiket termasuk `telepon`/`kontak` dan `catatan` dapat dibaca siapa pun yang mengetahui/menebak ID. Ini risiko privasi sampai ada proyeksi server (token publik dengan field terbatas). Guest juga dapat membuat tiket `PENDING` ber-`source` `kiosk` bila lolos validasi. Rules tersebut belum tentu sudah deployed; verifikasi sebelum mengandalkannya.

### Route publik dan perilaku multi-ruang

- `/kiosk`, `/monitor/:id`, dan `/display` (`RoomQueueDisplay`, layar antrean per ruang: Grooming 1/2, Dokter 1/2; menampilkan tiket `aktif`, jumlah `WAITING`, antrean berikutnya, dan hitungan tiket belum ber-ruang/nomor untuk hari ini) tidak memerlukan login. Backend perlu endpoint publik read-only untuk ketiganya.
- PicDashboard bekerja per ruang: aksi mulai layanan mengunci ruang (`room-states`) dan selesai/batal melepasnya; PIC hanya untuk layanannya, admin untuk semua. Urutan antrean per ruang: `jam`, lalu `queueSequence`, lalu ID.

### Usulan: backend sebagai sumber otorisasi

- Guest hanya membuat tiket berstatus awal yang ditentukan server dan melihat tiket lewat token publik.
- PIC hanya melihat/mengubah tiket layanan miliknya untuk aksi yang diizinkan.
- Admin mengelola tiket, pengguna, analytics, dan log.
- Role, status awal, actor log, timestamp, dan source ditentukan server; jangan dipercaya dari request publik.
- Tidak menyediakan registrasi staff publik atau endpoint pengubahan role oleh user sendiri.

## 5. Alur bisnis dan status

### Existing

1. Pelanggan mengisi nama pemilik, nomor telepon, layanan, tanggal, jam, dan catatan opsional.
2. Tiket kiosk dibuat `PENDING`, lalu frontend menampilkan QR/tautan monitor.
3. Admin memvalidasi ke `WAITING` atau menolak ke `CANCELLED`.
4. PIC memilih antrean layanan terkait dan memulai ke `aktif`.
5. PIC menyelesaikan layanan ke `PAYMENT`.
6. Admin mengonfirmasi pembayaran ke `COMPLETED`; waktu penyelesaian diisi.
7. Admin dapat membuat tiket express/emergency langsung berstatus `aktif`.

| Nilai tersimpan | Arti |
| --- | --- |
| `PENDING` | Menunggu validasi admin |
| `WAITING` | Sudah divalidasi, menunggu layanan |
| `aktif` | Sedang dilayani; huruf kecil ini dipakai secara literal |
| `PAYMENT` | Layanan selesai, menunggu konfirmasi pembayaran |
| `COMPLETED` | Pembayaran dikonfirmasi, tiket selesai |
| `CANCELLED` | Ditolak/dibatalkan |

Alur normal ini belum ditegakkan oleh service/rules. `updateTicketStatus` menerima status dari pemanggil tanpa memeriksa status sebelumnya. Ada pula kondisi pada `TicketCard` yang memungkinkan PIC meneruskan tiket `WAITING` langsung ke `PAYMENT`; dashboard PIC utama menggunakan alur mulai lalu selesai.

**Usulan:** gunakan endpoint aksi terpisah dan state machine di backend. Default transisi mengikuti alur normal; pengecualian seperti skip layanan, buka ulang, atau pembatalan setelah pembayaran memerlukan keputusan bisnis. Jangan otomatis mempertahankan semua kelonggaran existing.

### Jadwal dan urutan antrean existing

- Slot Klinik: 09:00–17:00 dengan interval satu jam.
- Slot Grooming: 09:00–14:30 dengan interval 30 menit.
- Slot dibuat di frontend; belum ditemukan pemeriksaan kapasitas atau slot terisi di service.
- Antrean PIC diurutkan tanggal lalu jam menaik, bukan nomor antrean increment.
- Monitor menghitung posisi dari tiket `WAITING` dan `aktif` pada layanan sama, tanpa filter hari.
- Tiket `PENDING` belum memiliki posisi resmi dalam antrean tersebut.
- Tidak ditemukan nomor antrean harian terpisah; identitas teknis menggunakan ID dokumen.

**Perlu keputusan:** timezone bisnis, tanggal lampau, kapasitas per slot, hari libur, prioritas express, urutan jika jam sama, carry-over antrean kemarin, dan jumlah layanan aktif paralel. Konteks pengguna menyebut Asia/Jakarta, tetapi kode belum menetapkannya sebagai aturan server.

### Pembatalan dan pembayaran

Alasan UI: pelanggan tidak hadir, permintaan pelanggan, toko tutup/penuh, kesalahan input, dibatalkan PIC, atau lainnya dengan teks tambahan. Existing menyatukan alasan dalam pesan log, bukan kolom terstruktur.

Pembayaran bulk memakai beberapa update independen melalui `Promise.all`, sehingga dapat berhasil sebagian. **Usulan:** tentukan kontrak bulk secara eksplisit; default yang mudah dipahami adalah semua berhasil atau seluruh batch dibatalkan dalam satu transaksi.

## 6. Data existing dan validasi

### Koleksi tiket: `petshop-app/v1/tickets`

| Field | Bentuk existing | Catatan |
| --- | --- | --- |
| `id` | ID dokumen, ditambahkan saat dibaca | Bukan field otomatis di payload penyimpanan |
| `nama` | string | Form menganggap nama pemilik/pelanggan; tidak ada field hewan terpisah |
| `telepon` | string | Dipakai UI/WhatsApp |
| `kontak` | string | Diisi dari `telepon` sebelum validasi; keduanya ikut disimpan |
| `layanan` | `Grooming` / `Klinik` | Case-sensitive |
| `tanggalRilis` | `YYYY-MM-DD` | Tanggal layanan dari form, bukan timestamp pembuatan |
| `jam` | `HH:mm` | Jam jadwal, bukan waktu mulai aktual |
| `roomId` | string, opsional pada data lama | Ruang yang ditetapkan saat tiket dibuat |
| `queueSequence` / `queueNumber` | integer / string, opsional pada data lama | Nomor per layanan dan tanggal |
| `doctorId` / `doctorName` | string, opsional | Identitas dokter dan nama saat tiket Klinik dibuat |
| `groomerId` / `groomerName` | string, opsional | Identitas groomer dan nama saat tiket Grooming dibuat |
| `catatan` | string opsional | Maksimal 200 karakter pada schema |
| `status` | Salah satu enam nilai di atas | Default create `PENDING` |
| `source` | `kiosk` / `admin` | Guest juga dipetakan ke `kiosk` |
| `tanggalSelesai` | string kosong atau ISO datetime | Diisi saat menjadi `COMPLETED` |
| `log` | array `{timestamp, message}` | Timestamp dari browser |

Validasi Zod: nama minimal satu karakter; kontak 10–14 digit, diawali `08`; layanan harus valid; catatan maksimal 200 karakter; tanggal dan jam hanya diwajibkan berupa string tidak kosong. Belum ada validasi semantik jadwal di backend.

**Usulan:** simpan satu field nomor telepon canonical, sediakan mapping kompatibilitas frontend; tanggal/jam divalidasi server; gunakan timestamp server. Jangan mengartikan `jam` sebagai `started_at` atau `tanggalRilis` sebagai `created_at` saat migrasi.

### Koleksi pengguna: `users`

ID dokumen mengikuti Firebase Auth UID. Field: `name`, `email`, `role`, `createdAt` berupa ISO string dari browser. Password berada di Firebase Authentication, bukan dokumen ini.

Pembuatan akun menggunakan instance Firebase Auth sekunder agar sesi admin tidak terganti. Edit hanya mengubah nama/role. Hapus hanya menghapus dokumen profil; akun Auth tetap ada. Validasi create: nama minimal 3 karakter, email valid, password minimal 6 karakter, role admin/PIC. Edit menggunakan validasi nama berbeda, minimal 2 karakter.

### Koleksi log: `petshop-app/v1/system-logs`

Field: `timestamp` Firestore server timestamp, `ticketId`, `nama`, `layanan`, `message`. Tidak ada actor ID atau old/new status terstruktur. Penulisan log terpisah dari perubahan tiket, dan kegagalan log hanya dicatat ke console. Edit detail mengganti array log berdasarkan snapshot lama dan tidak membuat system log terpisah.

## 7. Usulan model data relasional

Rancangan awal berikut belum merupakan migration final.

| Tabel | Kolom inti yang disarankan |
| --- | --- |
| `users` | `id`, `legacy_firebase_uid` nullable/unique, `name`, `email` unique, password hash jika auth lokal, `role`, `is_active`, timestamps |
| `doctors` / `doctor_schedules` | ID stabil, nama, status aktif, ruang tetap, hari/tanggal serta jam praktik | Menggantikan katalog dan jadwal mock di frontend |
| `groomers` / `groomer_schedules` | ID stabil, nama, status aktif, ruang tetap, hari/tanggal serta jam kerja | Menggantikan daftar dan jadwal groomer mock di frontend |
| `service_rooms` / `queue_counters` | Ruang per layanan dan counter unik per layanan/tanggal | Penempatan dan alokasi nomor dalam transaksi |
| `tickets` | `id`, `legacy_firestore_id` nullable/unique, `customer_name`, `phone`, `service`, `scheduled_date`, `scheduled_time`, `notes`, `status`, `source`, `room_id`, `doctor_id` nullable, `doctor_name` nullable, `queue_sequence`, `queue_number`, `created_by` nullable, `assigned_to` nullable, `started_at`, `service_completed_at`, `completed_at`, `cancelled_at`, `cancellation_reason`, `version`, timestamps |
| `ticket_events` | `id`, `ticket_id`, `actor_id` nullable, `event_type`, `from_status`, `to_status`, `message`, metadata terbatas, `occurred_at` |
| `ticket_tracking_tokens` | `id`, `ticket_id`, `token_hash` unique, `expires_at` nullable, `revoked_at` nullable |

Timestamp aksi baru boleh null untuk data lama karena histori tidak menyediakan semuanya. Jangan mengarang actor atau waktu mulai dari jam jadwal. Pertahankan pesan log lama sebagai legacy event.

Indeks awal: `(service, status, scheduled_date, scheduled_time)`, tanggal untuk analytics, `(ticket_id, occurred_at)` untuk event, dan legacy ID unik untuk import idempotent. Primary key dapat UUID/ULID atau integer; pilih konsisten sebelum frontend diintegrasikan. Bila status baru dinormalisasi menjadi `ACTIVE`, sediakan mapping eksplisit dari/ke `aktif`.

Belum diperlukan tabel produk, hewan, invoice, atau payment transaction untuk meniru scope existing. Tambahkan hanya bila kebutuhan baru sudah disepakati.

## 8. Usulan kontrak API

Seluruh endpoint berikut adalah **usulan baru**, bukan endpoint yang sudah tersedia. Prefix contoh `/api/v1`. Pilihan sesi cookie atau token perlu disesuaikan topologi domain frontend/backend; implementasi harus menangani expiry, logout, CSRF bila relevan, dan origin yang diizinkan.

| Method/path | Akses | Fungsi |
| --- | --- | --- |
| `POST /auth/login` | Publik, rate-limited | Login staff |
| `POST /auth/logout` | Login | Akhiri sesi |
| `GET /auth/me` | Login | Profil dan role dari server |
| `GET /public/doctors?date=YYYY-MM-DD&time=HH:mm` | Publik | Daftar dokter yang praktik pada jadwal pilihan |
| `POST /public/tickets` | Publik, rate-limited | Pilih dokter/ruang dan buat tiket `PENDING` secara atomik |
| `GET /public/tickets/{token}` | Pemegang token | Status dan ringkasan posisi antrean terbatas |
| `GET /tickets` | Admin/PIC | Daftar terfilter dan paginated; scope PIC dipaksa server |
| `GET /tickets/{id}` | Admin/PIC sesuai scope | Detail tiket |
| `POST /tickets` | Admin | Tiket normal/express dengan opsi terkontrol |
| `PATCH /tickets/{id}` | Admin | Edit field yang diizinkan, termasuk dokter sebelum layanan dimulai |
| `POST /tickets/{id}/validate` | Admin | `PENDING → WAITING` |
| `POST /tickets/{id}/start` | PIC layanan terkait | `WAITING → ACTIVE` |
| `POST /tickets/{id}/finish-service` | PIC layanan terkait | `ACTIVE → PAYMENT` |
| `POST /tickets/{id}/confirm-payment` | Admin | `PAYMENT → COMPLETED` |
| `POST /tickets/{id}/cancel` | Admin/PIC sesuai scope/status | Batalkan dengan alasan wajib |
| `POST /tickets/confirm-payments` | Admin | Konfirmasi bulk, transaksi tunggal yang diusulkan |
| `GET /tickets/{id}/events` | Admin/PIC sesuai scope | Riwayat tiket |
| `GET /logs` | Admin | Riwayat sistem paginated |
| `GET /analytics` | Admin | Agregat periode hari/minggu/bulan/tahun |
| `GET/POST /users` | Admin | Daftar/buat staff |
| `PATCH /users/{id}` | Admin | Edit nama/role |
| `POST /users/{id}/deactivate` | Admin | Nonaktifkan akses dan sesi |

Contoh request create publik dengan nama field baru:

```json
{
  "customer_name": "Budi",
  "phone": "081234567890",
  "service": "Grooming",
  "scheduled_date": "2026-11-04",
  "scheduled_time": "09:30",
  "notes": "Mohon hubungi saat selesai"
}
```

Untuk Klinik, request publik mengirim ID dokter atau pilihan "Dokter mana saja". Untuk Grooming, request mengirim ID groomer atau pilihan "Groomer mana saja". Laravel memvalidasi ketersediaan, menentukan petugas dan ruang, lalu mengalokasikan nomor dalam satu transaksi. Beberapa tiket boleh memakai jam yang sama. Respons create perlu memuat nomor antrean, nama petugas terpilih, dan ruang agar bukti pelanggan dapat ditampilkan. Data petugas dari Laravel menggantikan katalog mock di frontend.

Contoh response `201`:

```json
{
  "data": {
    "status": "PENDING",
    "tracking_token": "<opaque-random-token>",
    "tracking_path": "/monitor/<opaque-random-token>"
  }
}
```

Contoh konflik aksi `409`:

```json
{
  "message": "Tiket sudah diambil petugas lain.",
  "code": "TICKET_STATE_CONFLICT"
}
```

Gunakan `422` untuk validasi dengan error per field, `401` sesi tidak valid, `403` aksi terlarang, `404` resource/token tidak ditemukan, dan `429` pembatasan request. Response list perlu `data`, metadata pagination, dan urutan stabil. Sepakati nama field error dengan frontend.

Filter daftar yang dibutuhkan: status, layanan, rentang tanggal, pagination; penambahan pencarian nama/nomor adalah usulan opsional. Server tidak boleh memperluas scope PIC berdasarkan parameter request.

Token tracking diperlakukan sebagai kredensial akses tiket: acak, sulit ditebak, dapat dicabut, tidak dicatat utuh dalam log. Response publik tidak memuat nomor telepon, catatan internal, email staff, daftar pelanggan lain, atau audit log. Posisi antrean dihitung server tanpa mengirim seluruh koleksi ke browser publik.

## 9. Real-time, konkurensi, dan analytics

**Existing:** semua dashboard mengikuti snapshot Firestore. Monitor bahkan berlangganan daftar tiket untuk menghitung posisi. Error handler listener belum tersedia pada alur utama.

**Usulan awal:** polling terkontrol dapat dipakai untuk integrasi pertama, dengan indikator loading/error dan refresh setelah mutasi. Bila kebutuhan waktu respons menuntut, gunakan event real-time; autentikasi channel staff, pisahkan payload publik, dan kirim event setelah transaksi commit. Polling/event adalah keputusan implementasi, bukan fitur yang sudah tersedia di Laravel repo ini.

Pengambilan tiket wajib atomik: periksa status dan hak akses di dalam transaksi/conditional update, catat PIC serta waktu mulai server, lalu tulis event yang sama-sama commit. Request kedua pada tiket yang sama harus mendapat konflik. Jika hanya satu tiket aktif per layanan diperbolehkan, locking juga harus mencakup resource layanan, bukan hanya satu baris tiket.

Create dan aksi pembayaran perlu perlindungan request berulang agar retry tidak menciptakan duplikasi. Gunakan version/optimistic locking untuk edit bila dibutuhkan; hindari menimpa histori dengan array dari browser.

**Analytics existing:** komponen menerima semua tiket dari dashboard, memfilter berdasarkan `tanggalRilis`, menghitung completed/cancelled serta jumlah per layanan. Minggu dimulai Senin; grafik harian dikelompokkan per jam jadwal, bulanan per hari, tahunan per bulan. Grafik harian menyiapkan bucket 09:00–20:00. Service juga memiliki helper query analytics, tetapi komponen yang diperiksa melakukan agregasi di browser.

**Usulan:** pindahkan agregasi ke backend dan pertahankan arti metrik selama fase kompatibilitas. Laporan berdasarkan tanggal layanan berbeda dari laporan berdasarkan waktu penyelesaian/pembayaran; jika definisi berubah, nyatakan sebagai perubahan produk. Tidak ada data nominal untuk menghitung omzet existing.

## 10. Masalah yang harus dihindari pada backend baru

| Temuan existing | Kebutuhan backend baru |
| --- | --- |
| Role hanya dibatasi UI; rules terlalu luas | Otorisasi server pada setiap endpoint/resource |
| Tiket publik terbaca secara koleksi | Tracking token dan response minimal |
| Validasi terutama di browser | Validasi request server dan constraint database |
| Update status tanpa precondition | State machine dan konflik konkurensi |
| Tiket/log ditulis terpisah | Transaksi data + audit event |
| Hapus profil tidak menghapus Auth | Nonaktifkan akun, cabut sesi, pertahankan audit |
| Timestamp sebagian dari browser | Timestamp server; timezone bisnis eksplisit |
| Subscription seluruh histori | Filter server, pagination, agregasi |
| Konfigurasi Firebase diduplikasi | Konfigurasi backend terpusat, kredensial server di environment |
| Kredensial demo tercantum README | Jangan gunakan sebagai kredensial produksi |

Firebase web config yang tertanam di frontend bukan service-account secret; batas akses utama tetap aturan server. Jangan memindahkan private key backend ke bundle React.

## 11. Strategi migrasi Firebase → Laravel

1. **Sepakati kontrak:** field, status, matriks akses, timezone, queue policy, autentikasi, dan perilaku link QR lama.
2. **Bangun backend terisolasi:** database/migration, akun admin awal melalui prosedur terkontrol, API, otorisasi, transaksi, test. Jangan langsung menyambungkan development ke data produksi.
3. **Siapkan import read-only dari sumber:** inventaris koleksi dan Auth secara terotorisasi; backup sebelum cutover. Dokumen ini tidak menjalankan export/import.
4. **Normalisasi data:** gabungkan `telepon`/`kontak` memakai aturan yang disepakati; tandai konflik jika keduanya berbeda. Petakan `aktif`, string tanggal kosong, timestamp Firestore, role legacy, dan ID lama.
5. **Migrasikan identitas:** dokumen `users` tidak berisi password. Tentukan mempertahankan Firebase Auth sementara, migrasi identitas melalui mekanisme yang divalidasi, atau reset password terencana. Jangan membuat password sementara yang sama untuk semua staff.
6. **Integrasikan frontend:** ganti AuthContext, services, hooks, error mapping, monitor token, dan analytics. Jangan meninggalkan jalur tulis Firebase aktif tanpa strategi sinkronisasi yang jelas.
7. **Rekonsiliasi:** bandingkan jumlah tiket per status/layanan/tanggal, pengguna, serta kelengkapan histori. Import harus idempotent berdasarkan legacy ID.
8. **Cutover terkontrol:** tentukan periode penghentian tulis atau sinkronisasi delta, migrasi akhir, uji smoke, lalu alihkan frontend. Siapkan rollback yang mempertimbangkan data baru setelah cutover.
9. **Tutup akses lama:** setelah hasil stabil, hentikan akses frontend ke Firestore dan perbarui rules/deployment sesuai rencana.

Link `/monitor/{firestoreId}` sudah dapat dibagikan melalui QR/WhatsApp. Perubahan ID menjadi token akan memengaruhi link lama. Jangan otomatis menjadikan seluruh legacy ID sebagai kredensial publik permanen; pilih mekanisme transisi dengan tradeoff privasi yang disepakati.

## 12. Kriteria penerimaan backend awal

- Guest dapat membuat tiket valid, tetapi tidak dapat menentukan role, actor, source internal, atau status express.
- Klinik hanya menawarkan dokter yang praktik pada tanggal dan jam pilihan. Pilihan "Dokter mana saja" tetap menghasilkan dokter dan ruang yang konsisten.
- Grooming mendapat ruang otomatis. Request bersamaan menjaga nomor unik dan batas satu tiket aktif per ruang.
- Tiket lama tanpa dokter atau ruang tetap dapat diimpor dan dibuka. Posisi tiket yang memiliki ruang dihitung per ruang dan tanggal.
- Input invalid ditolak server meskipun request melewati frontend.
- Sesi login/logout berjalan, akun nonaktif tidak dapat memakai sesi lama.
- PIC Grooming ditolak saat mengakses/mengubah tiket Klinik, termasuk melalui ID langsung.
- Dua request start bersamaan menghasilkan tepat satu keberhasilan dan satu konflik.
- Transisi status ilegal ditolak tanpa perubahan tiket maupun event.
- Bulk pembayaran memenuhi kontrak atomicity yang dipilih dan aman terhadap retry.
- Riwayat mencatat actor, waktu, aksi, dan status secara konsisten.
- Monitor publik tidak membocorkan data pelanggan lain atau field internal.
- Posisi antrean memiliki urutan deterministik dan mengikuti kebijakan tanggal/express yang disepakati.
- Analytics cocok dengan fixture data untuk tiap periode, termasuk batas minggu/bulan/timezone.
- Import legacy dapat diulang tanpa duplikasi dan menyajikan laporan rekonsiliasi.

## 13. Kesiapan development dan keputusan terbuka

Frontend menyediakan `npm run dev`, `npm run build`, `npm run lint`, dan `npm run preview`. Build dan lint lokal lulus setelah penambahan fitur dokter. Pengiriman tiket dengan jadwal mock ke Firebase produksi belum diverifikasi dalam audit dokumen ini. Jadwal mock masih berada di frontend sampai Laravel menyediakan data dan validasi server.

Dua workflow GitHub Actions menjalankan build tanpa langkah instalasi dependency/setup Node; CI perlu dilengkapi saat pekerjaan tersebut dijadwalkan. Belum ditemukan AGENTS.md atau skill repository pada lokasi yang diperiksa.

Sebelum implementasi, sepakati:

1. Apakah Firebase Authentication diganti langsung atau bertahap?
2. Database, versi PHP/Laravel, domain deployment, dan mekanisme sesi apa yang digunakan?
3. Apakah frontend memakai field/status baru langsung atau adapter kompatibilitas sementara?
4. Berapa kapasitas slot dan jumlah PIC/layanan aktif paralel?
5. Bagaimana antrean beda hari, express, dan jam sama diprioritaskan?
6. Apakah penolakan pending membutuhkan alasan, dan status apa saja boleh dibatalkan?
7. Bagaimana mempertahankan atau mengganti link monitor yang sudah beredar?
8. Apakah pembayaran tetap sebatas konfirmasi status atau akan memiliki nominal/metode/invoice?
9. Apakah bulk payment wajib all-or-nothing, dan berapa target keterlambatan pembaruan layar?
10. Apakah seluruh data historis wajib dipindahkan, termasuk log yang tidak lengkap?

## 14. Referensi source

- [README](../README.md), [catatan dashboard](../DASHBOARD.md), [manifest](../package.json).
- [Routing](../src/App.jsx), [AuthContext](../src/context/AuthContext.jsx).
- [Ticket service](../src/services/ticketService.js), [user service](../src/services/userService.js), [log service](../src/services/logService.js).
- [Konstanta status](../src/constants.js), [validasi](../src/utils/validationSchemas.js), [dokter mock](../src/utils/doctors.js), [operasi tiket](../src/services/ticketOperations.js).
- [Form tiket](../src/components/tickets/TicketForm.jsx), [kartu tiket](../src/components/tickets/TicketCard.jsx), [modal pembatalan](../src/components/modals/CancellationModal.jsx).
- [Admin dashboard](../src/features/admin/AdminDashboard.jsx), [analytics](../src/features/admin/AdminAnalytics.jsx), [user management](../src/features/admin/UserManagement.jsx).
- [PIC dashboard](../src/features/pic/PicDashboard.jsx), [monitor publik](../src/pages/QueueMonitor.jsx).
- [Firestore rules](../firestore.rules), [hosting](../firebase.json), [CI workflows](../.github/workflows/).
