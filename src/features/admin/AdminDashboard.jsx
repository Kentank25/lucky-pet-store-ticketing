import { useState } from "react";
import {
  ChevronDownIcon,
  ScissorsIcon,
  HeartIcon,
  ClockIcon,
  HomeIcon,
  ChartBarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import ConfirmationModal from "../../components/modals/ConfirmationModal";
import { createPortal } from "react-dom";
import TicketForm from "../../components/tickets/TicketForm";
import TicketList from "../../components/tickets/TicketList";
import LogList from "../../components/history/LogList";
import { useTickets } from "../../hooks/useTickets";
import { updateTicketStatus } from "../../services/ticketService";
import toast from "react-hot-toast";
import AdminAnalytics from "./AdminAnalytics";
import UserManagement from "./UserManagement";
import { TICKET_STATUS, SERVICE_TYPE } from "../../constants";
import AccordionItem from "../../components/common/AccordionItem";
import PaymentAccordion from "./PaymentAccordion";
import ValidationAccordion from "./ValidationAccordion";
import ThemeToggle from "../../components/common/ThemeToggle";

export default function AdminDashboard() {
  const { tickets, loading } = useTickets();
  const [ticketToEdit, setTicketToEdit] = useState(null);
  const [selectedPaymentIds, setSelectedPaymentIds] = useState(new Set());
  const [expandedSections, setExpandedSections] = useState({
    Grooming: true,
    Klinik: true,
  });
  const [expandedValidationSections, setExpandedValidationSections] = useState({
    Grooming: true,
    Klinik: true,
  });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isDanger: false,
    confirmText: "Konfirmasi",
  });

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  const pendingTickets = tickets
    .filter((t) => t.status === TICKET_STATUS.PENDING)
    .sort((a, b) => {
      const timeA = a.jam || "00:00";
      const timeB = b.jam || "00:00";
      const dateA = new Date(`${a.tanggalRilis}T${timeA}`);
      const dateB = new Date(`${b.tanggalRilis}T${timeB}`);
      return dateA - dateB;
    });
  const paymentTickets = tickets.filter(
    (t) => t.status === TICKET_STATUS.PAYMENT
  );
  const activeTickets = tickets.filter(
    (t) =>
      t.status === TICKET_STATUS.WAITING || t.status === TICKET_STATUS.ACTIVE
  );

  const pendingGrooming = pendingTickets.filter(
    (t) => t.layanan === SERVICE_TYPE.GROOMING
  );
  const pendingKlinik = pendingTickets.filter(
    (t) => t.layanan === SERVICE_TYPE.KLINIK
  );

  const paymentGrooming = paymentTickets.filter(
    (t) => t.layanan === SERVICE_TYPE.GROOMING
  );
  const paymentKlinik = paymentTickets.filter(
    (t) => t.layanan === SERVICE_TYPE.KLINIK
  );

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleValidationSection = (section) => {
    setExpandedValidationSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedPaymentIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPaymentIds(newSelected);
  };

  const selectAllGroup = (groupTickets, isSelected) => {
    const newSelected = new Set(selectedPaymentIds);
    groupTickets.forEach((t) => {
      if (isSelected) {
        newSelected.add(t.id);
      } else {
        newSelected.delete(t.id);
      }
    });
    setSelectedPaymentIds(newSelected);
  };

  const handleConfirmPayments = (idsToConfirm) => {
    if (idsToConfirm.length === 0) return;

    setConfirmModal({
      isOpen: true,
      title: "Konfirmasi Pembayaran",
      message: `Konfirmasi pembayaran untuk ${idsToConfirm.length} tiket?`,
      confirmText: "Ya, Konfirmasi",
      isDanger: false,
      onConfirm: async () => {
        closeConfirmModal();
        const toastId = toast.loading("Memproses pembayaran...");
        try {
          await Promise.all(
            idsToConfirm.map((id) => {
              const ticket = tickets.find((t) => t.id === id);
              return updateTicketStatus(
                id,
                TICKET_STATUS.COMPLETED,
                "Pembayaran diterima (Bulk Action). Tiket selesai.",
                ticket
              );
            })
          );
          toast.success("Pembayaran berhasil dikonfirmasi!", { id: toastId });

          const newSelected = new Set(selectedPaymentIds);
          idsToConfirm.forEach((id) => newSelected.delete(id));
          setSelectedPaymentIds(newSelected);
        } catch (error) {
          console.error(error);
          toast.error("Gagal memproses beberapa pembayaran.", { id: toastId });
        }
      },
    });
  };

  const headerActions = (
    <div className="p-1.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl rounded-2xl border border-white/20 dark:border-white/5 shadow-2xl flex items-center gap-1">
      {[
        { id: "dashboard", label: "Dashboard", icon: HomeIcon },
        { id: "analytics", label: "Analitik", icon: ChartBarIcon },
        { id: "users", label: "Pengguna", icon: UserGroupIcon },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 relative overflow-hidden group active-press ${
            activeTab === tab.id
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
              : "text-text-secondary hover:text-text-main hover:bg-white/50 dark:hover:bg-white/5"
          }`}
          title={tab.label}
        >
          <tab.icon
            className={`w-5 h-5 transition-transform duration-300 ${
              activeTab === tab.id ? "scale-110" : "group-hover:scale-110"
            }`}
          />
          <span className="hidden md:inline">{tab.label}</span>
          {activeTab === tab.id && (
            <div className="absolute inset-0 bg-white/20 animate-pulse-soft rounded-xl pointer-events-none"></div>
          )}
        </button>
      ))}
      <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1"></div>
      <div className="px-1">
        <ThemeToggle />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header Tabs Portal */}
      {document.getElementById("header-actions") &&
        createPortal(headerActions, document.getElementById("header-actions"))}

      {/* Main Content */}
      {activeTab === "analytics" ? (
        <div className="space-y-8 animate-fade-in">
          <AdminAnalytics />
          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="text-xl font-bold text-text-main mb-4 flex items-center gap-2">
              <span className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 w-8 h-8 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-5 h-5" />
              </span>
              Riwayat Aktivitas
            </h3>
            <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              <LogList />
            </div>
          </div>
        </div>
      ) : activeTab === "users" ? (
        <div className="animate-fade-in">
          <UserManagement />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          {/* Left Column: Form */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 sm:p-8 rounded-4xl sticky top-24">
              <h3 className="text-xl font-black text-text-main mb-6 flex items-center gap-2">
                <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-lg">
                  +
                </span>
                Buat Tiket Baru
              </h3>
              <TicketForm
                ticketToEdit={ticketToEdit}
                onCancel={() => setTicketToEdit(null)}
                className="w-full"
              />
            </div>
          </div>

          {/* Right Column: Queues */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Validation Queue */}
            {pendingTickets.length > 0 && (
              <div className="glass-panel p-6 sm:p-8 rounded-4xl border-l-4 border-amber-400 bg-amber-50/10 dark:bg-amber-900/5">
                <h3 className="text-2xl font-black text-text-main mb-6 flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></span>
                  Konfirmasi Kehadiran
                  <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-sm px-3 py-1 rounded-full">
                    {pendingTickets.length}
                  </span>
                </h3>

                <ValidationAccordion
                  title="Grooming"
                  items={pendingGrooming}
                  isOpen={expandedValidationSections.Grooming}
                  onToggle={() => toggleValidationSection("Grooming")}
                  icon={<ScissorsIcon className="w-5 h-5" />}
                  loading={loading}
                />
                <ValidationAccordion
                  title="Klinik"
                  items={pendingKlinik}
                  isOpen={expandedValidationSections.Klinik}
                  onToggle={() => toggleValidationSection("Klinik")}
                  icon={<HeartIcon className="w-5 h-5" />}
                  loading={loading}
                />
              </div>
            )}

            {/* 2. Payment Queue */}
            {paymentTickets.length > 0 && (
              <div className="glass-panel p-6 sm:p-8 rounded-4xl border-l-4 border-indigo-400 bg-indigo-50/10 dark:bg-indigo-900/5">
                <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                  <h3 className="text-2xl font-black text-text-main flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-indigo-400 animate-pulse"></span>
                    Menunggu Pembayaran
                    <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-sm px-3 py-1 rounded-full">
                      {paymentTickets.length}
                    </span>
                  </h3>

                  <div className="flex gap-2">
                    {selectedPaymentIds.size > 0 && (
                      <button
                        onClick={() =>
                          handleConfirmPayments(Array.from(selectedPaymentIds))
                        }
                        className="btn-primary py-2 px-4 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 text-sm active-press hover-lift"
                      >
                        Konfirmasi ({selectedPaymentIds.size})
                      </button>
                    )}
                    <button
                      onClick={() =>
                        handleConfirmPayments(paymentTickets.map((t) => t.id))
                      }
                      className="px-4 py-2 bg-white text-indigo-600 border border-indigo-100 dark:bg-white/5 dark:text-indigo-300 dark:border-white/10 text-sm font-bold rounded-xl hover:bg-indigo-50 dark:hover:bg-white/10 transition-all active-press hover-lift"
                    >
                      Semua
                    </button>
                  </div>
                </div>

                <PaymentAccordion
                  title="Grooming"
                  items={paymentGrooming}
                  isOpen={expandedSections.Grooming}
                  onToggle={() => toggleSection("Grooming")}
                  icon={<ScissorsIcon className="w-5 h-5" />}
                  selectedPaymentIds={selectedPaymentIds}
                  onToggleSelect={toggleSelect}
                  onSelectAll={selectAllGroup}
                />
                <PaymentAccordion
                  title="Klinik"
                  items={paymentKlinik}
                  isOpen={expandedSections.Klinik}
                  onToggle={() => toggleSection("Klinik")}
                  icon={<HeartIcon className="w-5 h-5" />}
                  selectedPaymentIds={selectedPaymentIds}
                  onToggleSelect={toggleSelect}
                  onSelectAll={selectAllGroup}
                />
              </div>
            )}

            {/* 3. Active Queue */}
            <div className="glass-panel p-6 sm:p-8 rounded-4xl border-l-4 border-emerald-400">
              <h3 className="text-2xl font-black text-text-main mb-6 flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                Antrian Aktif
                <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-sm px-3 py-1 rounded-full">
                  {activeTickets.length}
                </span>
              </h3>
              <TicketList
                tickets={activeTickets}
                onEdit={setTicketToEdit}
                loading={loading}
              />
            </div>
          </div>
        </div>
      )}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDanger={confirmModal.isDanger}
      />
    </div>
  );
}
