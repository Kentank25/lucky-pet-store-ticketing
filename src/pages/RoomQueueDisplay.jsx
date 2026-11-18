import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";
import { subscribeToTickets } from "../services/ticketService";
import { getQueueDate, summarizeRoomQueue } from "../utils/roomQueue";
import "./RoomQueueDisplay.css";

export default function RoomQueueDisplay() {
  const [now, setNow] = useState(() => new Date());
  const [snapshot, setSnapshot] = useState(null);
  const [connection, setConnection] = useState("loading");
  const [online, setOnline] = useState(() => navigator.onLine);
  const [attempt, setAttempt] = useState(0);
  const [fullscreenError, setFullscreenError] = useState("");
  const date = getQueueDate(now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    const network = () => setOnline(navigator.onLine);
    window.addEventListener("online", network); window.addEventListener("offline", network);
    return () => { window.clearInterval(timer); window.removeEventListener("online", network); window.removeEventListener("offline", network); };
  }, []);
  useEffect(() => subscribeToTickets((tickets, metadata) => {
    setSnapshot({ date, tickets, receivedAt: new Date(), fromCache: metadata.fromCache });
    setConnection(metadata.fromCache || metadata.hasPendingWrites ? "cached" : "connected");
  }, () => setConnection("error"), { date }), [date, attempt]);

  const sameDate = snapshot?.date === date;
  const status = !online ? "offline" : !sameDate && connection !== "error" ? "loading" : connection;
  const ready = sameDate && (status === "connected" || (status !== "error" && snapshot.tickets.length > 0));
  const { rooms, unassigned } = summarizeRoomQueue(ready ? snapshot.tickets : [], date);
  const notAssigned = Object.values(unassigned).reduce((sum, value) => sum + value, 0);
  const messages = {
    connected: "Terhubung · pembaruan otomatis",
    cached: "Data tersimpan · belum terkonfirmasi dari server",
    offline: "Offline · data terakhir mungkin sudah berubah",
    loading: "Memuat antrean...",
    error: "Data antrean gagal dimuat. Coba lagi atau hubungi petugas.",
  };
  const timeOptions = { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hour12: false };
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
      setFullscreenError("");
    } catch { setFullscreenError("Layar penuh tidak tersedia. Gunakan fitur layar penuh browser."); }
  }
  return (
    <main className="room-display">
      <header className="room-display-header">
        <div className="room-display-brand"><img src="/Lucky Pet Store Logo (Black).png" alt="Logo Lucky Pet Store" /><div><p>Lucky Pet Store</p><h1>Antrean ruang layanan</h1></div></div>
        <div className="room-display-clock"><strong>{now.toLocaleTimeString("id-ID", timeOptions)} <span>WIB</span></strong><span>{now.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta", weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span></div>
      </header>
      <div className={`room-connection ${status}`} role="status"><span className="room-status-dot" />{messages[status]}{status === "error" && <button onClick={() => { setConnection("loading"); setSnapshot(null); setAttempt((value) => value + 1); }}>Coba lagi</button>}</div>
      <section className="room-display-grid" aria-label="Antrean per ruang" aria-busy={status === "loading"}>
        {rooms.map((room) => <article key={room.id} className={`room-display-card ${room.service === "Grooming" ? "grooming" : "clinic"}`}>
          <h2>{room.name}</h2>
          <p className="room-state">{!ready ? "Menunggu data" : room.active > 1 ? "Perlu pengecekan petugas" : room.active ? "Sedang melayani" : "Belum ada layanan berjalan hari ini"}</p>
          <div className="room-current"><span>Sedang dilayani</span><strong>{!ready ? "—" : room.current.length ? room.current.join(" / ") : "—"}</strong></div>
          <div className="room-next"><span>Berikutnya</span><strong>{ready ? room.next?.queueNumber || "Belum ada antrean" : "—"}</strong></div>
          <div className="room-queue-count"><strong>{ready ? room.waiting : "—"}</strong><span>antrean menunggu</span></div>
        </article>)}
      </section>
      {ready && notAssigned > 0 && <aside className="room-unassigned" role="status">{notAssigned} tiket hari ini perlu penetapan ruang atau nomor oleh admin.</aside>}
      <footer className="room-display-footer"><div><p>Hanya antrean tervalidasi tanggal hari ini. Urutan berdasarkan jam jadwal, lalu nomor.</p>{sameDate && <small>Data terakhir diterima {snapshot.receivedAt.toLocaleTimeString("id-ID", { ...timeOptions, second: "2-digit" })} WIB{snapshot.fromCache ? " (cache)" : ""}</small>}</div><div className="room-footer-actions"><Link to="/kiosk">Ambil antrean</Link><button onClick={toggleFullscreen} aria-label="Aktifkan atau keluar layar penuh"><ArrowsPointingOutIcon /></button></div></footer>
      {fullscreenError && <p role="status">{fullscreenError}</p>}
    </main>
  );
}
