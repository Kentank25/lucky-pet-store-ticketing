import { useLogs } from "../../hooks/useLogs";

export default function LogList() {
  const { logs, loading } = useLogs();

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );

  if (logs.length === 0)
    return (
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
        {logs.map((log) => {
          const getLogStyle = (msg) => {
            if (msg.includes("dibuat"))
              return { icon: "🆕", color: "bg-blue-400 border-blue-200" };
            if (msg.includes("Diterima"))
              return { icon: "✅", color: "bg-emerald-400 border-emerald-200" };
            if (
              msg.includes("Ditolak") ||
              msg.includes("dibatalkan") ||
              msg.includes("Batal")
            )
              return { icon: "🚫", color: "bg-rose-400 border-rose-200" };
            if (msg.includes("diambil"))
              return { icon: "▶️", color: "bg-amber-400 border-amber-200" };
            if (msg.includes("Layanan selesai"))
              return { icon: "🏁", color: "bg-purple-400 border-purple-200" };
            if (msg.includes("Pembayaran"))
              return { icon: "💰", color: "bg-emerald-500 border-emerald-300" };
            return { icon: "📝", color: "bg-gray-400 border-gray-200" };
          };

          const style = getLogStyle(log.message);

          return (
            <div key={log.id} className="relative pl-8 group">
              {/* Timeline Dot with Icon */}
              <div
                className={`absolute left-[-5px] top-0 w-8 h-8 rounded-full border-4 border-white shadow-sm z-10 flex items-center justify-center text-[10px] transition-transform group-hover:scale-110 ${style.color}`}
              >
                {style.icon}
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex justify-between items-start gap-3 mb-1">
                  <p className="text-sm font-medium text-gray-700 leading-snug group-hover:text-gray-900">
                    {log.message}
                  </p>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 whitespace-nowrap">
                    {log.timestamp?.toDate
                      ? log.timestamp.toDate().toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Just now"}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      log.layanan === "Grooming"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {log.layanan}
                  </span>
                  <span className="text-xs font-bold text-gray-400">
                    • {log.nama}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
