import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CandidateCard from '../components/CandidateCard';

export default function CandidateList() {
  const [searchParams] = useSearchParams();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const zip = searchParams.get('zip');
  const topics = searchParams.get('topics');

  useEffect(() => {
    const query = new URLSearchParams({ zip });
    if (topics) query.set('topics', topics);
    fetch(`/api/candidates?${query}`)
      .then(r => r.json())
      .then(data => { setCandidates(Array.isArray(data) ? data : []); setLoading(false); });
  }, [searchParams]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream)' }}>
      {/* Header bar */}
      <div style={{ background: 'var(--navy)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="max-w-4xl mx-auto px-8 py-5 flex items-center justify-between">
          <Link to="/" className="font-display font-bold text-lg text-white tracking-tight flex items-center gap-2">
            ← TownHall
          </Link>
          <div className="text-white text-sm opacity-70">
            ZIP {zip}{topics && ` · ${topics.split(',').length} topic filter${topics.split(',').length > 1 ? 's' : ''}`}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="section-label mb-2">Your ballot</p>
          <h1 className="font-display text-4xl font-bold mb-1" style={{ color: 'var(--navy)' }}>
            Candidates in {zip}
          </h1>
          {!loading && (
            <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
              {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} found
              {topics && ` matching your topic filters`}
            </p>
          )}
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="card p-6 animate-pulse" style={{ borderLeft: '4px solid var(--border)' }}>
                <div className="h-5 rounded w-48 mb-2" style={{ background: 'var(--mist)' }} />
                <div className="h-3 rounded w-32" style={{ background: 'var(--mist)' }} />
              </div>
            ))}
          </div>
        ) : candidates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card p-12 text-center"
          >
            <div className="font-display text-4xl mb-3" style={{ color: 'var(--border)' }}>—</div>
            <p className="font-medium mb-1" style={{ color: 'var(--ink)' }}>No candidates found for ZIP {zip}</p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Try a different ZIP code or remove topic filters.</p>
            <Link to="/" className="btn-outline text-sm">Try another ZIP</Link>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {candidates.map((c, i) => <CandidateCard key={c.id} candidate={c} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
