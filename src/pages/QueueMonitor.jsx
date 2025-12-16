import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { COLLECTION_NAME } from "../services/ticketService";
import { TICKET_STATUS, SERVICE_TYPE } from "../constants";
import {
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClipboardDocumentListIcon,
  QuestionMarkCircleIcon,
  CalendarIcon,
  ArrowLeftIcon,
  ScissorsIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

export default function QueueMonitor() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-canvas flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-tr from-indigo-500/10 to-purple-500/10 pointer-events-none"></div>
        <div className="glass-panel p-8 rounded-3xl flex flex-col items-center gap-4 animate-pulse-soft">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-text-muted">Memuat Data Tiket...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-bg-canvas relative overflow-hidden">
        <div className="glass-panel p-10 rounded-[2.5rem] w-full max-w-md border-red-200/50 dark:border-red-900/10 shadow-xl relative z-10">
          <div className="text-red-500 mb-6 bg-red-50 dark:bg-red-900/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
            <QuestionMarkCircleIcon className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-black text-text-main mb-3">
            Tiket Tidak Ditemukan
          </h1>
          <p className="text-text-muted mb-8 font-medium leading-relaxed">
            Mohon periksa kembali link atau scan ulang QR code Anda. Pastikan
            tiket belum kadaluarsa.
          </p>
          <Link
            to="/"
            className="btn-primary w-full flex justify-center py-4 rounded-2xl"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const isGrooming = ticket.layanan === SERVICE_TYPE.GROOMING;

  // Status Steps for the Stepper visualization
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
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center bg-bg-canvas relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-primary/10 to-transparent pointer-events-none"></div>

      <div className="max-w-md w-full animate-scale-in relative z-10">
        <Link
          to="/"
          className="inline-flex items-center text-text-secondary hover:text-primary font-bold mb-6 transition-all hover:-translate-x-1"
        >
          <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
            <ArrowLeftIcon className="w-4 h-4" />
          </div>
          Kembali
        </Link>

        {/* Status Card */}
        <div className="glass-panel rounded-[2.5rem] p-0 overflow-hidden shadow-2xl shadow-primary/10 border-white/40 dark:border-white/5">
          {/* Header Section */}
          <div className="relative p-8 pb-10 text-center bg-linear-to-b from-white/50 to-transparent dark:from-white/5">
            <div className="inline-flex mb-6 p-1 rounded-2xl bg-white/50 dark:bg-black/20 backdrop-blur-md border border-white/20 shadow-inner">
              <span
                className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                  isGrooming
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
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

            <h2 className="text-4xl font-black text-text-main mb-2 tracking-tight">
              {ticket.nama}
            </h2>
            <p className="text-text-muted font-medium font-mono text-sm tracking-widest opacity-80">
              ID: {ticket.id}
            </p>
          </div>

          {/* Stepper Visualization */}
          {!isCancelled && (
            <div className="px-8 mb-8">
              <div className="flex justify-between items-center relative">
                {/* Progress Bar Background */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-border-subtle/60 rounded-full -z-10"></div>

                {/* Active Progress Bar */}
                <div
                  className="absolute top-1/2 left-0 h-1 bg-primary rounded-full -z-10 transition-all duration-500"
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
                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-110"
                            : "bg-bg-surface border-border-subtle text-text-muted"
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
                          isCurrent ? "text-primary" : "text-text-muted/60"
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

          {/* Current Status Box */}
          <div className="px-6 pb-6">
            <div
              className={`rounded-3xl p-6 text-center border-2 transition-all duration-500 ${
                isCancelled
                  ? "bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30"
                  : "bg-bg-surface/50 border-white/40 dark:border-border-subtle"
              }`}
            >
              {isCancelled ? (
                <>
                  <XCircleIcon className="w-16 h-16 mx-auto text-red-500 mb-4 animate-bounce" />
                  <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                    Tiket Dibatalkan
                  </h3>
                  <p className="text-text-muted text-sm">
                    Tiket ini tidak lagi aktif.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Status Saat Ini
                  </p>
                  <div className="text-3xl font-black text-primary mb-2 animate-pulse-soft">
                    {steps.find((s) => s.status === ticket.status)?.label ||
                      ticket.status}
                  </div>
                  <p className="text-text-secondary text-sm font-medium">
                    Mohon perhatikan panggilan petugas kami.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Footer Info */}
          <div className="bg-bg-subtle/50 px-8 py-6 flex justify-between items-center border-t border-white/10">
            <div className="text-left">
              <p className="text-xs font-bold text-text-muted uppercase mb-1">
                Dibuat Pada
              </p>
              <p className="text-sm font-bold text-text-main flex items-center gap-1">
                <ClockIcon className="w-4 h-4 text-text-muted" />
                {ticket.jam || "-"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-text-muted uppercase mb-1">
                Estimasi
              </p>
              <p className="text-sm font-bold text-text-main flex items-center justify-end gap-1">
                <CalendarIcon className="w-4 h-4 text-text-muted" />
                Hari Ini
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-text-muted/60 text-xs mt-6 font-medium">
          Lucky Pet Store Management System &copy; 2025
        </p>
      </div>
    </div>
  );
}
