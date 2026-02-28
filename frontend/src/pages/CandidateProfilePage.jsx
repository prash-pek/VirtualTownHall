import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import CandidateProfile from '../components/CandidateProfile';

export default function CandidateProfilePage() {
  const { id } = useParams();
  const location = useLocation();
  const from = location.state?.from || '/candidates';
  const fromLabel = from === '/voter/dashboard' ? '← Back to your dashboard' : '← Back to candidates';
  const [candidate, setCandidate] = useState(null);

  useEffect(() => {
    fetch(`/api/candidates/${id}/profile`).then(r => r.json()).then(setCandidate);
  }, [id]);

  if (!candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cream)' }}>
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--navy)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream)' }}>
      {/* Back bar */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'white' }}>
        <div className="max-w-3xl mx-auto px-8 py-4">
          <Link to={from} className="text-sm font-medium flex items-center gap-2 transition-opacity hover:opacity-70" style={{ color: 'var(--navy)' }}>
            {fromLabel}
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-8">
        <CandidateProfile candidate={candidate} />

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-4 flex gap-3"
        >
          <Link to={`/candidate/${id}/chat`} state={{ from }} className="btn-primary flex-1 justify-center py-3.5 text-sm">
            Chat with {candidate.name}
          </Link>
          <Link to={`/candidate/${id}/audit`} className="btn-outline py-3.5 text-sm px-5">
            Audit Trail
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
