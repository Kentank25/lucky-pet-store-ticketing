import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import {
  ScissorsIcon,
  HeartIcon,
  ClockIcon,
  HomeIcon,
  ChartBarIcon,
  UserGroupIcon,
  PlusIcon,
  XMarkIcon,
  TvIcon,
  ComputerDesktopIcon,
  ArrowTopRightOnSquareIcon,
  BanknotesIcon,
  ClipboardDocumentCheckIcon,
  PlayCircleIcon,
  QueueListIcon,
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
import PaymentAccordion from "./PaymentAccordion";
import ValidationAccordion from "./ValidationAccordion";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";

const AdminAnalytics = lazy(() => import("./AdminAnalytics"));
const UserManagement = lazy(() => import("./UserManagement"));
const tabLoading = (
  <Card padding="md" role="status" className="text-sm font-medium text-text-secondary">
    Memuat tampilan…
  </Card>
);

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: HomeIcon },
  { id: "analytics", label: "Analitik", icon: ChartBarIcon },
  { id: "users", label: "Pengguna", icon: UserGroupIcon },
];

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
      const focusable = [
        ...panel.querySelectorAll(
          "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])"
        ),
      ];
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
  const inProgressTickets = tickets.filter(
    (t) => t.status === TICKET_STATUS.ACTIVE
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

  const kpiCards = [
    {
      label: "Menunggu Validasi",
      value: pendingTickets.length,
      icon: ClipboardDocumentCheckIcon,
      badgeVariant: "pending",
      iconClass:
        "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
    },
    {
      label: "Antrean Berjalan",
      value: inProgressTickets.length,
      icon: PlayCircleIcon,
      badgeVariant: "active",
      iconClass:
        "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300",
    },
    {
      label: "Menunggu Pembayaran",
      value: paymentTickets.length,
      icon: BanknotesIcon,
      badgeVariant: "payment",
      iconClass:
        "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300",
    },
    {
      label: "Total Aktif/Waiting",
      value: activeTickets.length,
      icon: QueueListIcon,
      badgeVariant: "waiting",
      iconClass:
        "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
    },
  ];

  return (
    <div className="pb-12">
      {/* Mobile (< lg) Compact Horizontal Navigation Bar */}
      <div className="mb-4 flex items-center justify-between gap-2 lg:hidden">
        <nav
          aria-label="Navigasi admin"
          className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto rounded-2xl border border-border-subtle bg-bg-surface p-1 shadow-xs"
        >
          {NAV_ITEMS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive
                    ? "bg-primary text-white shadow-xs"
                    : "text-text-secondary hover:bg-bg-subtle hover:text-text-main"
                }`}
              >
                <tab.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{tab.label}</span>
                {tab.id === "dashboard" &&
                  (pendingTickets.length > 0 || paymentTickets.length > 0) && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-bg-subtle text-text-main"
                      }`}
                    >
                      {pendingTickets.length + paymentTickets.length}
                    </span>
                  )}
              </button>
            );
          })}
        </nav>

        <Button
          variant="primary"
          size="sm"
          onClick={() => openTicketPanel()}
          className="shrink-0"
        >
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          <span>Tiket</span>
        </Button>
      </div>

      {/* Desktop 2-Column Layout */}
      <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-6">
        {/* Desktop Sticky Sidebar */}
        <aside className="hidden lg:sticky lg:top-20 lg:flex lg:flex-col lg:gap-4 lg:self-start">
          <Card padding="sm" className="space-y-4">
            <Button
              variant="primary"
              size="md"
              onClick={() => openTicketPanel()}
              className="w-full"
            >
              <PlusIcon className="h-5 w-5" aria-hidden="true" />
              <span>Buat Tiket</span>
            </Button>

            <nav aria-label="Navigasi admin desktop" className="space-y-1">
              {NAV_ITEMS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isActive
                        ? "bg-primary-soft text-primary dark:text-teal-300"
                        : "text-text-secondary hover:bg-bg-subtle hover:text-text-main"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <tab.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      <span>{tab.label}</span>
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="space-y-2 border-t border-border-subtle pt-3">
              <p className="px-1 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Status Antrean
              </p>
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-medium text-text-secondary">
                  PENDING
                </span>
                <Badge variant="pending" dot className="tabular-nums">
                  {pendingTickets.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-medium text-text-secondary">
                  PAYMENT
                </span>
                <Badge variant="payment" dot className="tabular-nums">
                  {paymentTickets.length}
                </Badge>
              </div>
            </div>

            <div className="space-y-1 border-t border-border-subtle pt-3">
              <p className="px-1 pb-1 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Tautan Cepat
              </p>
              <a
                href="/display"
                target="_blank"
                rel="noreferrer"
                className="flex min-h-10 items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="flex items-center gap-2">
                  <TvIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Display Antrean</span>
                </span>
                <ArrowTopRightOnSquareIcon
                  className="h-3.5 w-3.5 text-text-muted"
                  aria-hidden="true"
                />
              </a>
              <a
                href="/kiosk"
                target="_blank"
                rel="noreferrer"
                className="flex min-h-10 items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="flex items-center gap-2">
                  <ComputerDesktopIcon
                    className="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>Kiosk Mandiri</span>
                </span>
                <ArrowTopRightOnSquareIcon
                  className="h-3.5 w-3.5 text-text-muted"
                  aria-hidden="true"
                />
              </a>
            </div>
          </Card>
        </aside>

        {/* Main Content Column */}
        <div className="min-w-0">
          {activeTab === "analytics" ? (
            <div className="space-y-6 animate-fade-in">
              <Suspense fallback={tabLoading}>
                <AdminAnalytics tickets={tickets} />
              </Suspense>
              <Card padding="lg">
                <h3 className="mb-4 flex items-center gap-2.5 font-heading text-xl font-bold text-text-main">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <ClockIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  Riwayat Aktivitas
                </h3>
                <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  <LogList />
                </div>
              </Card>
            </div>
          ) : activeTab === "users" ? (
            <div className="animate-fade-in">
              <Suspense fallback={tabLoading}>
                <UserManagement />
              </Suspense>
            </div>
          ) : (
            <div className="w-full min-w-0 space-y-6 animate-fade-in">
              <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <h1 className="font-heading text-xl font-bold text-text-main sm:text-2xl">
                    Dashboard Antrian
                  </h1>
                  <p className="text-sm text-text-secondary">
                    Kelola tiket, validasi kedatangan, dan pembayaran pelanggan.
                  </p>
                </div>
              </div>

              {/* 4-Card KPI Bar */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                {kpiCards.map((kpi) => (
                  <Card key={kpi.label} padding="sm" className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-text-secondary">
                        {kpi.label}
                      </p>
                      <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-text-main sm:text-3xl">
                        {kpi.value}
                      </p>
                    </div>
                    <div
                      aria-hidden="true"
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${kpi.iconClass}`}
                    >
                      <kpi.icon className="h-5 w-5" />
                    </div>
                  </Card>
                ))}
              </div>

              <div className="min-w-0 space-y-6">
                {pendingTickets.length > 0 && (
                  <Card padding="md" className="min-w-0 border-l-4 border-l-amber-500">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <h2 className="flex items-center gap-2.5 font-heading text-lg font-bold text-text-main sm:text-xl">
                        <span>Konfirmasi Kehadiran</span>
                        <Badge variant="pending" dot className="tabular-nums">
                          {pendingTickets.length} Menunggu
                        </Badge>
                      </h2>
                    </div>

                    <div className="grid items-start gap-3 xl:grid-cols-2">
                      <ValidationAccordion
                        title="Grooming"
                        items={pendingGrooming}
                        isOpen={expandedValidationSections.Grooming}
                        onToggle={() => toggleValidationSection("Grooming")}
                        icon={<ScissorsIcon className="h-5 w-5" />}
                        loading={loading}
                      />
                      <ValidationAccordion
                        title="Klinik"
                        items={pendingKlinik}
                        isOpen={expandedValidationSections.Klinik}
                        onToggle={() => toggleValidationSection("Klinik")}
                        icon={<HeartIcon className="h-5 w-5" />}
                        loading={loading}
                      />
                    </div>
                  </Card>
                )}

                {paymentTickets.length > 0 && (
                  <Card padding="md" className="min-w-0 border-l-4 border-l-purple-500">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                      <h2 className="flex min-w-0 items-center gap-2.5 font-heading text-lg font-bold text-text-main sm:text-xl">
                        <span>Menunggu Pembayaran</span>
                        <Badge variant="payment" dot className="tabular-nums">
                          {paymentTickets.length} Tiket
                        </Badge>
                      </h2>

                      <div className="flex flex-wrap items-center gap-2">
                        {selectedPaymentIds.size > 0 && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              handleConfirmPayments(
                                Array.from(selectedPaymentIds)
                              )
                            }
                            className="tabular-nums"
                          >
                            Konfirmasi ({selectedPaymentIds.size})
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            handleConfirmPayments(
                              paymentTickets.map((t) => t.id)
                            )
                          }
                        >
                          Konfirmasi Semua
                        </Button>
                      </div>
                    </div>

                    <div className="grid items-start gap-3 xl:grid-cols-2">
                      <PaymentAccordion
                        title="Grooming"
                        items={paymentGrooming}
                        isOpen={expandedSections.Grooming}
                        onToggle={() => toggleSection("Grooming")}
                        icon={<ScissorsIcon className="h-5 w-5" />}
                        selectedPaymentIds={selectedPaymentIds}
                        onToggleSelect={toggleSelect}
                        onSelectAll={selectAllGroup}
                        loading={loading}
                      />
                      <PaymentAccordion
                        title="Klinik"
                        items={paymentKlinik}
                        isOpen={expandedSections.Klinik}
                        onToggle={() => toggleSection("Klinik")}
                        icon={<HeartIcon className="h-5 w-5" />}
                        selectedPaymentIds={selectedPaymentIds}
                        onToggleSelect={toggleSelect}
                        onSelectAll={selectAllGroup}
                        loading={loading}
                      />
                    </div>
                  </Card>
                )}

                <Card padding="md" className="min-w-0 border-l-4 border-l-[#0D9488]">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="flex items-center gap-2.5 font-heading text-lg font-bold text-text-main sm:text-xl">
                      <span>Antrian Aktif</span>
                      <Badge variant="active" dot className="tabular-nums">
                        {activeTickets.length}
                      </Badge>
                    </h2>
                  </div>
                  <TicketList
                    tickets={activeTickets}
                    gridClassName="sm:grid-cols-2 xl:grid-cols-3"
                    onEdit={openTicketPanel}
                    loading={loading}
                  />
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Ticket Panel */}
      {isTicketPanelOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9998] flex justify-end bg-slate-950/50 backdrop-blur-[2px]"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget)
                requestCloseTicketPanel();
            }}
          >
            <aside
              ref={ticketPanelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="ticket-panel-title"
              className="flex h-dvh max-h-full w-full min-w-0 max-w-[640px] flex-col border-l border-border-subtle bg-bg-surface shadow-2xl"
            >
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border-subtle bg-bg-surface px-5 py-4 sm:px-8">
                <div>
                  <h2
                    id="ticket-panel-title"
                    tabIndex={-1}
                    className="font-heading text-xl font-bold text-text-main focus:outline-none"
                  >
                    {ticketToEdit ? "Edit Tiket" : "Buat Tiket Baru"}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Lengkapi data pelanggan dan jadwal layanan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={requestCloseTicketPanel}
                  aria-label="Tutup panel tiket"
                  className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-bg-subtle hover:text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
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
          </div>,
          document.body
        )}

      <ConfirmationModal
        isOpen={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
        onConfirm={closeTicketPanel}
        title="Buang perubahan?"
        message="Perubahan tiket yang belum disimpan akan hilang."
        confirmText="Ya, Tutup"
        isDanger
      />
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
