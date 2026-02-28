import { motion } from 'framer-motion';

const ACTION_ICONS = {
  context_added: '📄',
  context_updated: '✏️',
  context_deleted: '🗑',
  persona_updated: '🎭',
  topic_blocked: '🚫',
  topic_unblocked: '✅',
  kill_switch_activated: '⏸',
  kill_switch_deactivated: '▶️',
  global_pause: '⏸',
  global_resume: '▶️',
  verification_granted: '✓',
  verification_revoked: '✗',
  alignment_score_computed: '📊',
};

export default function AuditTimeline({ logs, detailed = false }) {
  if (!logs.length) {
    return (
      <div className="card p-8 text-center">
        <p className="section-label mb-1">No entries yet</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Audit entries will appear as changes are made.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {logs.map((log, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3 }}
          className="flex gap-4 items-start"
        >
          {/* Timeline line */}
          <div className="flex flex-col items-center" style={{ width: '32px', flexShrink: 0 }}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: 'var(--mist)', border: '1.5px solid var(--border)' }}
            >
              {ACTION_ICONS[log.action || log.action_type] || '·'}
            </div>
            {i < logs.length - 1 && (
              <div className="w-px flex-1 mt-1" style={{ background: 'var(--border)', minHeight: '24px' }} />
            )}
          </div>

          {/* Entry */}
          <div className="flex-1 pb-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                {log.summary || (log.action_type || '').replace(/_/g, ' ')}
              </span>
              <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                {new Date(log.timestamp || log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            {detailed && log.details && log.details !== '{}' && (
              <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>
                {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
