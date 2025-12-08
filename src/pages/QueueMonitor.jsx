import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { COLLECTION_NAME } from "../services/ticketService";
import { TICKET_STATUS, SERVICE_TYPE } from "../constants";
import {
  FiClock,
  FiUsers,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiClipboard,
  FiHelpCircle,
} from "react-icons/fi";
import { FaCut } from "react-icons/fa";

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="text-6xl mb-4 text-gray-300">
          <FiHelpCircle />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Tiket Tidak Ditemukan
        </h1>
        <p className="text-gray-500 mb-8">
          Mohon periksa kembali link atau scan ulang QR code Anda.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const isGrooming = ticket.layanan === SERVICE_TYPE.GROOMING;
  const themeColor = isGrooming ? "blue" : "rose";
  const gradient = isGrooming
    ? "from-blue-500 to-indigo-600"
    : "from-rose-500 to-orange-500";

  const getStatusIcon = (status) => {
    switch (status) {
      case TICKET_STATUS.PENDING:
        return <FiClock />;
      case TICKET_STATUS.WAITING:
        return <FiUsers />;
      case TICKET_STATUS.ACTIVE:
        return <FaCut />;
      case TICKET_STATUS.PAYMENT:
        return <FiDollarSign />;
      case TICKET_STATUS.COMPLETED:
        return <FiCheckCircle />;
      case TICKET_STATUS.CANCELLED:
        return <FiXCircle />;
      default:
        return <FiClipboard />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case TICKET_STATUS.PENDING:
        return "Menunggu Konfirmasi";
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

  const getProgressWidth = (status) => {
    switch (status) {
      case TICKET_STATUS.PENDING:
        return "20%";
      case TICKET_STATUS.WAITING:
        return "40%";
      case TICKET_STATUS.ACTIVE:
        return "60%";
      case TICKET_STATUS.PAYMENT:
        return "80%";
      case TICKET_STATUS.COMPLETED:
        return "100%";
      default:
        return "0%";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative">
        {/* Header Background */}
        <div
          className={`absolute top-0 left-0 right-0 h-32 bg-linear-to-br ${gradient}`}
        ></div>

        <div className="relative z-10 px-6 pt-12 pb-8 text-center">
          {/* Status Icon Bubble */}
          <div className="w-24 h-24 mx-auto bg-white rounded-full shadow-xl flex items-center justify-center text-5xl mb-4 border-4 border-white/50 backdrop-blur-sm animate-bounce">
            {getStatusIcon(ticket.status)}
          </div>

          <h2 className="text-3xl font-black text-gray-800 mb-1">
            {ticket.nama}
          </h2>
          <p className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-6">
            ID: #{ticket.id.slice(-6)}
          </p>

          {/* Status Card */}
          <div
            className={`bg-${themeColor}-50 border border-${themeColor}-100 rounded-2xl p-6 mb-6`}
          >
            <p
              className={`text-${themeColor}-600 font-bold text-sm uppercase tracking-widest mb-2`}
            >
              Status Saat Ini
            </p>
            <h3 className={`text-2xl font-black text-${themeColor}-700`}>
              {getStatusLabel(ticket.status)}
            </h3>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-xs text-gray-400 font-bold uppercase">
                Layanan
              </p>
              <p className="text-gray-700 font-bold">{ticket.layanan}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-xs text-gray-400 font-bold uppercase">Waktu</p>
              <p className="text-gray-700 font-bold">{ticket.jam || "-"}</p>
            </div>
          </div>

          {/* Progress Bar (Visual only) */}
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-8">
            <div
              className={`h-full bg-${themeColor}-500 transition-all duration-1000 ease-out`}
              style={{
                width: getProgressWidth(ticket.status),
              }}
            ></div>
          </div>

          <p className="text-xs text-center text-gray-400">
            Halaman ini akan refresh otomatis saat status berubah.
          </p>
        </div>
      </div>
    </div>
  );
}
