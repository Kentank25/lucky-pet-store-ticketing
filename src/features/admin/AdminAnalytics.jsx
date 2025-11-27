import React, { useState, useEffect } from 'react';
import { getAnalyticsStats, getChartData } from '../../services/ticketService';

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('month'); // 'day', 'week', 'month'
  const [stats, setStats] = useState({
    completed: 0,
    cancelled: 0,
    groomingCount: 0,
    klinikCount: 0,
    totalServices: 0,
    sortedChartData: []
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Get Summary Counts (using aggregation queries)
        const counts = await getAnalyticsStats();
        
        // 2. Get Chart Data (filtered by date)
        const chartTickets = await getChartData(filterType);
        
        // Process chart data
        const chartData = {};
        
        chartTickets.forEach((ticket) => {
          if (!ticket.tanggalRilis) return;
          
          const date = new Date(ticket.tanggalRilis);
          let key, label;

          if (filterType === 'day') {
              key = date.toISOString().split('T')[0];
              label = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
          } else if (filterType === 'week') {
              const day = date.getDay();
              const diff = date.getDate() - day + (day === 0 ? -6 : 1);
              const monday = new Date(date);
              monday.setDate(diff);
              key = monday.toISOString().split('T')[0];
              label = `Minggu ${monday.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`;
          } else { // month
              key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              label = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
          }

          if (!chartData[key]) {
            chartData[key] = {
              key,
              label,
              completed: 0,
              cancelled: 0,
              total: 0
            };
          }

          const status = ticket.status?.toUpperCase();
          if (status === 'COMPLETED') {
            chartData[key].completed++;
            chartData[key].total++;
          } else if (status === 'CANCELLED') {
            chartData[key].cancelled++;
            chartData[key].total++;
          }
        });

        const sortedChartData = Object.values(chartData).sort((a, b) => a.key.localeCompare(b.key));

        setStats({
          completed: counts.completed,
          cancelled: counts.cancelled,
          groomingCount: counts.grooming,
          klinikCount: counts.klinik,
          totalServices: counts.grooming + counts.klinik,
          sortedChartData
        });

      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate percentages for the donut chart
  const groomingPercent = stats.totalServices > 0 ? (stats.groomingCount / stats.totalServices) * 100 : 0;
  const klinikPercent = stats.totalServices > 0 ? (stats.klinikCount / stats.totalServices) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Analytics</h1>
        {/* Removed Total Data count as we don't fetch all tickets anymore */}
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Completed */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
          <div className="p-4 bg-green-50 rounded-2xl text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tiket Selesai</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.completed}</h3>
          </div>
        </div>

        {/* Card 2: Cancelled */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
          <div className="p-4 bg-red-50 rounded-2xl text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Tiket Dibatalkan</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.cancelled}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-lg font-bold text-gray-800">Performa Tiket</h3>
            
            {/* Filter Controls */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
                <button 
                    onClick={() => setFilterType('day')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'day' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Harian
                </button>
                <button 
                    onClick={() => setFilterType('week')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Mingguan
                </button>
                <button 
                    onClick={() => setFilterType('month')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Bulanan
                </button>
            </div>
          </div>

          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {stats.sortedChartData.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Belum ada data untuk periode ini.</p>
            ) : (
              stats.sortedChartData.map((item) => (
                <div key={item.key} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium text-gray-600">
                    <span>{item.label}</span>
                    <span>{item.total} Tiket</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
                    {/* Completed Bar */}
                    <div 
                      className="bg-green-500 h-full transition-all duration-500"
                      style={{ width: `${item.total > 0 ? (item.completed / item.total) * 100 : 0}%` }}
                      title={`Selesai: ${item.completed}`}
                    ></div>
                    {/* Cancelled Bar */}
                    <div 
                      className="bg-red-400 h-full transition-all duration-500"
                      style={{ width: `${item.total > 0 ? (item.cancelled / item.total) * 100 : 0}%` }}
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

        {/* Service Distribution */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold text-gray-800 mb-6 w-full text-left">Distribusi Layanan</h3>
          
          <div className="relative w-48 h-48 mb-6">
            {/* Donut Chart using conic-gradient */}
            <div 
              className="w-full h-full rounded-full"
              style={{
                background: `conic-gradient(
                  #3B82F6 0% ${groomingPercent}%, 
                  #F59E0B ${groomingPercent}% 100%
                )`
              }}
            ></div>
            {/* Inner white circle to make it a donut */}
            <div className="absolute inset-0 m-auto w-32 h-32 bg-white rounded-full flex items-center justify-center flex-col">
               <span className="text-3xl font-bold text-gray-800">{stats.totalServices}</span>
               <span className="text-xs text-gray-500">Total Layanan</span>
            </div>
          </div>

          <div className="w-full space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium text-gray-700">Grooming</span>
              </div>
              <span className="font-bold text-blue-600">{stats.groomingCount}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-sm font-medium text-gray-700">Klinik</span>
              </div>
              <span className="font-bold text-amber-600">{stats.klinikCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
