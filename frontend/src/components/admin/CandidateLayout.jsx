import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const SIDEBAR_NAV = [
  {
    to: '/admin/dashboard', label: 'Overview', icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/></svg>
    )
  },
  {
    to: '/admin/context', label: 'Context Docs', icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 2h5l3 3v9H4V2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M9 2v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M6 8h4M6 11h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
    )
  },
  {
    to: '/admin/persona', label: 'AI Persona', icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M2 14c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
    )
  },
  {
    to: '/admin/blocked-topics', label: 'Blocked Topics', icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="4" y="7" width="8" height="7" rx="1" stroke="currentColor" strokeWidth="1.4"/><path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
    )
  },
  {
    to: '/admin/analytics', label: 'Analytics', icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 13l4-5 3 3 4-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
    )
  },
  {
    to: '/admin/audit', label: 'Audit Trail', icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M3 8h7M3 12h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
    )
  },
  {
    to: '/admin/settings', label: 'Settings', icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.42 1.42M11.53 11.53l1.42 1.42M3.05 12.95l1.42-1.42M11.53 4.47l1.42-1.42" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
    )
  },
];

export default function CandidateLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [candidate, setCandidate] = useState(null);
  const [togglingAI, setTogglingAI] = useState(false);

  useEffect(() => {
    if (!token) { navigate('/auth/login'); return; }
    fetch('/api/candidate/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setCandidate(data); });
  }, []);

  async function toggleAI() {
    if (!candidate) return;
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

  function handleSignOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  }

  return (
    <div className="flex h-screen" style={{ background: 'var(--cream)' }}>
      {/* ── Sidebar ── */}
      <aside className="w-56 flex-shrink-0 flex flex-col" style={{ background: 'var(--navy)', minHeight: '100vh', position: 'sticky', top: 0 }}>
        {/* Logo */}
        <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="4" r="2.5" fill="white"/>
                <path d="M2 12c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-display font-bold text-white text-sm">TownHall AI</span>
          </Link>
          <p className="text-xs mt-1.5 font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Candidate Portal</p>
        </div>

        {/* Candidate info strip */}
        {candidate && (
          <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-semibold text-white truncate">{candidate.name}</p>
            <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{candidate.office}</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {SIDEBAR_NAV.map(item => {
            const isActive = location.pathname === item.to ||
              // treat context-manager as child of context
              (item.to === '/admin/context' && location.pathname === '/admin/context-manager') ||
              // treat persona-editor as child of persona
              (item.to === '/admin/persona' && location.pathname === '/admin/persona-editor');
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
                  borderLeft: isActive ? '2px solid var(--gold)' : '2px solid transparent',
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: AI toggle + sign out */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {candidate && (
            <button
              onClick={toggleAI}
              disabled={togglingAI}
              className="w-full flex items-center gap-2 px-3 py-2 mb-3 text-xs font-semibold transition-all disabled:opacity-50"
              style={{
                background: candidate.is_paused ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)',
                color: candidate.is_paused ? '#4ade80' : '#fca5a5',
                border: `1px solid ${candidate.is_paused ? 'rgba(74,222,128,0.2)' : 'rgba(252,165,165,0.2)'}`,
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: candidate.is_paused ? '#4ade80' : '#fca5a5' }} />
              {candidate.is_paused ? 'Resume AI' : 'Pause AI'}
            </button>
          )}
          <button
            onClick={handleSignOut}
            className="text-xs font-medium flex items-center gap-2 transition-opacity hover:opacity-100"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 7h6M9 5l2 2-2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 2H3a1 1 0 00-1 1v8a1 1 0 001 1h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Page content ── */}
      <main className="flex-1 overflow-y-auto" style={{ background: 'var(--cream)' }}>
        <Outlet />
      </main>
    </div>
  );
}
