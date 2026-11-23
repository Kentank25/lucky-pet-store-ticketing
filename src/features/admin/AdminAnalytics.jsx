import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ScissorsIcon,
  HeartIcon,
  ChartBarIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/24/outline";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { TICKET_STATUS, SERVICE_TYPE } from "../../constants";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const PERIOD_OPTIONS = [
  { value: "day", label: "Hari" },
  { value: "week", label: "Minggu" },
  { value: "month", label: "Bulan" },
  { value: "year", label: "Tahun" },
];

const AdminAnalytics = ({ tickets = [] }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("day");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [stats, setStats] = useState({
    completed: 0,
    cancelled: 0,
    groomingCount: 0,
    klinikCount: 0,
    totalServices: 0,
    chartData: [],
  });

  const chartRef = useRef(null);

  const generateTimeSlots = (type, dateStr) => {
    const slots = [];
    const date = new Date(dateStr);

    if (type === "day") {
      for (let i = 9; i <= 20; i++) {
        const hour = i.toString().padStart(2, "0") + ":00";
        slots.push({
          key: hour,
          label: hour,
          completed: 0,
          cancelled: 0,
          total: 0,
        });
      }
      return slots;
    } else if (type === "week") {
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(date);
      monday.setDate(diff);

      for (let i = 0; i < 7; i++) {
        const current = new Date(monday);
        current.setDate(monday.getDate() + i);

        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, "0");
        const d = String(current.getDate()).padStart(2, "0");
        const key = `${year}-${month}-${d}`;

        const label = current.toLocaleDateString("id-ID", {
          weekday: "short",
          day: "numeric",
        });
        slots.push({ key, label, completed: 0, cancelled: 0, total: 0 });
      }
      return slots;
    } else if (type === "month") {
      const year = date.getFullYear();
      const month = date.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let i = 1; i <= daysInMonth; i++) {
        const d = String(i).padStart(2, "0");
        const m = String(month + 1).padStart(2, "0");
        const key = `${year}-${m}-${d}`;
        const label = `${i}`;
        slots.push({ key, label, completed: 0, cancelled: 0, total: 0 });
      }
      return slots;
    } else {
      const year = date.getFullYear();
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ];

      for (let i = 0; i < 12; i++) {
        const m = String(i + 1).padStart(2, "0");
        const key = `${year}-${m}`;
        const label = monthNames[i];
        slots.push({ key, label, completed: 0, cancelled: 0, total: 0 });
      }
      return slots;
    }
  };

  useEffect(() => {
    const processData = () => {
      setLoading(true);
      try {
        const filteredTickets = tickets.filter((ticket) => {
          if (!ticket.tanggalRilis) return false;

          if (filterType === "day") {
            return ticket.tanggalRilis === selectedDate;
          } else if (filterType === "week") {
            const d = new Date(selectedDate);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1);
            const monday = new Date(d);
            monday.setDate(diff);
            monday.setHours(0, 0, 0, 0);

            const nextMonday = new Date(monday);
            nextMonday.setDate(monday.getDate() + 7);

            const tDate = new Date(ticket.tanggalRilis);
            return tDate >= monday && tDate < nextMonday;
          } else if (filterType === "month") {
            return ticket.tanggalRilis.startsWith(selectedDate.substring(0, 7));
          } else if (filterType === "year") {
            return ticket.tanggalRilis.startsWith(selectedDate.substring(0, 4));
          }
          return false;
        });

        let completed = 0;
        let cancelled = 0;
        let grooming = 0;
        let klinik = 0;

        filteredTickets.forEach((ticket) => {
          if (ticket.status === TICKET_STATUS.COMPLETED) completed++;
          if (ticket.status === TICKET_STATUS.CANCELLED) cancelled++;
          if (ticket.layanan === SERVICE_TYPE.GROOMING) grooming++;
          if (ticket.layanan === SERVICE_TYPE.KLINIK) klinik++;
        });

        const slots = generateTimeSlots(filterType, selectedDate);
        const slotMap = new Map(slots.map((s) => [s.key, s]));

        filteredTickets.forEach((ticket) => {
          let key = null;
          if (filterType === "day") {
            if (ticket.jam) {
              const hour = ticket.jam.split(":")[0] + ":00";
              key = hour;
            }
          } else if (filterType === "year") {
            if (ticket.tanggalRilis) {
              key = ticket.tanggalRilis.substring(0, 7);
            }
          } else {
            key = ticket.tanggalRilis;
          }

          if (key && slotMap.has(key)) {
            const slot = slotMap.get(key);
            slot.total++;
            if (ticket.status === TICKET_STATUS.COMPLETED) slot.completed++;
            if (ticket.status === TICKET_STATUS.CANCELLED) slot.cancelled++;
          }
        });

        setStats({
          completed,
          cancelled,
          groomingCount: grooming,
          klinikCount: klinik,
          totalServices: grooming + klinik,
          chartData: slots,
        });
      } catch (error) {
        console.error("Error processing analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    processData();
  }, [filterType, selectedDate, tickets]);

  const createGradient = (ctx, area, colorStart, colorEnd) => {
    const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);
    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(1, colorEnd);
    return gradient;
  };

  if (loading) {
    return (
      <Card padding="lg" className="flex h-96 flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-border-subtle border-t-primary" />
        <p className="text-sm font-semibold text-text-secondary">
          Memuat Data Analitik...
        </p>
      </Card>
    );
  }

  const barLabels = stats.chartData.map((d) => d.label);
  const dataCompleted = stats.chartData.map((d) => d.completed);
  const dataCancelled = stats.chartData.map((d) => d.cancelled);
  const dataInProcess = stats.chartData.map(
    (d) => d.total - d.completed - d.cancelled
  );

  const barChartData = {
    labels: barLabels,
    datasets: [
      {
        label: "Selesai",
        data: dataCompleted,
        backgroundColor: function (context) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return "#10B981";
          return createGradient(
            ctx,
            chartArea,
            "rgba(16, 185, 129, 0.7)",
            "rgba(16, 185, 129, 1)"
          );
        },
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: "Dalam Proses",
        data: dataInProcess,
        backgroundColor: function (context) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return "#0D9488";
          return createGradient(
            ctx,
            chartArea,
            "rgba(13, 148, 136, 0.7)",
            "rgba(13, 148, 136, 1)"
          );
        },
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: "Dibatalkan",
        data: dataCancelled,
        backgroundColor: function (context) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return "#E11D48";
          return createGradient(
            ctx,
            chartArea,
            "rgba(225, 29, 72, 0.7)",
            "rgba(225, 29, 72, 1)"
          );
        },
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const isDark = theme === "dark";
  const textColor = isDark ? "#CBD5E1" : "#475569";
  const gridColor = isDark
    ? "rgba(148, 163, 184, 0.14)"
    : "rgba(15, 23, 42, 0.08)";
  const tooltipBg = isDark ? "#111827" : "#FFFFFF";
  const tooltipText = isDark ? "#F8FAFC" : "#0F172A";
  const tooltipBorder = isDark ? "#334155" : "#E2E8F0";

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          useBorderRadius: true,
          borderRadius: 4,
          font: {
            size: 12,
            family: "'Nunito Sans', sans-serif",
            weight: "600",
          },
          color: textColor,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        cornerRadius: 12,
        padding: 14,
        titleFont: {
          size: 13,
          weight: "bold",
          family: "'Plus Jakarta Sans', sans-serif",
        },
        bodyFont: { size: 12, family: "'Nunito Sans', sans-serif" },
        borderColor: tooltipBorder,
        borderWidth: 1,
        displayColors: true,
        usePointStyle: true,
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + " Tiket";
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: {
          font: { size: 11, weight: "600", family: "'Nunito Sans', sans-serif" },
          color: textColor,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: gridColor,
          borderDash: [4, 4],
          drawBorder: false,
        },
        ticks: {
          font: { size: 11, family: "'Nunito Sans', sans-serif" },
          color: textColor,
          stepSize: 1,
          padding: 8,
        },
        border: { display: false },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    animation: {
      duration: 600,
      easing: "easeOutQuart",
    },
  };

  const doughnutData = {
    labels: ["Grooming", "Klinik"],
    datasets: [
      {
        data: [stats.groomingCount, stats.klinikCount],
        backgroundColor: ["#EA580C", "#0D9488"],
        hoverBackgroundColor: ["#C2410C", "#0F766E"],
        borderColor: isDark ? "#111827" : "#FFFFFF",
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "78%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        borderColor: tooltipBorder,
        borderWidth: 1,
        cornerRadius: 10,
        padding: 12,
        callbacks: {
          label: function (context) {
            return ` ${context.label}: ${context.raw} Tiket`;
          },
        },
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
    },
  };

  const groomingPercent =
    stats.totalServices > 0
      ? ((stats.groomingCount / stats.totalServices) * 100).toFixed(0)
      : 0;
  const klinikPercent =
    stats.totalServices > 0
      ? ((stats.klinikCount / stats.totalServices) * 100).toFixed(0)
      : 0;

  const inProcessCount = stats.totalServices - (stats.completed + stats.cancelled);

  const summaryCards = [
    {
      title: "Total Tiket",
      value: stats.totalServices,
      icon: ClipboardDocumentListIcon,
      iconClass:
        "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
      badgeVariant: "waiting",
      subtext: "Semua layanan tercatat",
    },
    {
      title: "Selesai",
      value: stats.completed,
      icon: CheckCircleIcon,
      iconClass:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
      badgeVariant: "completed",
      subtext: "Layanan rampung",
    },
    {
      title: "Dalam Proses",
      value: inProcessCount,
      icon: ClockIcon,
      iconClass:
        "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300",
      badgeVariant: "active",
      subtext: "Sedang berjalan",
    },
    {
      title: "Dibatalkan",
      value: stats.cancelled,
      icon: XCircleIcon,
      iconClass:
        "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
      badgeVariant: "cancelled",
      subtext: "Tidak dilanjutkan",
    },
  ];

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h1 className="flex items-center gap-3 font-heading text-xl font-bold tracking-tight text-text-main sm:text-2xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <PresentationChartLineIcon className="h-6 w-6" aria-hidden="true" />
            </span>
            Dashboard Analitik
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-text-secondary sm:text-base">
            Ringkasan performa & statistik operasional secara real-time.
          </p>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-2 rounded-2xl border border-border-subtle bg-bg-surface p-2 shadow-xs sm:w-auto sm:flex-row sm:items-center">
          <div
            role="group"
            aria-label="Periode analitik"
            className="grid grid-cols-4 gap-1 rounded-xl bg-bg-subtle p-1"
          >
            {PERIOD_OPTIONS.map((opt) => {
              const isSelected = filterType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setFilterType(opt.value)}
                  className={`min-h-10 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-sm ${
                    isSelected
                      ? "bg-primary text-white shadow-xs"
                      : "text-text-secondary hover:bg-bg-surface hover:text-text-main"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <input
            type="date"
            aria-label="Tanggal analitik"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="min-h-11 w-full min-w-0 cursor-pointer rounded-xl border border-border-subtle bg-bg-subtle px-3.5 py-2 text-sm font-semibold tabular-nums text-text-main hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:w-auto"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title} padding="md" className="flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  {card.title}
                </p>
                <h3 className="mt-1 font-heading text-3xl font-bold tabular-nums tracking-tight text-text-main">
                  {card.value}
                </h3>
              </div>
              <div
                aria-hidden="true"
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconClass}`}
              >
                <card.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant={card.badgeVariant}>{card.subtext}</Badge>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card padding="lg" className="lg:col-span-2">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-text-main sm:text-xl">
                <ChartBarIcon className="h-5 w-5 text-primary" aria-hidden="true" />
                Timeline Trafik
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                Volume tiket berdasarkan{" "}
                {filterType === "day"
                  ? "jam"
                  : filterType === "week"
                  ? "hari"
                  : filterType === "month"
                  ? "tanggal"
                  : "bulan"}
              </p>
            </div>
          </div>

          <div className="h-80 w-full sm:h-96">
            {stats.chartData.length > 0 ? (
              <Bar ref={chartRef} data={barChartData} options={barOptions} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-text-muted">
                <ClipboardDocumentListIcon className="mb-2 h-14 w-14 opacity-50" aria-hidden="true" />
                <p className="text-sm font-medium">Belum ada data visual</p>
              </div>
            )}
          </div>
        </Card>

        <Card padding="lg" className="flex flex-col items-center justify-between">
          <div className="mb-4 w-full text-left">
            <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-text-main sm:text-xl">
              <ChartPieIcon className="h-5 w-5 text-primary" aria-hidden="true" />
              Sebaran Layanan
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              Rasio Grooming vs Klinik
            </p>
          </div>

          <div className="relative mx-auto my-4 aspect-square w-full max-h-60">
            <Doughnut data={doughnutData} options={doughnutOptions} />

            <div className="pointer-events-none absolute inset-0 m-auto flex h-fit w-fit flex-col items-center justify-center">
              <span className="font-heading text-4xl font-bold tabular-nums tracking-tight text-text-main">
                {stats.totalServices}
              </span>
              <span className="mt-1 text-xs font-bold uppercase tracking-widest text-text-muted">
                Total
              </span>
            </div>
          </div>

          <div className="mt-auto w-full space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-bg-subtle/60 p-3.5">
              <div className="flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300"
                >
                  <ScissorsIcon className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-text-main">
                    Grooming
                  </span>
                  <span className="text-xs font-medium tabular-nums text-text-secondary">
                    {groomingPercent}% rasio
                  </span>
                </div>
              </div>
              <Badge variant="grooming" className="text-sm font-bold tabular-nums">
                {stats.groomingCount}
              </Badge>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-bg-subtle/60 p-3.5">
              <div className="flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300"
                >
                  <HeartIcon className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-text-main">
                    Klinik
                  </span>
                  <span className="text-xs font-medium tabular-nums text-text-secondary">
                    {klinikPercent}% rasio
                  </span>
                </div>
              </div>
              <Badge variant="klinik" className="text-sm font-bold tabular-nums">
                {stats.klinikCount}
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
