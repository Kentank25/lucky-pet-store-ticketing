import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { COLLECTION_NAME } from "../services/ticketService";
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
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center bg-slate-50 dark:bg-[#020617] relative overflow-hidden transition-colors duration-500">
      {/* Aurora Background Decor */}
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

        {/* Status Card */}
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-0 overflow-hidden shadow-2xl shadow-indigo-100/50 dark:shadow-black/50 border border-white/40 dark:border-white/10 transition-all duration-500">
          {/* Header Section */}
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

          {/* Stepper Visualization */}
          {!isCancelled && (
            <div className="px-8 mb-8">
              <div className="flex justify-between items-center relative">
                {/* Progress Bar Background */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full -z-10"></div>

                {/* Active Progress Bar */}
                <div
                  className="absolute top-1/2 left-0 h-1 bg-indigo-500 dark:bg-indigo-400 rounded-full -z-10 transition-all duration-500"
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

          {/* Current Status Box */}
          <div className="px-6 pb-6">
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
                    Status Saat Ini
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
          </div>

          {/* Footer Info */}
          <div className="bg-slate-50/50 dark:bg-slate-900/20 px-8 py-6 flex justify-between items-center border-t border-white/20 dark:border-white/5 backdrop-blur-sm">
            <div className="text-left">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                Dibuat Pada
              </p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-colors">
                <ClockIcon className="w-4 h-4 text-slate-400" />
                {ticket.jam || "-"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">
                Estimasi
              </p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center justify-end gap-1 transition-colors">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                Hari Ini
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
