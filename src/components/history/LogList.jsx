import { useLogs } from '../../hooks/useLogs';

export default function LogList() {
  const { logs, loading } = useLogs();

  if (loading) return (
    <div className="flex justify-center p-8">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );
  
  if (logs.length === 0) return (
    <div className="text-center py-8 opacity-50">
      <div className="text-4xl mb-2">📜</div>
      <p className="text-sm font-bold text-gray-400">Belum ada riwayat.</p>
    </div>
  );

  return (
    <div className="relative pl-2">
      {/* Timeline Line */}
      <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-100"></div>

      <div className="space-y-6">
        {logs.map((log) => (
          <div key={log.id} className="relative pl-6 group">
            {/* Timeline Dot */}
            <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 transition-colors ${
              log.layanan === 'Grooming' ? 'bg-blue-400 group-hover:bg-blue-500' : 'bg-rose-400 group-hover:bg-rose-500'
            }`}></div>

            <div className="bg-gray-50/50 p-3 rounded-2xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
              <div className="flex justify-between items-start gap-3 mb-1">
                <p className="text-sm font-bold text-gray-700 leading-snug group-hover:text-gray-900">
                  {log.message}
                </p>
                <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-1 rounded-lg shadow-sm whitespace-nowrap">
                  {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  log.layanan === 'Grooming' ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'
                }`}>
                  {log.layanan}
                </span>
                <span className="text-xs font-medium text-gray-500">{log.nama}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
