import { useState, useEffect } from "react";
import { getChartData } from "../../services/ticketService";
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ScissorsIcon,
  HeartIcon,
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
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminAnalytics = () => {
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
    } else {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
        backgroundColor: "#22c55e",
        borderRadius: 4,
      },
      {
        label: "Dalam Proses",
        data: dataInProcess,
        backgroundColor: "#f59e0b",
        borderRadius: 4,
      },
      {
        label: "Batal",
        data: dataCancelled,
        backgroundColor: "#f87171",
        borderRadius: 4,
      },
    ],
  };

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
          font: {
            size: 11,
            family: "'Inter', sans-serif",
            weight: "bold",
          },
          color: "#6b7280",
        },
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#f3f4f6",
        bodyColor: "#f3f4f6",
        cornerRadius: 8,
        padding: 12,
        titleFont: { size: 13, weight: "bold" },
        bodyFont: { size: 12 },
        displayColors: true,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 10 },
          color: "#9ca3af",
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: "#f3f4f6",
          borderDash: [4, 4],
        },
        ticks: {
          font: { size: 10 },
          color: "#9ca3af",
          stepSize: 1,
        },
        border: {
          display: false,
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
  };

  const doughnutData = {
    labels: ["Grooming", "Klinik"],
    datasets: [
      {
        data: [stats.groomingCount, stats.klinikCount],
        backgroundColor: ["#3b82f6", "#f59e0b"],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1f2937",
        cornerRadius: 8,
        padding: 12,
      },
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

  return (
    <div className="space-y-8 animate-fade-in py-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            Dashboard Analytics
          </h1>
          <p className="text-gray-500 font-medium mt-2 text-lg">
            Ringkasan performa & statistik operasional
          </p>
        </div>

        <div className="flex flex-wrap gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-200/60 items-center justify-end w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-5 py-2.5 bg-gray-50 border-transparent focus:border-blue-500 focus:bg-white rounded-xl text-sm font-bold text-gray-700 outline-none transition-all cursor-pointer hover:bg-gray-100"
          >
            <option value="day">Harian</option>
            <option value="week">Mingguan</option>
            <option value="month">Bulanan</option>
          </select>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-5 py-2.5 bg-gray-50 border-transparent focus:border-blue-500 focus:bg-white rounded-xl text-sm font-bold text-gray-700 outline-none transition-all cursor-pointer hover:bg-gray-100"
          />
        </div>
      </div>

      {/* 4-Column Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 p-6 flex items-center gap-4 group hover:-translate-y-1 transition-transform duration-300">
          <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
            <ClipboardDocumentListIcon className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-semibold mb-1">
              Total Tiket
            </p>
            <h3 className="text-3xl font-black text-gray-800">
              {stats.totalServices}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 p-6 flex items-center gap-4 group hover:-translate-y-1 transition-transform duration-300">
          <div className="p-4 bg-green-50 rounded-2xl text-green-600 group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
            <CheckCircleIcon className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-semibold mb-1">Selesai</p>
            <h3 className="text-3xl font-black text-gray-800">
              {stats.completed}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 p-6 flex items-center gap-4 group hover:-translate-y-1 transition-transform duration-300">
          <div className="p-4 bg-amber-50 rounded-2xl text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
            <ClockIcon className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-semibold mb-1">
              Dalam Proses
            </p>
            <h3 className="text-3xl font-black text-gray-800">
              {stats.totalServices - (stats.completed + stats.cancelled)}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 p-6 flex items-center gap-4 group hover:-translate-y-1 transition-transform duration-300">
          <div className="p-4 bg-red-50 rounded-2xl text-red-600 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
            <XCircleIcon className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-semibold mb-1">
              Dibatalkan
            </p>
            <h3 className="text-3xl font-black text-gray-800">
              {stats.cancelled}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 p-8">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-800">Timeline Trafik</h3>
            <p className="text-sm text-gray-400 mt-1">
              Volume tiket berdasarkan waktu
            </p>
          </div>
          <div className="h-80 w-full">
            {stats.chartData.length > 0 ? (
              <Bar data={barChartData} options={barOptions} />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                Data tidak tersedia
              </div>
            )}
          </div>
        </div>

        {/* Distribution Section */}
        <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 p-8 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          <h3 className="text-xl font-bold text-gray-800 mb-8 w-full text-left relative z-10">
            Sebaran Layanan
          </h3>

          <div className="relative w-full aspect-square max-h-64 mx-auto mb-8 z-10">
            <Doughnut data={doughnutData} options={doughnutOptions} />
            {/* Center Text */}
            <div className="absolute inset-0 m-auto w-fit h-fit flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-gray-800 tracking-tighter">
                {stats.totalServices}
              </span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                Total
              </span>
            </div>
          </div>

          <div className="w-full space-y-4 z-10 mt-auto">
            {/* Grooming Legend */}
            <div className="flex justify-between items-center p-4 bg-white border border-blue-50 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <ScissorsIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-600 block">
                    Grooming
                  </span>
                  <span className="text-xs text-gray-400">
                    {groomingPercent}% dari total
                  </span>
                </div>
              </div>
              <span className="font-extrabold text-blue-600 text-lg">
                {stats.groomingCount}
              </span>
            </div>

            {/* Klinik Legend */}
            <div className="flex justify-between items-center p-4 bg-white border border-amber-50 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <HeartIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-600 block">
                    Klinik
                  </span>
                  <span className="text-xs text-gray-400">
                    {klinikPercent}% dari total
                  </span>
                </div>
              </div>
              <span className="font-extrabold text-amber-600 text-lg">
                {stats.klinikCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
