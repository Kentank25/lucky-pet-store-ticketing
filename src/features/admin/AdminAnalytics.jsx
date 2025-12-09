import React, { useState, useEffect } from "react";
import { getAnalyticsStats, getChartData } from "../../services/ticketService";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("day"); // 'day', 'week', 'month'
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  ); // Default today
  const [stats, setStats] = useState({
    completed: 0,
    cancelled: 0,
    groomingCount: 0,
    klinikCount: 0,
    totalServices: 0,
    sortedChartData: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getChartData(filterType, selectedDate);

        let completed = 0;
        let cancelled = 0;
        let grooming = 0;
        let klinik = 0;
        const chartData = {};

        data.forEach((ticket) => {
          if (ticket.status === "COMPLETED") completed++;
          if (ticket.status === "CANCELLED") cancelled++;
          if (ticket.layanan === "Grooming") grooming++;
          if (ticket.layanan === "Klinik") klinik++;

          if (ticket.tanggalRilis) {
            const dateKey = ticket.tanggalRilis;
            const dateLabel = new Date(ticket.tanggalRilis).toLocaleDateString(
              "id-ID",
              { day: "numeric", month: "short" }
            );

            if (!chartData[dateKey]) {
              chartData[dateKey] = {
                key: dateKey,
                label: dateLabel,
                completed: 0,
                cancelled: 0,
                total: 0,
              };
            }
            if (ticket.status === "COMPLETED") chartData[dateKey].completed++;
            if (ticket.status === "CANCELLED") chartData[dateKey].cancelled++;
            chartData[dateKey].total++;
          }
        });

        const sortedChartData = Object.values(chartData).sort((a, b) =>
          a.key.localeCompare(b.key)
        );

        setStats({
          completed,
          cancelled,
          groomingCount: grooming,
          klinikCount: klinik,
          totalServices: grooming + klinik,
          sortedChartData,
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

  const groomingPercent =
    stats.totalServices > 0
      ? (stats.groomingCount / stats.totalServices) * 100
      : 0;
  const klinikPercent =
    stats.totalServices > 0
      ? (stats.klinikCount / stats.totalServices) * 100
      : 0;

  return (
    <div className="space-y-6 animate-fade-in py-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Dashboard Analytics
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Pantau performa layanan & statistik Pet Shop
          </p>
        </div>

        <div className="flex flex-wrap gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 items-center justify-end w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border-transparent focus:border-blue-500 focus:bg-white rounded-xl text-sm font-bold text-gray-700 outline-none transition-all cursor-pointer hover:bg-gray-100"
          >
            <option value="day">Harian</option>
            <option value="week">Mingguan</option>
            <option value="month">Bulanan</option>
          </select>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border-transparent focus:border-blue-500 focus:bg-white rounded-xl text-sm font-bold text-gray-700 outline-none transition-all cursor-pointer hover:bg-gray-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
          <div className="p-4 bg-green-50 rounded-2xl text-green-600">
            <CheckCircleIcon className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tiket Selesai</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {stats.completed}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
          <div className="p-4 bg-red-50 rounded-2xl text-red-600">
            <XCircleIcon className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Tiket Dibatalkan
            </p>
            <h3 className="text-2xl font-bold text-gray-800">
              {stats.cancelled}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-lg font-bold text-gray-800">Performa Tiket</h3>
          </div>

          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {stats.sortedChartData.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                Belum ada data untuk periode ini.
              </p>
            ) : (
              stats.sortedChartData.map((item) => (
                <div key={item.key} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium text-gray-600">
                    <span>{item.label}</span>
                    <span>{item.total} Tiket</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-green-500 h-full transition-all duration-500"
                      style={{
                        width: `${
                          item.total > 0
                            ? (item.completed / item.total) * 100
                            : 0
                        }%`,
                      }}
                      title={`Selesai: ${item.completed}`}
                    ></div>
                    <div
                      className="bg-red-400 h-full transition-all duration-500"
                      style={{
                        width: `${
                          item.total > 0
                            ? (item.cancelled / item.total) * 100
                            : 0
                        }%`,
                      }}
                      title={`Batal: ${item.cancelled}`}
                    ></div>
                  </div>
                  <div className="flex justify-end gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Selesai ({item.completed})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-400"></div>
                      <span>Batal ({item.cancelled})</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold text-gray-800 mb-6 w-full text-left">
            Distribusi Layanan
          </h3>

          <div className="relative w-48 h-48 mb-6">
            <div
              className="w-full h-full rounded-full"
              style={{
                background: `conic-gradient(
                  #3B82F6 0% ${groomingPercent}%, 
                  #F59E0B ${groomingPercent}% 100%
                )`,
              }}
            ></div>
            <div className="absolute inset-0 m-auto w-32 h-32 bg-white rounded-full flex items-center justify-center flex-col">
              <span className="text-3xl font-bold text-gray-800">
                {stats.totalServices}
              </span>
              <span className="text-xs text-gray-500">Total Layanan</span>
            </div>
          </div>

          <div className="w-full space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium text-gray-700">
                  Grooming
                </span>
              </div>
              <span className="font-bold text-blue-600">
                {stats.groomingCount}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-sm font-medium text-gray-700">
                  Klinik
                </span>
              </div>
              <span className="font-bold text-amber-600">
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
