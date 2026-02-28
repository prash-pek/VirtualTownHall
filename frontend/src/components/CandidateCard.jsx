import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AlignmentBadge from './AlignmentBadge';
import VerificationBadge from './VerificationBadge';

const LEVEL_COLORS = { local: '#16A34A', state: 'var(--blue)', national: 'var(--navy)' };

export default function CandidateCard({ candidate, index = 0 }) {
  const levelColor = LEVEL_COLORS[candidate.election_level] || 'var(--navy)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
    >
      <Link
        to={`/candidate/${candidate.id}`}
        className="block card transition-shadow duration-200 hover:shadow-md group"
        style={{ borderLeft: `4px solid ${levelColor}` }}
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3
                  className="font-display font-semibold text-xl leading-tight group-hover:underline decoration-1 underline-offset-2"
                  style={{ color: 'var(--navy)' }}
                >
                  {candidate.name}
                </h3>
                {candidate.is_verified === 1 && <VerificationBadge showLabel />}
              </div>
              <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--ink)' }}>{candidate.office}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {candidate.district}
                {candidate.party && <span> · {candidate.party}</span>}
                <span
                  className="ml-2 px-1.5 py-0.5 font-semibold"
                  style={{
                    background: `${levelColor}18`,
                    color: levelColor,
                    fontSize: '10px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {candidate.election_level}
                </span>
              </p>
            </div>
            {candidate.alignment_score != null && (
              <div className="flex-shrink-0">
                <AlignmentBadge score={candidate.alignment_score} />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              View profile & chat →
            </span>
            {candidate.donation_url && (
              <span className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>Accepts donations</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
