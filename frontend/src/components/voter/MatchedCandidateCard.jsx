import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function ScoreCircle({ score }) {
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626';
  const label = score >= 80 ? 'Strong Match' : score >= 60 ? 'Moderate Match' : 'Low Match';
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center font-display font-bold text-xl"
        style={{ background: `${color}18`, color, border: `2px solid ${color}30` }}
      >
        {score != null ? Math.round(score) : '—'}
      </div>
      <span className="text-xs font-medium" style={{ color }}>{label}</span>
    </div>
  );
}

const LEVEL_COLORS = { local: '#16a34a', state: '#2563eb', national: 'var(--navy)' };

export default function MatchedCandidateCard({ candidate, index = 0, voterTopics = [] }) {
  const { id, name, office, party, bio, election_level, district, alignment_score, is_verified, is_paused } = candidate;

  const candidateTopics = (() => {
    try { return JSON.parse(candidate.topic_tags || '[]'); } catch { return []; }
  })();

  const matchingTopics = voterTopics.filter(t => candidateTopics.includes(t));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="card overflow-hidden hover:shadow-md transition-shadow duration-200"
      style={{ borderLeft: `3px solid ${LEVEL_COLORS[election_level] || 'var(--navy)'}` }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Name + badges */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-display text-lg font-semibold" style={{ color: 'var(--navy)' }}>{name}</h3>
              {is_verified === 1 && (
                <span className="text-xs font-semibold px-1.5 py-0.5 flex items-center gap-1" style={{ background: 'rgba(15,37,87,0.08)', color: 'var(--navy)' }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Verified
                </span>
              )}
              {is_paused === 1 && (
                <span className="text-xs px-1.5 py-0.5" style={{ background: 'rgba(220,38,38,0.1)', color: '#dc2626' }}>AI Paused</span>
              )}
            </div>
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>{office}</p>
            <div className="flex items-center gap-3 mb-3">
              {party && (
                <span className="text-xs font-medium px-2 py-0.5" style={{ background: 'var(--border)', color: 'var(--text-muted)' }}>
                  {party}
                </span>
              )}
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{district}</span>
            </div>
            {bio && (
              <p className="text-sm leading-relaxed mb-3 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{bio}</p>
            )}
            {matchingTopics.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Matches:</span>
                {matchingTopics.slice(0, 3).map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 font-medium capitalize" style={{ background: 'rgba(15,37,87,0.07)', color: 'var(--navy)' }}>
                    {t.replace(/-/g, ' ')}
                  </span>
                ))}
                {matchingTopics.length > 3 && (
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>+{matchingTopics.length - 3}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            <ScoreCircle score={alignment_score} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <Link
            to={`/candidate/${id}/chat`}
            className="btn-primary flex-1 text-center py-2 text-sm"
            style={is_paused === 1 ? { opacity: 0.4, pointerEvents: 'none' } : {}}
          >
            Chat now
          </Link>
          <Link
            to={`/candidate/${id}`}
            className="btn-outline flex-1 text-center py-2 text-sm"
          >
            View profile
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
