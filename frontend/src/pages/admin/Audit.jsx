import { useEffect, useState } from 'react';
import AuditTimeline from '../../components/AuditTimeline';

export default function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('/api/candidate/audit-log', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setLogs);
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Your Audit Trail</h2>
      <AuditTimeline logs={logs} detailed />
    </div>
  );
}
