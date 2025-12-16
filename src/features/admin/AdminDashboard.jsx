import { useState } from "react";
import {
  ChevronDownIcon,
  ScissorsIcon,
  HeartIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
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
import ThemeToggle from "../../components/common/ThemeToggle";

const AccordionItem = ({
  title,
  count,
  icon,
  isOpen,
  onToggle,
  colorClass = "indigo",
  children,
  headerExtras,
}) => {
  return (
    <div
      className={`glass-panel mb-4 transition-all duration-300 rounded-3xl ${
        isOpen
          ? "shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20 ring-1 ring-primary-soft dark:ring-primary/20"
          : "hover:border-primary-soft dark:hover:border-primary/30"
      }`}
    >
      <div
        className="p-5 flex items-center justify-between cursor-pointer select-none bg-bg-surface hover:bg-bg-subtle/50 transition-colors rounded-3xl"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div
            className={`text-2xl w-10 h-10 flex items-center justify-center rounded-full transition-colors bg-${colorClass}-50 text-${colorClass}-600 dark:bg-${colorClass}-500/10 dark:text-${colorClass}-300`}
          >
            {icon}
          </div>
          <div>
            <h4 className="font-bold text-text-main text-base">{title}</h4>
            <p className="text-text-muted text-xs font-medium">{count} Tiket</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {headerExtras}
          <div
            className={`w-8 h-8 flex items-center justify-center rounded-full bg-bg-subtle text-text-muted transform transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <ChevronDownIcon className="h-5 w-5" />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="p-5 pt-0 animate-fade-in border-t border-bg-subtle">
          {children}
        </div>
      )}
    </div>
  );
};

const PaymentAccordion = ({
  title,
  items,
  isOpen,
  onToggle,
  icon,
  selectedPaymentIds,
  onToggleSelect,
  onSelectAll,
}) => {
  if (items.length === 0) return null;

  const allSelected = items.every((t) => selectedPaymentIds.has(t.id));
  const someSelected = items.some((t) => selectedPaymentIds.has(t.id));

  const headerCheckbox = (
    <div
      onClick={(e) => e.stopPropagation()}
      className="flex items-center bg-bg-muted px-3 py-1.5 rounded-lg"
    >
      <input
        type="checkbox"
        className="w-4 h-4 rounded border-border-main text-primary focus:ring-primary cursor-pointer mr-2"
        checked={allSelected}
        ref={(input) => {
          if (input) input.indeterminate = someSelected && !allSelected;
        }}
        onChange={(e) => onSelectAll(items, e.target.checked)}
      />
      <span className="text-xs font-bold text-text-secondary">All</span>
    </div>
  );

  return (
    <AccordionItem
      title={title}
      count={items.length}
      icon={icon}
      isOpen={isOpen}
      onToggle={onToggle}
      colorClass="indigo"
      headerExtras={headerCheckbox}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        {items.map((ticket) => (
          <div
            key={ticket.id}
            onClick={() => onToggleSelect(ticket.id)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 relative group ${
              selectedPaymentIds.has(ticket.id)
                ? "bg-primary-soft/30 border-primary-soft shadow-sm dark:bg-indigo-900/40 dark:border-indigo-500/30"
                : "bg-bg-surface/50 border-transparent hover:bg-bg-surface hover:border-primary-soft dark:hover:bg-white/5 dark:hover:border-white/10"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span
                className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                  ticket.layanan === SERVICE_TYPE.GROOMING
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                }`}
              >
                {ticket.layanan}
              </span>
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                checked={selectedPaymentIds.has(ticket.id)}
                onChange={() => onToggleSelect(ticket.id)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <h5 className="font-bold text-text-main text-sm mb-1 line-clamp-1">
              {ticket.nama}
            </h5>

            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span>
                {new Date(ticket.tanggalRilis).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
              {ticket.jam && <span>• {ticket.jam}</span>}
            </div>
          </div>
        ))}
      </div>
    </AccordionItem>
  );
};

const ValidationAccordion = ({
  title,
  items,
  isOpen,
  onToggle,
  icon,
  loading,
}) => {
  if (items.length === 0) return null;

  return (
    <AccordionItem
      title={title}
      count={items.length}
      icon={icon}
      isOpen={isOpen}
      onToggle={onToggle}
      colorClass="amber"
    >
      <div className="mt-4">
        <TicketList tickets={items} loading={loading} />
      </div>
    </AccordionItem>
  );
};

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

  const handleConfirmPayments = async (idsToConfirm) => {
    if (idsToConfirm.length === 0) return;
    if (!confirm(`Konfirmasi pembayaran untuk ${idsToConfirm.length} tiket?`))
      return;

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
  };

  const headerActions = (
    <div className="flex p-1 bg-bg-muted/50 backdrop-blur-sm rounded-2xl border border-border-subtle/20 dark:border-white/10">
      {["dashboard", "analytics", "users"].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all duration-300 ${
            activeTab === tab
              ? "bg-bg-surface text-primary shadow-md shadow-indigo-100 dark:shadow-none dark:bg-primary/20 dark:text-primary-soft"
              : "text-text-muted hover:text-text-main hover:bg-bg-surface/50 dark:hover:bg-white/5"
          }`}
        >
          {tab}
        </button>
      ))}
      <div className="ml-auto">
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
                        className="btn-primary py-2 px-4 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 text-sm"
                      >
                        Konfirmasi ({selectedPaymentIds.size})
                      </button>
                    )}
                    <button
                      onClick={() =>
                        handleConfirmPayments(paymentTickets.map((t) => t.id))
                      }
                      className="px-4 py-2 bg-white text-indigo-600 border border-indigo-100 dark:bg-white/5 dark:text-indigo-300 dark:border-white/10 text-sm font-bold rounded-xl hover:bg-indigo-50 dark:hover:bg-white/10 transition-all"
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
    </div>
  );
}
