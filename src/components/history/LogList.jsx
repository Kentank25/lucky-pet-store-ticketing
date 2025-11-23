import { useLogs } from '../../hooks/useLogs';

export default function LogList() {
  const { logs, loading } = useLogs();

  if (loading) return <div className="text-gray-400 text-sm p-4 text-center italic">Memuat log...</div>;
  if (logs.length === 0) return <div className="text-gray-400 text-sm p-4 text-center italic">Belum ada riwayat.</div>;

  return (
    <div className="overflow-hidden">
      <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {logs.map((log) => (
          <div key={log.id} className="py-3 hover:bg-gray-50 transition-colors rounded-xl px-2 group">
            <div className="flex justify-between items-start gap-3">
              <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors line-clamp-2">{log.message}</p>
              <span className="text-[10px] text-gray-400 whitespace-nowrap bg-gray-100 px-2 py-1 rounded-full">
                {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
              <div className={`w-1.5 h-1.5 rounded-full ${log.layanan === 'Grooming' ? 'bg-blue-400' : 'bg-rose-400'}`}></div>
              <span className="font-medium text-gray-500">{log.nama}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
