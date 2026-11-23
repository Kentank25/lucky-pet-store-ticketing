import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { QRCode } from "react-qr-code";
import toast from "react-hot-toast";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { COLLECTION_NAME, subscribeToTickets } from "../services/ticketService";
import { TICKET_STATUS, SERVICE_TYPE } from "../constants";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  CalendarIcon,
  ArrowLeftIcon,
  ScissorsIcon,
  HeartIcon,
  UserGroupIcon,
  SparklesIcon,
  ClipboardDocumentCheckIcon,
  ChatBubbleLeftRightIcon,
  ArrowDownTrayIcon,
  MapPinIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { compareQueueTickets } from "../utils/roomQueue";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";

const STATUS_BADGE_MAP = {
  [TICKET_STATUS.PENDING]: { variant: "pending", label: "Pending" },
  [TICKET_STATUS.WAITING]: { variant: "waiting", label: "Antrian" },
  [TICKET_STATUS.ACTIVE]: { variant: "active", label: "Sedang Dilayani" },
  [TICKET_STATUS.PAYMENT]: { variant: "payment", label: "Pembayaran" },
  [TICKET_STATUS.COMPLETED]: { variant: "completed", label: "Selesai" },
  [TICKET_STATUS.CANCELLED]: { variant: "cancelled", label: "Dibatalkan" },
};

const formatRoomLabel = (roomId) => {
  if (!roomId) return "";
  return roomId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export default function QueueMonitor() {
  const { id } = useParams();
  const monitorUrl = `${window.location.origin}/monitor/${id}`;
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("status");
  const [queueStat, setQueueStat] = useState({
    activeTicket: null,
    peopleAhead: 0,
    totalInQueue: 0,
  });

  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(doc(db, COLLECTION_NAME, id), (snapshot) => {
      setLoading(false);
      if (snapshot.exists()) {
        setTicket({ id: snapshot.id, ...snapshot.data() });
      } else {
        setTicket(null);
      }
    });

    return () => unsub();
  }, [id]);

  const ticketId = ticket?.id;
  const ticketLayanan = ticket?.layanan;
  const ticketTanggal = ticket?.tanggalRilis;
  const ticketRoomId = ticket?.roomId;

  useEffect(() => {
    if (!ticketId || !ticketLayanan) return;

    const unsubQueue = subscribeToTickets((allTickets) => {
      const activeAndWaiting = allTickets
        .filter(
          (item) =>
            item.layanan === ticketLayanan &&
            item.tanggalRilis === ticketTanggal &&
            (!ticketRoomId || item.roomId === ticketRoomId) &&
            [TICKET_STATUS.WAITING, TICKET_STATUS.ACTIVE].includes(item.status)
        )
        .sort(compareQueueTickets);

      const currentActive = activeAndWaiting.find(
        (item) => item.status === TICKET_STATUS.ACTIVE
      );
      const myIndex = activeAndWaiting.findIndex(
        (item) => item.id === ticketId
      );
      const aheadCount =
        myIndex < 0
          ? 0
          : activeAndWaiting
              .slice(0, myIndex)
              .filter((item) => item.status === TICKET_STATUS.WAITING).length +
            activeAndWaiting.filter(
              (item) =>
                item.status === TICKET_STATUS.ACTIVE && item.id !== ticketId
            ).length;

      setQueueStat({
        activeTicket: currentActive || null,
        peopleAhead: aheadCount,
        totalInQueue: activeAndWaiting.length,
        isInQueue: myIndex >= 0,
      });
    });

    return () => unsubQueue();
  }, [ticketId, ticketLayanan, ticketTanggal, ticketRoomId]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#F8FAF9] px-4">
        <Card
          padding="lg"
          elevated
          className="bg-white border-[#E2E8F0] flex flex-col items-center gap-3 text-center max-w-xs w-full"
        >
          <div
            aria-hidden="true"
            className="w-10 h-10 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin"
          />
          <p className="text-sm font-semibold text-[#475569]">
            Memuat Data Tiket...
          </p>
        </Card>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4 bg-[#F8FAF9] text-center">
        <Card
          padding="lg"
          elevated
          className="w-full max-w-md bg-white border-[#E2E8F0]"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#FEF2F2] text-[#DC2626] mx-auto mb-5 flex items-center justify-center">
            <QuestionMarkCircleIcon aria-hidden="true" className="w-9 h-9" />
          </div>
          <h1 className="font-heading text-2xl font-extrabold text-[#0F172A] mb-2">
            Tiket Tidak Ditemukan
          </h1>
          <p className="text-sm text-[#475569] mb-6 leading-relaxed">
            Mohon periksa kembali link atau scan ulang QR code Anda. Pastikan
            tiket belum kadaluarsa.
          </p>
          <Link
            to="/kiosk"
            className="inline-flex w-full min-h-11 items-center justify-center rounded-xl bg-[#0D9488] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0F766E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0D9488]"
          >
            Kembali ke Kiosk
          </Link>
        </Card>
      </div>
    );
  }

  const isGrooming = ticket.layanan === SERVICE_TYPE.GROOMING;
  const staffName = ticket.doctorName || ticket.groomerName || "";
  const statusMeta = STATUS_BADGE_MAP[ticket.status] || {
    variant: "neutral",
    label: ticket.status,
  };

  const steps = [
    { status: TICKET_STATUS.PENDING, label: "Pending" },
    { status: TICKET_STATUS.WAITING, label: "Antrian" },
    { status: TICKET_STATUS.ACTIVE, label: "Proses" },
    { status: TICKET_STATUS.PAYMENT, label: "Bayar" },
    { status: TICKET_STATUS.COMPLETED, label: "Selesai" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.status === ticket.status);
  const isCancelled = ticket.status === TICKET_STATUS.CANCELLED;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(monitorUrl);
      toast.success("Link berhasil disalin!");
    } catch {
      toast.error("Link gagal disalin.");
    }
  };

  const sendWhatsApp = () => {
    if (!ticket.telepon) {
      toast.error("Nomor telepon tiket tidak tersedia.");
      return;
    }
    const digits = ticket.telepon.replace(/\D/g, "");
    const phone = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
    const message = `Halo ${ticket.nama}, berikut link untuk memantau antrean Anda di Lucky Pet Store: ${monitorUrl}`;
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const downloadQR = () => {
    const svg = document.getElementById("monitor-qr-code");
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      canvas.getContext("2d").drawImage(image, 0, 0);
      URL.revokeObjectURL(url);
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `Tiket-${ticket.id}.png`;
      link.click();
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      toast.error("QR gagal disimpan.");
    };
    image.src = url;
  };

  return (
    <div className="monitor-screen min-h-dvh px-3 py-3 sm:p-5 flex items-center justify-center bg-[#F8FAF9] text-[#0F172A]">
      <div className="monitor-layout w-full max-w-md min-w-0 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <Link
            to="/kiosk"
            className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#475569] hover:text-[#0D9488] rounded-lg pr-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
          >
            <span className="w-8 h-8 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center shadow-xs">
              <ArrowLeftIcon aria-hidden="true" className="w-4 h-4" />
            </span>
            <span>Kembali</span>
          </Link>

          <Badge variant={statusMeta.variant} dot>
            {statusMeta.label}
          </Badge>
        </div>

        <nav
          aria-label="Tampilan tiket"
          className="grid grid-cols-2 gap-2"
        >
          <Button
            type="button"
            variant={view === "status" ? "primary" : "secondary"}
            size="md"
            onClick={() => setView("status")}
            className="w-full"
          >
            Status Antrean
          </Button>
          <Button
            type="button"
            variant={view === "share" ? "primary" : "secondary"}
            size="md"
            onClick={() => setView("share")}
            className="w-full"
          >
            Simpan &amp; Bagikan
          </Button>
        </nav>

        {view === "status" && (
          <Card
            padding="none"
            elevated
            className="monitor-status overflow-hidden bg-white border-[#E2E8F0]"
          >
            {/* Header & Queue Number */}
            <div
              className={`px-4 py-4 sm:px-6 sm:py-5 text-center border-b border-[#E2E8F0] ${
                isGrooming ? "bg-[#FFF7ED]" : "bg-[#F0FDFA]"
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-2.5">
                <Badge variant={isGrooming ? "grooming" : "klinik"}>
                  {isGrooming ? (
                    <ScissorsIcon aria-hidden="true" className="w-3.5 h-3.5" />
                  ) : (
                    <HeartIcon aria-hidden="true" className="w-3.5 h-3.5" />
                  )}
                  <span>{ticket.layanan}</span>
                </Badge>
              </div>

              {ticket.queueNumber ? (
                <div className="mb-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                    Nomor Antrean
                  </p>
                  <p className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight tabular-nums text-[#0F172A]">
                    {ticket.queueNumber}
                  </p>
                </div>
              ) : null}

              <h1
                className="font-heading text-lg sm:text-xl font-bold text-[#0F172A] line-clamp-1 break-words"
                title={ticket.nama}
              >
                {ticket.nama}
              </h1>
              <p
                className="text-xs font-mono text-[#64748B] truncate mt-0.5 tabular-nums"
                title={ticket.id}
              >
                ID: {ticket.id}
              </p>

              {(ticket.roomId || staffName) && (
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-[#334155]">
                  {ticket.roomId && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-white/90 border border-[#E2E8F0] px-2.5 py-1">
                      <MapPinIcon
                        aria-hidden="true"
                        className="w-3.5 h-3.5 text-[#0D9488]"
                      />
                      <span>Ruang {formatRoomLabel(ticket.roomId)}</span>
                    </span>
                  )}
                  {staffName && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-white/90 border border-[#E2E8F0] px-2.5 py-1">
                      <UserIcon
                        aria-hidden="true"
                        className="w-3.5 h-3.5 text-[#0D9488]"
                      />
                      <span>{staffName}</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Progress Stepper */}
            {!isCancelled && (
              <div className="px-4 sm:px-6 pt-4 pb-2">
                <div className="flex justify-between items-start relative">
                  <div className="absolute top-3.5 left-0 w-full h-1 bg-[#E2E8F0] rounded-full" />
                  <div
                    className={`absolute top-3.5 left-0 h-1 rounded-full transition-all duration-300 ${
                      isGrooming ? "bg-[#EA580C]" : "bg-[#0D9488]"
                    }`}
                    style={{
                      width: `${
                        currentStepIndex >= 0
                          ? (currentStepIndex / (steps.length - 1)) * 100
                          : 0
                      }%`,
                    }}
                  />

                  {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const accentBg = isGrooming
                      ? "bg-[#EA580C] border-[#EA580C]"
                      : "bg-[#0D9488] border-[#0D9488]";
                    const accentText = isGrooming
                      ? "text-[#C2410C]"
                      : "text-[#0F766E]";

                    return (
                      <div
                        key={step.status}
                        className="flex flex-col items-center gap-1.5 relative z-10"
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 tabular-nums ${
                            isCompleted
                              ? `${accentBg} text-white`
                              : "bg-white border-[#CBD5E1] text-[#64748B]"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircleIcon
                              aria-hidden="true"
                              className="w-4 h-4"
                            />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wide ${
                            isCurrent ? accentText : "text-[#64748B]"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Status & Queue Info */}
            <div className="p-4 sm:p-5 space-y-3">
              {isCancelled ? (
                <div className="rounded-xl p-4 text-center bg-[#FEF2F2] border border-[#FECACA]">
                  <XCircleIcon
                    aria-hidden="true"
                    className="w-10 h-10 mx-auto text-[#DC2626] mb-2"
                  />
                  <h2 className="font-heading text-lg font-bold text-[#991B1B]">
                    Tiket Dibatalkan
                  </h2>
                  <p className="text-xs text-[#B91C1C] mt-0.5">
                    Tiket ini tidak lagi aktif dalam antrean.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl p-3.5 text-center bg-[#F8FAF9] border border-[#E2E8F0]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1">
                    Status Saat Ini
                  </p>
                  <p
                    className={`font-heading text-2xl font-extrabold ${
                      isGrooming ? "text-[#EA580C]" : "text-[#0D9488]"
                    }`}
                  >
                    {steps.find((s) => s.status === ticket.status)?.label ||
                      ticket.status}
                  </p>
                  <p className="text-xs text-[#475569] mt-0.5">
                    Mohon perhatikan panggilan petugas kami.
                  </p>
                </div>
              )}

              {!isCancelled &&
                ticket.status !== TICKET_STATUS.COMPLETED &&
                !!ticket.roomId && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl p-3 border border-[#E2E8F0] bg-[#F8FAF9] text-center">
                      <div className="w-7 h-7 mx-auto rounded-full bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center mb-1.5">
                        <SparklesIcon aria-hidden="true" className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                        Sedang Dilayani
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-[#0F172A] truncate tabular-nums">
                        {queueStat.activeTicket
                          ? queueStat.activeTicket.queueNumber ||
                            queueStat.activeTicket.nama
                          : "Menunggu..."}
                      </p>
                    </div>

                    <div
                      className={`rounded-xl p-3 border text-center ${
                        ticket.status === TICKET_STATUS.PENDING
                          ? "bg-[#F8FAF9] border-[#E2E8F0]"
                          : queueStat.peopleAhead === 0
                          ? "bg-[#F0FDFA] border-[#99F6E4]"
                          : "bg-[#FFF7ED] border-[#FED7AA]"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center mb-1.5 ${
                          ticket.status === TICKET_STATUS.PENDING
                            ? "bg-[#E2E8F0] text-[#475569]"
                            : queueStat.peopleAhead === 0
                            ? "bg-[#CCFBF1] text-[#0F766E]"
                            : "bg-[#FFEDD5] text-[#C2410C]"
                        }`}
                      >
                        {ticket.status === TICKET_STATUS.PENDING ? (
                          <ClockIcon aria-hidden="true" className="w-4 h-4" />
                        ) : (
                          <UserGroupIcon
                            aria-hidden="true"
                            className="w-4 h-4"
                          />
                        )}
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                        {ticket.status === TICKET_STATUS.PENDING
                          ? "Status Antrian"
                          : "Antrian Di Depan"}
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-[#0F172A] tabular-nums">
                        {ticket.status === TICKET_STATUS.PENDING
                          ? "Menunggu Validasi"
                          : queueStat.peopleAhead === 0
                          ? "Giliran Anda!"
                          : `${queueStat.peopleAhead} Orang`}
                      </p>
                    </div>
                  </div>
                )}
            </div>

            {/* Footer Schedule */}
            <div className="bg-[#F8FAF9] px-4 sm:px-5 py-3 flex items-center justify-between gap-3 border-t border-[#E2E8F0]">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  Jam Booking
                </p>
                <p className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5 tabular-nums">
                  <ClockIcon
                    aria-hidden="true"
                    className="w-4 h-4 text-[#64748B]"
                  />
                  <span>{ticket.jam || "-"}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  Tanggal Booking
                </p>
                <p className="text-sm font-bold text-[#0F172A] flex items-center justify-end gap-1.5 tabular-nums">
                  <CalendarIcon
                    aria-hidden="true"
                    className="w-4 h-4 text-[#64748B]"
                  />
                  <span>{ticket.tanggalRilis || "-"}</span>
                </p>
              </div>
            </div>
          </Card>
        )}

        {view === "share" && (
          <Card
            padding="md"
            elevated
            className="monitor-share bg-white border-[#E2E8F0] text-center"
            aria-label="Simpan dan bagikan tiket"
          >
            <h2 className="font-heading text-base font-bold text-[#0F172A]">
              Simpan &amp; Bagikan Tiket
            </h2>
            <p className="mt-1 mb-3 text-xs sm:text-sm text-[#475569]">
              Scan QR atau simpan link untuk memantau antrean Anda.
            </p>

            {ticket.queueNumber && (
              <p className="mb-3 text-lg font-extrabold text-[#0D9488] tabular-nums">
                {ticket.queueNumber}
              </p>
            )}

            <div className="inline-block rounded-2xl bg-white p-3 border border-[#E2E8F0] shadow-xs">
              <QRCode id="monitor-qr-code" value={monitorUrl} size={148} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 min-[360px]:grid-cols-3">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={copyLink}
                className="w-full px-2"
              >
                <ClipboardDocumentCheckIcon
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0"
                />
                <span>Salin Link</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={sendWhatsApp}
                className="w-full px-2"
              >
                <ChatBubbleLeftRightIcon
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0"
                />
                <span>Kirim WA</span>
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={downloadQR}
                className="w-full px-2"
              >
                <ArrowDownTrayIcon
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0"
                />
                <span>Simpan QR</span>
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
