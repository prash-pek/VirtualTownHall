export default function AuditTimeline({ logs, detailed = false }) {
  if (!logs.length) return <p className="text-gray-400 text-sm">No audit entries yet.</p>;

  return (
    <div className="space-y-3">
      {logs.map((log, i) => (
        <div key={i} className="flex gap-4 items-start">
          <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
          <div className="flex-1 bg-white rounded-lg border px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm text-gray-800">{log.summary || log.action_type?.replace(/_/g, ' ')}</span>
              <span className="text-xs text-gray-400">{new Date(log.timestamp || log.created_at).toLocaleDateString()}</span>
            </div>
            {detailed && log.details && log.details !== '{}' && (
              <p className="text-xs text-gray-500 mt-1">{JSON.stringify(JSON.parse(log.details))}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
