import { useLogs } from '../../hooks/useLogs';

export default function LogList() {
  const { logs, loading } = useLogs();

  if (loading) return <div className="text-gray-500 text-sm p-4">Memuat log...</div>;
  if (logs.length === 0) return <div className="text-gray-500 text-sm p-4">Belum ada riwayat.</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {logs.map((log) => (
          <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start gap-4">
              <p className="text-sm font-medium text-gray-800">{log.message}</p>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString('id-ID') : 'Just now'}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
              <span className="font-medium">{log.nama}</span>
              <span>•</span>
              <span className={log.layanan === 'Grooming' ? 'text-blue-600' : 'text-red-600'}>
                {log.layanan}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
