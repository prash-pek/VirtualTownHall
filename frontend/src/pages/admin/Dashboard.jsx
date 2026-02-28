import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [candidate, setCandidate] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('/api/candidate/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setCandidate);
  }, []);

  if (!candidate) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{candidate.name}</h1>
          <p className="text-gray-500">{candidate.office} — {candidate.district}</p>
        </div>
        {candidate.is_verified && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">✓ Verified</span>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow">
          <div className="text-2xl font-bold text-blue-600">{candidate.alignment_score ? `${candidate.alignment_score}%` : '—'}</div>
          <div className="text-sm text-gray-500">Alignment Score</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow">
          <div className="text-2xl font-bold">{candidate.is_paused ? 'PAUSED' : 'LIVE'}</div>
          <div className="text-sm text-gray-500">AI Status</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { to: '/admin/context', label: 'Manage Context Documents' },
          { to: '/admin/persona', label: 'Configure AI Persona' },
          { to: '/admin/blocked-topics', label: 'Blocked Topics & Kill Switch' },
          { to: '/admin/analytics', label: 'Analytics Dashboard' },
          { to: '/admin/audit', label: 'Audit Trail' },
          { to: '/admin/settings', label: 'Settings' }
        ].map(link => (
          <Link key={link.to} to={link.to} className="bg-white rounded-xl p-4 shadow hover:shadow-md transition-shadow font-medium text-gray-800">
            {link.label} →
          </Link>
        ))}
      </div>
    </div>
  );
}
