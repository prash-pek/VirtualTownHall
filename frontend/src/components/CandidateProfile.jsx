import { useState } from 'react';
import { motion } from 'framer-motion';
import AlignmentBadge from './AlignmentBadge';
import VerificationBadge from './VerificationBadge';

export default function CandidateProfile({ candidate }) {
  const topics = [...new Set((candidate.contexts || []).flatMap(c => JSON.parse(c.topic_tags || '[]')))];
  const [showDiscrepancies, setShowDiscrepancies] = useState(false);
  const discrepancies = (() => {
    try { return JSON.parse(candidate.alignment_discrepancies || '[]'); } catch { return []; }
  })();

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* Hero strip */}
      <div className="px-8 py-10" style={{ background: 'var(--navy)' }}>
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <h1 className="font-display text-4xl font-bold text-white">{candidate.name}</h1>
              {candidate.is_verified === 1 && <VerificationBadge showLabel />}
            </div>
            <p className="text-lg font-medium mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>{candidate.office}</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {candidate.district}{candidate.party && ` · ${candidate.party}`}
            </p>
          </div>
          {candidate.alignment_score != null && (
            <div className="flex-shrink-0">
              <AlignmentBadge score={candidate.alignment_score} size="lg" />
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="card p-8 space-y-6">
        {candidate.bio && (
          <div>
            <p className="section-label mb-2">About</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>{candidate.bio}</p>
          </div>
        )}

        {topics.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <p className="section-label mb-3">Topics covered</p>
            <div className="flex flex-wrap gap-2">
              {topics.map(t => (
                <span
                  key={t}
                  className="px-3 py-1 text-xs font-medium tracking-wide"
                  style={{ border: '1.5px solid var(--navy)', color: 'var(--navy)', textTransform: 'capitalize' }}
                >
                  {t.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {candidate.alignment_rationale && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <div className="flex items-start justify-between gap-4 mb-2">
              <p className="section-label">Alignment note</p>
              {discrepancies.length > 0 && (
                <button
                  onClick={() => setShowDiscrepancies(v => !v)}
                  className="text-xs font-medium flex-shrink-0"
                  style={{ color: 'var(--gold)' }}
                >
                  {showDiscrepancies ? 'Hide' : 'Show'} {discrepancies.length} discrepanc{discrepancies.length === 1 ? 'y' : 'ies'}
                </button>
              )}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {candidate.alignment_rationale}
            </p>
            {showDiscrepancies && (
              <div className="mt-4 space-y-3">
                {discrepancies.map((d, i) => {
                  const severityColor = d.severity === 'high' ? 'var(--red)' : d.severity === 'medium' ? 'var(--gold)' : 'var(--text-muted)';
                  return (
                    <div key={i} className="p-3 text-sm" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold" style={{ color: 'var(--navy)' }}>{d.topic}</span>
                        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: severityColor }}>{d.severity}</span>
                      </div>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                        <span className="font-semibold" style={{ color: 'var(--navy)' }}>Public record: </span>{d.public_position}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span className="font-semibold" style={{ color: 'var(--navy)' }}>Platform says: </span>{d.uploaded_position}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {candidate.donation_url && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
            <a
              href={candidate.donation_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold text-sm"
            >
              Donate to {candidate.name} →
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}
