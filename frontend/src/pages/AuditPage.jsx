import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import AuditTimeline from '../components/AuditTimeline';

export default function AuditPage() {
  const { id } = useParams();
  const location = useLocation();
  const from = location.state?.from;
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch(`/api/candidates/${id}/audit`).then(r => r.json()).then(setLogs);
  }, [id]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream)' }}>
      <div style={{ borderBottom: '1px solid var(--border)', background: 'white' }}>
        <div className="max-w-3xl mx-auto px-8 py-4">
          <Link to={`/candidate/${id}`} state={{ from }} className="text-sm font-medium flex items-center gap-2 transition-opacity hover:opacity-70" style={{ color: 'var(--navy)' }}>
            ← Back to profile
          </Link>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-8 py-8">
        <p className="section-label mb-2">Transparency</p>
        <h2 className="font-display text-3xl font-bold mb-8" style={{ color: 'var(--navy)' }}>Audit Trail</h2>
        <AuditTimeline logs={logs} />
      </div>
    </div>
  );
}
