import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { COLLECTION_NAME } from "../services/ticketService";
import { useTheme } from "../context/ThemeContext";
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
} from "@heroicons/react/24/outline";
import { subscribeToTickets } from "../services/ticketService";

export default function QueueMonitor() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setTheme } = useTheme();
  const [queueStat, setQueueStat] = useState({
    activeTicket: null,
    peopleAhead: 0,
    totalInQueue: 0,
  });

  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(doc(db, COLLECTION_NAME, id), (doc) => {
      setLoading(false);
      if (doc.exists()) {
        setTicket({ id: doc.id, ...doc.data() });
      } else {
        setTicket(null);
      }
    });

    return () => unsub();
  }, [id]);

  useEffect(() => {
    if (!ticket || !ticket.layanan) return;

    // Subscribe to all tickets to calculate queue position
    const unsubQueue = subscribeToTickets((allTickets) => {
      // 1. Filter tickets for the same service and valid dates (optional, assuming subscribeToTickets handles order)
      // We only care about tickets that are NOT Completed or Cancelled for "Ahead" calculation
      // Or maybe we do care about Completed if we want to show "Today's Queue"?
      // Let's focus on "Waiting" and "Active".

      const activeAndWaiting = allTickets.filter(
        (t) =>
          t.layanan === ticket.layanan &&
          [TICKET_STATUS.WAITING, TICKET_STATUS.ACTIVE].includes(t.status)
      );

      // Sort by time (ascending) - Oldest first
      activeAndWaiting.sort((a, b) => {
        if (a.tanggalRilis !== b.tanggalRilis)
          return a.tanggalRilis.localeCompare(b.tanggalRilis);
        return a.jam.localeCompare(b.jam);
      });

      // Find currently serving (Active only)
      const currentActive = activeAndWaiting.find(
        (t) => t.status === TICKET_STATUS.ACTIVE
      );

      // Calculate people ahead
      // Filter list to find my index
      const myIndex = activeAndWaiting.findIndex((t) => t.id === ticket.id);

      // If I am not in the list (e.g. Pending), I shouldn't see "0 people ahead" as "Your Turn".
      // We will handle this in UI rendering.
      const aheadCount = myIndex >= 0 ? myIndex : activeAndWaiting.length;

      setQueueStat({
        activeTicket: currentActive || null,
        peopleAhead: aheadCount,
        totalInQueue: activeAndWaiting.length,
        isInQueue: myIndex >= 0,
      });
    });

    return () => unsubQueue();
  }, [ticket]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-[#020617] transition-colors duration-500">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/30 dark:bg-indigo-600/30 rounded-full blur-[120px] animate-pulse-soft"></div>
        </div>
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-3xl p-8 rounded-3xl flex flex-col items-center gap-4 animate-pulse-soft border border-white/20 shadow-xl relative z-10">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-slate-600 dark:text-slate-300">
            Memuat Data Tiket...
          </p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-[#020617] relative overflow-hidden transition-colors duration-500">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-400/20 dark:bg-red-900/20 rounded-full blur-[120px] animate-float"></div>
        </div>
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-3xl p-10 rounded-[2.5rem] w-full max-w-md border border-white/20 shadow-2xl relative z-10 animate-scale-in">
          <div className="text-red-500 mb-6 bg-red-100 dark:bg-red-900/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <QuestionMarkCircleIcon className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3">
            Tiket Tidak Ditemukan
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed">
            Mohon periksa kembali link atau scan ulang QR code Anda. Pastikan
            tiket belum kadaluarsa.
          </p>
          <Link
            to="/"
            className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex justify-center"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const isGrooming = ticket.layanan === SERVICE_TYPE.GROOMING;

  const steps = [
    { status: TICKET_STATUS.PENDING, label: "Pending" },
    { status: TICKET_STATUS.WAITING, label: "Antrian" },
    { status: TICKET_STATUS.ACTIVE, label: "Proses" },
    { status: TICKET_STATUS.PAYMENT, label: "Bayar" },
    { status: TICKET_STATUS.COMPLETED, label: "Selesai" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.status === ticket.status);
  const isCancelled = ticket.status === TICKET_STATUS.CANCELLED;

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center bg-slate-50 dark:bg-[#020617] relative overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/30 dark:bg-indigo-600/30 rounded-full blur-[120px] animate-pulse-soft transition-colors duration-700"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-400/30 dark:bg-rose-600/20 rounded-full blur-[120px] animate-float transition-colors duration-700"></div>
        <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-pink-400/30 dark:bg-violet-600/20 rounded-full blur-[100px] animate-pulse-soft delay-1000 transition-colors duration-700"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] dark:opacity-[0.03]"></div>
      </div>

      <div className="max-w-md w-full animate-scale-in relative z-10">
        <Link
          to="/"
          className="inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold mb-6 transition-all hover:-translate-x-1"
        >
          <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
            <ArrowLeftIcon className="w-4 h-4" />
          </div>
          Kembali
        </Link>

        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-0 overflow-hidden shadow-2xl shadow-indigo-100/50 dark:shadow-black/50 border border-white/40 dark:border-white/10 transition-all duration-500">
          <div className="relative p-8 pb-10 text-center bg-linear-to-b from-white/50 to-transparent dark:from-white/5">
            <div className="inline-flex mb-6 p-1 rounded-2xl bg-white/50 dark:bg-slate-950/30 backdrop-blur-md border border-white/20 shadow-inner">
              <span
                className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                  isGrooming
                    ? "bg-blue-100 text-blue-700 dark:bg-indigo-500/20 dark:text-indigo-300"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
                }`}
              >
                {isGrooming ? (
                  <ScissorsIcon className="w-3.5 h-3.5" />
                ) : (
                  <HeartIcon className="w-3.5 h-3.5" />
                )}
                {ticket.layanan}
              </span>
            </div>

            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight transition-colors">
              {ticket.nama}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium font-mono text-sm tracking-widest opacity-80 transition-colors">
              ID: {ticket.id}
            </p>
          </div>

          {!isCancelled && (
            <div className="px-8 mb-8">
              <div className="flex justify-between items-start relative">
                <div className="absolute top-4 left-0 w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full -z-10 -translate-y-1/2"></div>

                <div
                  className="absolute top-4 left-0 h-1 bg-indigo-500 dark:bg-indigo-400 rounded-full -z-10 transition-all duration-500 -translate-y-1/2"
                  style={{
                    width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                  }}
                ></div>

                {steps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div
                      key={step.status}
                      className="flex flex-col items-center gap-2"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 z-10 ${
                          isCompleted
                            ? "bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-110"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-600"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircleIcon className="w-5 h-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                          isCurrent
                            ? "text-indigo-600 dark:text-indigo-300"
                            : "text-slate-400 dark:text-slate-600"
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

          <div className="px-6 pb-6 space-y-4">
            {/* Status Card */}
            <div
              className={`rounded-3xl p-6 text-center border-2 transition-all duration-500 ${
                isCancelled
                  ? "bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30"
                  : "bg-white/40 dark:bg-white/5 border-white/60 dark:border-white/5"
              }`}
            >
              {isCancelled ? (
                <>
                  <XCircleIcon className="w-16 h-16 mx-auto text-red-500 mb-4 animate-bounce" />
                  <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                    Tiket Dibatalkan
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Tiket ini tidak lagi aktif.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 transition-colors">
                    Status Tiket Anda
                  </p>
                  <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-2 animate-pulse-soft transition-colors">
                    {steps.find((s) => s.status === ticket.status)?.label ||
                      ticket.status}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors">
                    Mohon perhatikan panggilan petugas kami.
                  </p>
                </>
              )}
            </div>

            {/* Queue Info Cards - Only show if not cancelled and active */}
            {!isCancelled && ticket.status !== TICKET_STATUS.COMPLETED && (
              <div className="grid grid-cols-2 gap-4">
                {/* Currently Serving */}
                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-3xl border border-indigo-100 dark:border-indigo-500/20 text-center">
                  <div className="w-8 h-8 mx-auto bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-2">
                    <SparklesIcon className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Sedang Dilayani
                  </p>
                  <p className="font-bold text-slate-900 dark:text-white truncate">
                    {queueStat.activeTicket
                      ? queueStat.activeTicket.nama
                      : "Menunggu..."}
                  </p>
                </div>

                {/* People Ahead */}
                <div
                  className={`p-4 rounded-3xl border text-center ${
                    ticket.status === TICKET_STATUS.PENDING
                      ? "bg-slate-50 dark:bg-slate-900/10 border-slate-200 dark:border-slate-700"
                      : queueStat.peopleAhead === 0
                      ? "bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-500/20"
                      : "bg-orange-50/50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-500/20"
                  }`}
                >
                  <div
                    className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${
                      ticket.status === TICKET_STATUS.PENDING
                        ? "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                        : queueStat.peopleAhead === 0
                        ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                        : "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400"
                    }`}
                  >
                    {ticket.status === TICKET_STATUS.PENDING ? (
                      <ClockIcon className="w-5 h-5" />
                    ) : (
                      <UserGroupIcon className="w-5 h-5" />
                    )}
                  </div>
                  <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    {ticket.status === TICKET_STATUS.PENDING
                      ? "Status Antrian"
                      : "Antrian Di Depan"}
                  </p>
                  <p className="font-bold text-slate-900 dark:text-white">
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

          <div className="bg-slate-50/50 dark:bg-slate-900/20 px-8 py-6 flex justify-between items-center border-t border-white/20 dark:border-white/5 backdrop-blur-sm">
            <div className="text-left">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                Jam Booking
              </p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-colors">
                <ClockIcon className="w-4 h-4 text-slate-400" />
                {ticket.jam || "-"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                Tanggal Booking
              </p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center justify-end gap-1 transition-colors">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                {ticket.tanggalRilis || "-"}
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-400 dark:text-slate-600 text-xs mt-6 font-medium transition-colors">
          Lucky Pet Store Management System &copy; 2025
        </p>
      </div>
    </div>
  );
}
