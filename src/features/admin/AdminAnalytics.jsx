import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { getChartData } from "../../services/ticketService";
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ScissorsIcon,
  HeartIcon,
  CalendarDaysIcon,
  ChartBarIcon,
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

const AdminAnalytics = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
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
    const fetchData = async () => {
      setLoading(true);
      try {
        const rawData = await getChartData(filterType, selectedDate);

        let completed = 0;
        let cancelled = 0;
        let grooming = 0;
        let klinik = 0;

        rawData.forEach((ticket) => {
          if (ticket.status === "COMPLETED") completed++;
          if (ticket.status === "CANCELLED") cancelled++;
          if (ticket.layanan === "Grooming") grooming++;
          if (ticket.layanan === "Klinik") klinik++;
        });

        const slots = generateTimeSlots(filterType, selectedDate);
        const slotMap = new Map(slots.map((s) => [s.key, s]));

        rawData.forEach((ticket) => {
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
            if (ticket.status === "COMPLETED") slot.completed++;
            if (ticket.status === "CANCELLED") slot.cancelled++;
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
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterType, selectedDate]);

  // Create Gradients for Chart
  const createGradient = (ctx, area, colorStart, colorEnd) => {
    const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);
    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(1, colorEnd);
    return gradient;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-text-muted font-bold animate-pulse">
          Memuat Data Analitik...
        </p>
      </div>
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
          if (!chartArea) return "#22c55e";
          return createGradient(
            ctx,
            chartArea,
            "rgba(34, 197, 94, 0.6)",
            "rgba(34, 197, 94, 1)"
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
          if (!chartArea) return "#f59e0b";
          return createGradient(
            ctx,
            chartArea,
            "rgba(245, 158, 11, 0.6)",
            "rgba(245, 158, 11, 1)"
          );
        },
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: "Batal",
        data: dataCancelled,
        backgroundColor: function (context) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return "#f87171";
          return createGradient(
            ctx,
            chartArea,
            "rgba(248, 113, 113, 0.6)",
            "rgba(248, 113, 113, 1)"
          );
        },
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const isDark = theme === "dark";
  const textColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark
    ? "rgba(255, 255, 255, 0.05)"
    : "rgba(0, 0, 0, 0.05)";
  const tooltipBg = isDark
    ? "rgba(15, 23, 42, 0.9)"
    : "rgba(255, 255, 255, 0.9)";
  const tooltipText = isDark ? "#fff" : "#1e293b";

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
            size: 11,
            family: "'Inter', sans-serif",
            weight: "600",
          },
          color: textColor,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        cornerRadius: 12,
        padding: 16,
        titleFont: { size: 14, weight: "bold", family: "'Inter', sans-serif" },
        bodyFont: { size: 13, family: "'Inter', sans-serif" },
        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
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
          font: { size: 11, weight: "500", family: "'Inter', sans-serif" },
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
          font: { size: 10, family: "'Inter', sans-serif" },
          color: textColor,
          stepSize: 1,
          padding: 10,
        },
        border: { display: false },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
  };

  const doughnutData = {
    labels: ["Grooming", "Klinik"],
    datasets: [
      {
        data: [stats.groomingCount, stats.klinikCount],
        backgroundColor: ["#3b82f6", "#f59e0b"],
        hoverBackgroundColor: ["#2563eb", "#d97706"],
        borderWidth: 0,
        hoverOffset: 10,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "80%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        bodyColor: tooltipText,
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

  const summaryCards = [
    {
      title: "Total Tiket",
      value: stats.totalServices,
      icon: ClipboardDocumentListIcon,
      color: "blue",
      subtext: "Semua layanan tercatat",
    },
    {
      title: "Selesai",
      value: stats.completed,
      icon: CheckCircleIcon,
      color: "green",
      subtext: "Layanan rampung",
    },
    {
      title: "Dalam Proses",
      value: stats.totalServices - (stats.completed + stats.cancelled),
      icon: ClockIcon,
      color: "amber",
      subtext: "Sedang berjalan",
    },
    {
      title: "Dibatalkan",
      value: stats.cancelled,
      icon: XCircleIcon,
      color: "red",
      subtext: "Tidak dilanjutkan",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in py-4">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-main tracking-tight flex items-center gap-3">
            <span className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
              <ChartChartIcon className="w-8 h-8" />
            </span>
            Dashboard Analitik
          </h1>
          <p className="text-text-muted font-medium mt-2 text-lg max-w-2xl">
            Ringkasan performa & statistik operasional secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 bg-white dark:bg-slate-800/50 p-2 rounded-2xl shadow-sm border border-border-subtle items-center w-full xl:w-auto backdrop-blur-sm">
          <div className="relative group">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-bg-subtle border-transparent focus:border-indigo-500 focus:bg-bg-surface rounded-xl text-sm font-bold text-text-secondary outline-none transition-all cursor-pointer hover:bg-bg-muted"
            >
              <option value="day">Harian</option>
              <option value="week">Mingguan</option>
              <option value="month">Bulanan</option>
              <option value="year">Tahunan</option>
            </select>
            <CalendarDaysIcon className="w-5 h-5 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-indigo-500 transition-colors" />
          </div>

          <div className="h-8 w-px bg-border-subtle mx-1 hidden sm:block"></div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 bg-bg-subtle border-transparent focus:border-indigo-500 focus:bg-bg-surface rounded-xl text-sm font-bold text-text-secondary outline-none transition-all cursor-pointer hover:bg-bg-muted"
          />
        </div>
      </div>

      {/* 4-Column Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, idx) => (
          <div
            key={idx}
            className={`glass-panel p-6 rounded-4xl border border-white/40 dark:border-white/5 shadow-xl shadow-${card.color}-900/5 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group`}
          >
            {/* Background Blob */}
            <div
              className={`absolute -right-6 -top-6 w-24 h-24 bg-${card.color}-500/10 rounded-full blur-2xl group-hover:bg-${card.color}-500/20 transition-all duration-500`}
            ></div>

            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-bold text-text-muted uppercase tracking-wider mb-1">
                  {card.title}
                </p>
                <h3 className="text-4xl font-black text-text-main tracking-tight">
                  {card.value}
                </h3>
              </div>
              <div
                className={`p-3 rounded-2xl bg-${card.color}-100 dark:bg-${card.color}-500/20 text-${card.color}-600 dark:text-${card.color}-400 shadow-inner`}
              >
                <card.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2 py-1 rounded-lg bg-${card.color}-50 dark:bg-${card.color}-900/30 text-${card.color}-700 dark:text-${card.color}-300`}
              >
                +0%
              </span>
              <p className="text-xs text-text-muted font-medium">
                {card.subtext}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-[2.5rem] border border-white/40 dark:border-white/5 relative overflow-hidden">
          {/* Decor */}
          <div className="absolute top-0 right-0 w-full h-1 bg-linear-to-r from-transparent via-indigo-500/20 to-transparent"></div>

          <div className="mb-8 flex justify-between items-end">
            <div>
              <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-indigo-500" />
                Timeline Trafik
              </h3>
              <p className="text-sm text-text-muted mt-1 font-medium">
                Volume tiket berdasarkan{" "}
                {filterType === "day"
                  ? "jam"
                  : filterType === "week"
                  ? "hari"
                  : "bulan"}
              </p>
            </div>
          </div>

          <div className="h-96 w-full">
            {stats.chartData.length > 0 ? (
              <Bar ref={chartRef} data={barChartData} options={barOptions} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-text-muted opacity-50">
                <ClipboardDocumentListIcon className="w-16 h-16 mb-2" />
                <p>Belum ada data visual</p>
              </div>
            )}
          </div>
        </div>

        {/* Distribution Section */}
        <div className="glass-panel p-8 rounded-[2.5rem] border border-white/40 dark:border-white/5 flex flex-col items-center justify-between relative overflow-hidden">
          <div className="w-full text-left relative z-10 mb-4">
            <h3 className="text-xl font-bold text-text-main flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-indigo-500" />
              Sebaran Layanan
            </h3>
            <p className="text-sm text-text-muted mt-1 font-medium">
              Rasio Grooming vs Klinik
            </p>
          </div>

          <div className="relative w-full aspect-square max-h-64 mx-auto z-10 my-4">
            <Doughnut data={doughnutData} options={doughnutOptions} />
            {/* Center Text */}
            <div className="absolute inset-0 m-auto w-fit h-fit flex flex-col items-center justify-center pointer-events-none">
              <span className="text-5xl font-black text-text-main tracking-tight drop-shadow-sm">
                {stats.totalServices}
              </span>
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1 opacity-70">
                Total
              </span>
            </div>
          </div>

          <div className="w-full space-y-3 z-10 mt-auto">
            {/* Grooming Legend */}
            <div className="flex justify-between items-center p-4 bg-white/50 dark:bg-white/5 border border-white/10 rounded-2xl hover:bg-white/80 dark:hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                  <ScissorsIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-text-main block">
                    Grooming
                  </span>
                  <span className="text-xs text-text-muted">
                    {groomingPercent}% rasio
                  </span>
                </div>
              </div>
              <span className="font-black text-text-main text-lg">
                {stats.groomingCount}
              </span>
            </div>

            {/* Klinik Legend */}
            <div className="flex justify-between items-center p-4 bg-white/50 dark:bg-white/5 border border-white/10 rounded-2xl hover:bg-white/80 dark:hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
                  <HeartIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-text-main block">
                    Klinik
                  </span>
                  <span className="text-xs text-text-muted">
                    {klinikPercent}% rasio
                  </span>
                </div>
              </div>
              <span className="font-black text-text-main text-lg">
                {stats.klinikCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function ChartChartIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605"
      />
    </svg>
  );
}

function PieChartIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z"
      />
    </svg>
  );
}

export default AdminAnalytics;
