import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AuditTimeline from '../components/AuditTimeline';

export default function AuditPage() {
  const { id } = useParams();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch(`/api/candidates/${id}/audit`).then(r => r.json()).then(setLogs);
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Audit Trail</h2>
      <AuditTimeline logs={logs} />
    </div>
  );
}
