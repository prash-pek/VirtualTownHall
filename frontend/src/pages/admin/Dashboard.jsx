import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NAV_LINKS = [
  { to: '/admin/context', label: 'Context Documents', desc: 'Upload policy papers and platform materials' },
  { to: '/admin/persona', label: 'AI Persona', desc: 'Set tone, style, and key phrases' },
  { to: '/admin/blocked-topics', label: 'Blocked Topics & Kill Switch', desc: 'Control what the AI will discuss' },
  { to: '/admin/analytics', label: 'Analytics', desc: 'See what voters are asking about' },
  { to: '/admin/audit', label: 'Audit Trail', desc: 'Full history of all changes' },
  { to: '/admin/settings', label: 'Profile & Settings', desc: 'Name, bio, donation link' },
];

export default function Dashboard() {
  const [candidate, setCandidate] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('/api/candidate/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setCandidate);
  }, []);

  if (!candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cream)' }}>
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--navy)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream)' }}>
      {/* Top bar */}
      <div style={{ background: 'var(--navy)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="max-w-5xl mx-auto px-8 py-5 flex items-center justify-between">
          <Link to="/" className="font-display font-bold text-lg text-white">TownHall AI</Link>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Candidate Dashboard</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="section-label mb-2">Candidate Dashboard</p>
              <h1 className="font-display text-4xl font-bold mb-1" style={{ color: 'var(--navy)' }}>{candidate.name}</h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{candidate.office} · {candidate.district}</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap justify-end">
              {candidate.is_verified === 1 && (
                <span className="text-xs font-semibold px-3 py-1.5 tracking-wide" style={{ background: 'var(--navy)', color: 'white' }}>✓ VERIFIED</span>
              )}
              <span
                className="text-xs font-semibold px-3 py-1.5 tracking-wide"
                style={{
                  background: candidate.is_paused ? 'rgba(220,38,38,0.1)' : 'rgba(22,163,74,0.1)',
                  color: candidate.is_paused ? 'var(--red)' : 'var(--green)',
                  border: `1.5px solid ${candidate.is_paused ? 'rgba(220,38,38,0.3)' : 'rgba(22,163,74,0.3)'}`,
                }}
              >
                {candidate.is_paused ? '⏸ AI PAUSED' : '● AI LIVE'}
              </span>
            </div>
          </div>

          {/* Stats */}
          {candidate.alignment_score != null && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 card">
              <span className="section-label">Alignment Score</span>
              <span className="font-display text-lg font-bold" style={{ color: candidate.alignment_score >= 80 ? 'var(--green)' : candidate.alignment_score >= 60 ? 'var(--gold)' : 'var(--red)' }}>
                {Math.round(candidate.alignment_score)}%
              </span>
            </div>
          )}
        </motion.div>

        {/* Nav grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {NAV_LINKS.map((link, i) => (
            <motion.div
              key={link.to}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.35 }}
            >
              <Link
                to={link.to}
                className="block card p-5 group transition-shadow duration-200 hover:shadow-md"
              >
                <h3 className="font-semibold text-sm mb-1 group-hover:underline decoration-1 underline-offset-2" style={{ color: 'var(--navy)' }}>
                  {link.label}
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{link.desc}</p>
                <span className="block mt-3 text-xs font-medium" style={{ color: 'var(--gold)' }}>Open →</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
