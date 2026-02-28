import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function ConversationSummary({ summary, candidateName }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center flex-1 p-8"
    >
      <div className="max-w-xl w-full">
        {/* Header */}
        <div className="px-8 py-6" style={{ background: 'var(--navy)' }}>
          <p className="section-label mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Conversation complete</p>
          <h3 className="font-display text-2xl text-white">Your summary</h3>
        </div>

        {/* Summary body */}
        <div className="card p-8">
          <div className="mb-6 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="section-label mb-3">What you discussed with {candidateName}</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)', lineHeight: '1.75' }}>{summary}</p>
          </div>

          <div className="flex gap-3">
            <Link to="/" className="btn-primary text-sm flex-1 justify-center">
              Find more candidates
            </Link>
            <Link to="/candidates" className="btn-outline text-sm flex-1 justify-center">
              Back to results
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
