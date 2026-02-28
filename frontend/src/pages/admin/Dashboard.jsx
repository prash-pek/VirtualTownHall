import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const QUICK_LINKS = [
  { to: '/admin/context', label: 'Context Docs', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 2h5l3 3v9H4V2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M9 2v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M6 8h4M6 11h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> },
  { to: '/admin/persona', label: 'AI Persona', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M2 14c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> },
  { to: '/admin/blocked-topics', label: 'Blocked Topics', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="4" y="7" width="8" height="7" rx="1" stroke="currentColor" strokeWidth="1.4"/><path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> },
  { to: '/admin/analytics', label: 'Analytics', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 13l4-5 3 3 4-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { to: '/admin/audit', label: 'Audit Trail', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M3 8h7M3 12h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> },
  { to: '/admin/settings', label: 'Settings', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.42 1.42M11.53 11.53l1.42 1.42M3.05 12.95l1.42-1.42M11.53 4.47l1.42-1.42" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> },
];

const ACTION_LABELS = {
  context_added: 'Added context document',
  context_deleted: 'Deleted context document',
  persona_updated: 'Updated AI persona',
  topic_blocked: 'Blocked topic',
  topic_unblocked: 'Unblocked topic',
  global_pause: 'Paused AI globally',
  global_resume: 'Resumed AI',
  kill_switch_activated: 'Activated kill switch',
};

function MetricCard({ label, value, sub, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="card p-5"
    >
      <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className="font-display text-3xl font-bold mb-1" style={{ color: color || 'var(--navy)' }}>{value}</div>
      {sub && <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</div>}
    </motion.div>
  );
}

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [candidate, setCandidate] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const [togglingAI, setTogglingAI] = useState(false);

  useEffect(() => {
    if (!token) { navigate('/auth/login'); return; }
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch('/api/candidate/profile', { headers }).then(r => r.json()),
      fetch('/api/candidate/analytics', { headers }).then(r => r.json()),
      fetch('/api/candidate/audit-log', { headers }).then(r => r.json()),
    ]).then(([prof, anal, logs]) => {
      setCandidate(prof);
      setAnalytics(anal);
      setAuditLog(Array.isArray(logs) ? logs.slice(0, 6) : []);
    });
  }, []);

  async function toggleAI() {
    setTogglingAI(true);
    const isPaused = candidate.is_paused === 1;
    await fetch('/api/candidate/kill-switch', {
      method: isPaused ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: isPaused ? undefined : JSON.stringify({ global: true }),
    });
    setCandidate(c => ({ ...c, is_paused: isPaused ? 0 : 1 }));
    setTogglingAI(false);
  }

  if (!candidate) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ minHeight: '100vh' }}>
        <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--navy)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const scoreColor = candidate.alignment_score >= 80 ? 'var(--green)' : candidate.alignment_score >= 60 ? 'var(--gold)' : 'var(--red)';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-8"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <p className="section-label mb-2">Overview</p>
          <h1 className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--navy)' }}>
            Welcome back, {candidate.name.split(' ')[0]}.
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {candidate.office} · {candidate.district}
          </p>
          <div className="flex items-center gap-2 mt-3">
            {candidate.is_verified === 1 && (
              <span className="text-xs font-semibold px-2.5 py-1 flex items-center gap-1.5" style={{ background: 'rgba(15,37,87,0.08)', color: 'var(--navy)', border: '1px solid rgba(15,37,87,0.12)' }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Verified Candidate
              </span>
            )}
            <span className="text-xs font-semibold px-2.5 py-1 capitalize" style={{ background: 'rgba(15,37,87,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              {candidate.election_level}
            </span>
          </div>
        </div>

        <button
          onClick={toggleAI}
          disabled={togglingAI}
          className="flex items-center gap-2.5 px-5 py-3 text-sm font-semibold transition-all disabled:opacity-50 flex-shrink-0"
          style={{
            background: candidate.is_paused ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)',
            color: candidate.is_paused ? '#16a34a' : '#dc2626',
            border: `1.5px solid ${candidate.is_paused ? 'rgba(22,163,74,0.25)' : 'rgba(220,38,38,0.25)'}`,
          }}
        >
          {candidate.is_paused ? (
            <><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l4-3v6L3 7zM10 4v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Resume AI</>
          ) : (
            <><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="3" y="3" width="3" height="8" rx="1" fill="currentColor"/><rect x="8" y="3" width="3" height="8" rx="1" fill="currentColor"/></svg>Pause AI</>
          )}
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Total Conversations" value={analytics?.total_conversations ?? '—'} sub={analytics ? `${analytics.anonymous_conversations} anonymous` : null} delay={0.05} />
        <MetricCard label="Unique Voters" value={analytics?.unique_constituents ?? '—'} sub="reached" delay={0.1} />
        <MetricCard label="Alignment Score" value={candidate.alignment_score != null ? `${Math.round(candidate.alignment_score)}%` : '—'} sub="platform vs. public record" color={candidate.alignment_score != null ? scoreColor : undefined} delay={0.15} />
        <MetricCard label="AI Status" value={candidate.is_paused ? 'Paused' : 'Live'} sub={candidate.is_paused ? 'Responses disabled' : 'Responding to voters'} color={candidate.is_paused ? 'var(--red)' : 'var(--green)'} delay={0.2} />
      </div>

      {/* Activity + Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.35 }} className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-base font-semibold" style={{ color: 'var(--navy)' }}>Recent Activity</h2>
            <Link to="/admin/audit" className="text-xs font-medium" style={{ color: 'var(--gold)' }}>View all →</Link>
          </div>
          {auditLog.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {auditLog.map((log, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'var(--navy)', opacity: 0.3 }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: 'var(--navy)' }}>{ACTION_LABELS[log.action_type] || log.action_type?.replace(/_/g, ' ')}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.35 }} className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-base font-semibold" style={{ color: 'var(--navy)' }}>Top Voter Questions</h2>
            <Link to="/admin/analytics" className="text-xs font-medium" style={{ color: 'var(--gold)' }}>Full analytics →</Link>
          </div>
          {!analytics?.top_questions?.length ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No conversations yet.</p>
          ) : (
            <div className="space-y-3">
              {analytics.top_questions.slice(0, 6).map((q, i) => {
                const maxCount = analytics.top_questions[0].count;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 text-xs font-display font-bold text-right flex-shrink-0" style={{ color: 'var(--navy)', opacity: 0.3 }}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium capitalize truncate" style={{ color: 'var(--navy)' }}>{q.topic.replace(/-/g, ' ')}</span>
                        <span className="text-xs flex-shrink-0 ml-2" style={{ color: 'var(--text-muted)' }}>{q.count}</span>
                      </div>
                      <div className="h-1 w-full" style={{ background: 'var(--border)' }}>
                        <div className="h-full" style={{ background: 'var(--navy)', width: `${(q.count / maxCount) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick links */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.35 }}>
        <p className="section-label mb-4">Quick actions</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_LINKS.map(item => (
            <Link key={item.to} to={item.to} className="card p-4 flex flex-col items-center gap-2 text-center hover:shadow-md transition-shadow group">
              <div style={{ color: 'var(--navy)', opacity: 0.6 }} className="group-hover:opacity-100 transition-opacity">{item.icon}</div>
              <span className="text-xs font-medium" style={{ color: 'var(--navy)' }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
