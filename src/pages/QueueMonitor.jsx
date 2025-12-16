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
      <div className="min-h-screen bg-bg-canvas flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="text-6xl mb-4 text-text-muted">
          <QuestionMarkCircleIcon className="w-16 h-16 mx-auto" />
        </div>
        <h1 className="text-3xl font-bold text-text-main mb-2">
          Tiket Tidak Ditemukan
        </h1>
        <p className="text-text-muted mb-8 font-medium">
          Mohon periksa kembali link atau scan ulang QR code Anda.
        </p>
        <Link
          to="/"
          className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:-translate-y-1 transition-all"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const isGrooming = ticket.layanan === SERVICE_TYPE.GROOMING;

  const getStatusIcon = (status) => {
    switch (status) {
      case TICKET_STATUS.PENDING:
        return <ClockIcon className="w-6 h-6" />;
      case TICKET_STATUS.WAITING:
        return <UserGroupIcon className="w-6 h-6" />;
      case TICKET_STATUS.ACTIVE:
        return <ScissorsIcon className="w-6 h-6" />;
      case TICKET_STATUS.PAYMENT:
        return <CurrencyDollarIcon className="w-6 h-6" />;
      case TICKET_STATUS.COMPLETED:
        return <CheckCircleIcon className="w-6 h-6" />;
      case TICKET_STATUS.CANCELLED:
        return <XCircleIcon className="w-6 h-6" />;
      default:
        return <ClipboardDocumentListIcon className="w-6 h-6" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case TICKET_STATUS.PENDING:
        return "Menunggu Kehadiran Anda";
      case TICKET_STATUS.WAITING:
        return "Dalam Antrian";
      case TICKET_STATUS.ACTIVE:
        return "Sedang Dikerjakan";
      case TICKET_STATUS.PAYMENT:
        return "Menunggu Pembayaran";
      case TICKET_STATUS.COMPLETED:
        return "Selesai";
      case TICKET_STATUS.CANCELLED:
        return "Dibatalkan";
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case TICKET_STATUS.PENDING:
        return "text-amber-500 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30";
      case TICKET_STATUS.WAITING:
        return "text-blue-500 bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30";
      case TICKET_STATUS.ACTIVE:
        return "text-indigo-500 bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-900/30";
      case TICKET_STATUS.PAYMENT:
        return "text-purple-500 bg-purple-50 border-purple-100 dark:bg-purple-900/20 dark:border-purple-900/30";
      case TICKET_STATUS.COMPLETED:
        return "text-green-500 bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-900/30";
      case TICKET_STATUS.CANCELLED:
        return "text-red-500 bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/30";
      default:
        return "text-text-muted bg-bg-subtle border-border-subtle";
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-md w-full animate-scale-in">
        <Link
          to="/"
          className="inline-flex items-center text-text-muted hover:text-text-secondary font-bold mb-6 transition-colors"
        >
          <ArrowLeftIcon className="mr-2 w-5 h-5" />
          Kembali
        </Link>

        <div className="glass-panel rounded-3xl p-8 text-center relative overflow-hidden">
          {/* Service Indicator Decoration */}
          <div
            className={`absolute top-0 left-0 right-0 h-2 bg-linear-to-r ${
              isGrooming
                ? "from-blue-400 to-indigo-500"
                : "from-rose-400 to-orange-500"
            }`}
          ></div>

          <div className="mb-6">
            <span
              className={`inline-block p-4 rounded-full text-4xl mb-4 shadow-sm ${getStatusColor(
                ticket.status
              )}`}
            >
              {getStatusIcon(ticket.status)}
            </span>
            <h2 className="text-3xl font-black text-text-main mb-1">
              {getStatusLabel(ticket.status)}
            </h2>
            <p className="text-text-muted font-medium">
              Status Terkini Antrian Anda
            </p>
          </div>

          <div className="bg-bg-subtle rounded-2xl p-6 border border-border-subtle mb-6 space-y-4 text-left">
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
                Nama Pelanggan / Hewan
              </p>
              <p className="text-xl font-bold text-text-main">{ticket.nama}</p>
            </div>

            <div className="flex justify-between items-center border-t border-border-subtle pt-4">
              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
                  Layanan
                </p>
                <div className="flex items-center gap-2 text-text-secondary font-bold">
                  {isGrooming ? <ScissorsIcon /> : <HeartIcon />}
                  {ticket.layanan}
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
                  Waktu
                </p>
                <div className="flex items-center justify-end gap-2 text-text-secondary font-bold">
                  <CalendarIcon />
                  {ticket.jam || "-"}
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-text-muted font-medium">
            Ticket ID: {ticket.id}
          </p>
        </div>
      </div>
    </div>
  );
}
