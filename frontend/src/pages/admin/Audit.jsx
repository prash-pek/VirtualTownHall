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
    <div className="p-8 max-w-3xl">
      <p className="section-label mb-2">Audit Trail</p>
      <h2 className="font-display text-3xl font-bold mb-8" style={{ color: 'var(--navy)' }}>Change History</h2>
      <AuditTimeline logs={logs} detailed />
    </div>
  );
}
