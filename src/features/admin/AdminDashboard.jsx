import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronDownIcon,
  ScissorsIcon,
  HeartIcon,
  ClockIcon,
  HomeIcon,
  ChartBarIcon,
  UserGroupIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import ConfirmationModal from "../../components/modals/ConfirmationModal";
import { createPortal } from "react-dom";
import TicketForm from "../../components/tickets/TicketForm";
import TicketList from "../../components/tickets/TicketList";
import LogList from "../../components/history/LogList";
import { useTickets } from "../../hooks/useTickets";
import { updateTicketStatus } from "../../services/ticketService";
import toast from "react-hot-toast";
import { TICKET_STATUS, SERVICE_TYPE } from "../../constants";
import AccordionItem from "../../components/common/AccordionItem";
import PaymentAccordion from "./PaymentAccordion";
import ValidationAccordion from "./ValidationAccordion";
import ThemeToggle from "../../components/common/ThemeToggle";

const AdminAnalytics = lazy(() => import("./AdminAnalytics"));
const UserManagement = lazy(() => import("./UserManagement"));
const tabLoading = <p role="status" className="rounded-2xl bg-bg-surface p-5 text-text-secondary">Memuat tampilan…</p>;

export default function AdminDashboard() {
  const { tickets, loading } = useTickets();
  const [ticketToEdit, setTicketToEdit] = useState(null);
  const [isTicketPanelOpen, setIsTicketPanelOpen] = useState(false);
  const [ticketFormDirty, setTicketFormDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const ticketPanelRef = useRef(null);
  const ticketTriggerRef = useRef(null);
  const ticketPanelFocusedRef = useRef(false);
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

  const openTicketPanel = (ticket = null) => {
    ticketTriggerRef.current = document.activeElement;
    setTicketToEdit(ticket);
    setTicketFormDirty(false);
    ticketPanelFocusedRef.current = false;
    setIsTicketPanelOpen(true);
  };

  const closeTicketPanel = useCallback(() => {
    setIsTicketPanelOpen(false);
    setTicketToEdit(null);
    setTicketFormDirty(false);
    setConfirmDiscard(false);
    requestAnimationFrame(() => ticketTriggerRef.current?.focus());
  }, []);

  const requestCloseTicketPanel = useCallback(() => {
    if (ticketPanelRef.current?.querySelector('form[aria-busy="true"]')) return;
    if (ticketFormDirty) setConfirmDiscard(true);
    else closeTicketPanel();
  }, [ticketFormDirty, closeTicketPanel]);

  useEffect(() => {
    if (!isTicketPanelOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = ticketPanelRef.current;
    if (!ticketPanelFocusedRef.current) {
      panel?.querySelector("#ticket-panel-title")?.focus();
      ticketPanelFocusedRef.current = true;
    }
    const handleKeyDown = (event) => {
      if (confirmDiscard) return;
      if (event.key === "Escape") requestCloseTicketPanel();
      if (event.key !== "Tab") return;
      const focusable = [...panel.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])')];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isTicketPanelOpen, confirmDiscard, requestCloseTicketPanel]);

  useEffect(() => {
    const viewport = window.visualViewport;
    const panel = ticketPanelRef.current;
    if (!isTicketPanelOpen || !viewport || !panel) return;

    const resizePanel = () => {
      panel.style.maxHeight = viewport.scale === 1 ? `${viewport.height}px` : "";
    };
    resizePanel();
    viewport.addEventListener("resize", resizePanel);
    return () => viewport.removeEventListener("resize", resizePanel);
  }, [isTicketPanelOpen]);

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
    <nav aria-label="Navigasi admin" className="grid grid-cols-[repeat(3,minmax(0,1fr))_auto] items-center gap-1 rounded-2xl bg-bg-subtle p-1 md:flex">
      {[
        { id: "dashboard", label: "Dashboard", icon: HomeIcon },
        { id: "analytics", label: "Analitik", icon: ChartBarIcon },
        { id: "users", label: "Pengguna", icon: UserGroupIcon },
      ].map((tab) => (
        <button
          key={tab.id}
          type="button"
          aria-current={activeTab === tab.id ? "page" : undefined}
          onClick={() => setActiveTab(tab.id)}
          className={`flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-xs font-bold transition-colors md:flex-row md:gap-2 md:px-3 md:text-sm ${
            activeTab === tab.id
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
              : "text-text-secondary hover:text-text-main hover:bg-white/50 dark:hover:bg-white/5"
          }`}
          title={tab.label}
        >
          <tab.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{tab.label}</span>
        </button>
      ))}
      <ThemeToggle className="grid h-11 w-11 place-items-center" />
    </nav>
  );

  return (
    <div className="space-y-8 pb-12">
      {document.getElementById("header-actions") &&
        createPortal(headerActions, document.getElementById("header-actions"))}

      {activeTab === "analytics" ? (
        <div className="space-y-8 animate-fade-in">
          <Suspense fallback={tabLoading}><AdminAnalytics tickets={tickets} /></Suspense>
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
          <Suspense fallback={tabLoading}><UserManagement /></Suspense>
        </div>
      ) : (
        <div className="w-full min-w-0 space-y-4 sm:space-y-6 animate-fade-in">
          <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-text-main">Dashboard Antrian</h1>
              <p className="text-sm text-text-secondary">Kelola tiket dan pembayaran pelanggan.</p>
            </div>
            <button type="button" onClick={() => openTicketPanel()} className="btn-primary min-h-11 flex w-full items-center justify-center gap-2 sm:w-auto">
              <PlusIcon className="h-5 w-5" aria-hidden="true" />Buat Tiket Baru
            </button>
          </div>
          <div className="min-w-0 space-y-5 sm:space-y-8">
            {pendingTickets.length > 0 && (
              <div className="glass-panel min-w-0 p-4 sm:p-8 rounded-3xl sm:rounded-4xl border-l-4 border-amber-400 bg-amber-50/10 dark:bg-amber-900/5">
                <h3 className="text-lg sm:text-2xl font-black text-text-main mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></span>
                  Konfirmasi Kehadiran
                  <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-sm px-3 py-1 rounded-full">
                    {pendingTickets.length}
                  </span>
                </h3>

                <div className="grid items-start gap-3 xl:grid-cols-2">
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
              </div>
            )}

            {paymentTickets.length > 0 && (
              <div className="glass-panel min-w-0 p-4 sm:p-8 rounded-3xl sm:rounded-4xl border-l-4 border-indigo-400 bg-indigo-50/10 dark:bg-indigo-900/5">
                <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                  <h3 className="text-lg sm:text-2xl font-black text-text-main flex min-w-0 items-center gap-2 sm:gap-3">
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

                <div className="grid items-start gap-3 xl:grid-cols-2">
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
              </div>
            )}

            <div className="glass-panel min-w-0 p-4 sm:p-8 rounded-3xl sm:rounded-4xl border-l-4 border-emerald-400">
              <h3 className="text-lg sm:text-2xl font-black text-text-main mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                Antrian Aktif
                <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-sm px-3 py-1 rounded-full">
                  {activeTickets.length}
                </span>
              </h3>
              <TicketList
                tickets={activeTickets}
                gridClassName="sm:grid-cols-2 xl:grid-cols-3"
                onEdit={openTicketPanel}
                loading={loading}
              />
            </div>
          </div>
        </div>
      )}
      {isTicketPanelOpen && createPortal(
        <div className="fixed inset-0 z-[9998] flex justify-end bg-slate-950/50" onMouseDown={(event) => { if (event.target === event.currentTarget) requestCloseTicketPanel(); }}>
          <aside ref={ticketPanelRef} role="dialog" aria-modal="true" aria-labelledby="ticket-panel-title" className="flex h-dvh max-h-full w-full min-w-0 max-w-[640px] flex-col bg-bg-surface shadow-2xl">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border-subtle px-5 py-4 sm:px-8">
              <div>
                <h2 id="ticket-panel-title" tabIndex={-1} className="text-xl font-black text-text-main">{ticketToEdit ? "Edit Tiket" : "Buat Tiket Baru"}</h2>
                <p className="text-sm text-text-secondary">Lengkapi data pelanggan dan jadwal layanan.</p>
              </div>
              <button type="button" onClick={requestCloseTicketPanel} aria-label="Tutup panel tiket" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-text-secondary hover:bg-bg-subtle focus-visible:outline-2 focus-visible:outline-primary">
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <TicketForm
              key={ticketToEdit?.id || "new"}
              inAdminPanel
              ticketToEdit={ticketToEdit}
              onDraftChange={() => setTicketFormDirty(true)}
              onCancel={requestCloseTicketPanel}
              onSuccess={closeTicketPanel}
              className="min-h-0 w-full flex-1"
            />
          </aside>
        </div>, document.body
      )}
      <ConfirmationModal isOpen={confirmDiscard} onClose={() => setConfirmDiscard(false)} onConfirm={closeTicketPanel} title="Buang perubahan?" message="Perubahan tiket yang belum disimpan akan hilang." confirmText="Ya, Tutup" isDanger />
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
