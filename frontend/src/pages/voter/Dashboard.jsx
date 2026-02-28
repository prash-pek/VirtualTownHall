import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import MatchedCandidateCard from '../../components/voter/MatchedCandidateCard';
import TopicSelector from '../../components/TopicSelector';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/></svg>
  )},
  { id: 'profile', label: 'My Profile', icon: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M2 14c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
  )},
];

const ALL_TOPICS = ['economy','education','healthcare','housing','environment','public-safety','infrastructure','taxes','immigration','civil-rights','local-business','transportation','technology','veterans','gun-policy','foreign-policy','social-services','agriculture'];

export default function VoterDashboard() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const [activeNav, setActiveNav] = useState('dashboard');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // Edit profile state
  const [editZip, setEditZip] = useState('');
  const [editTopics, setEditTopics] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const zip = localStorage.getItem('voterZip');
  const storedTopics = (() => { try { return JSON.parse(localStorage.getItem('voterTopics') || '[]'); } catch { return []; } })();

  useEffect(() => {
    if (!token || role !== 'constituent') {
      navigate('/onboarding');
      return;
    }
    // Load profile first, then use it to load candidates
    const headers = { Authorization: `Bearer ${token}` };
    fetch('/api/constituent/profile', { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setProfile(data);
          setEditZip(data.zip_code);
          setEditTopics(data.interest_tags || []);
          const useZip = data.zip_code || zip;
          const useTopics = data.interest_tags?.length ? data.interest_tags : storedTopics;
          if (useZip) loadCandidates(useZip, useTopics);
          else setLoading(false);
        } else {
          if (zip) loadCandidates(zip, storedTopics);
          else setLoading(false);
        }
      });
  }, []);

  async function loadCandidates(zipCode, topics) {
    setLoading(true);
    const params = new URLSearchParams({ zip: zipCode });
    if (topics.length) params.set('topics', topics.join(','));
    const res = await fetch(`/api/candidates?${params}`);
    if (res.ok) setCandidates(await res.json());
    setLoading(false);
  }

  async function saveProfile() {
    setSaving(true); setSaveMsg('');
    const res = await fetch('/api/constituent/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ zip_code: editZip, interest_tags: editTopics }),
    });
    setSaving(false);
    if (res.ok) {
      localStorage.setItem('voterZip', editZip);
      localStorage.setItem('voterTopics', JSON.stringify(editTopics));
      setSaveMsg('Saved!');
      loadCandidates(editZip, editTopics);
      setTimeout(() => setSaveMsg(''), 2000);
    }
  }

  function handleSignOut() {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  }

  const displayZip = profile?.zip_code || zip;
  const displayTopics = profile?.interest_tags?.length ? profile.interest_tags : storedTopics;

  return (
    <div className="flex h-screen" style={{ background: 'var(--cream)' }}>
      {/* ── Sidebar ── */}
      <aside className="w-56 flex-shrink-0 flex flex-col" style={{ background: 'var(--navy)', minHeight: '100vh' }}>
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
          <p className="text-xs mt-1.5 font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Voter Portal</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all text-left"
              style={{
                background: activeNav === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeNav === item.id ? 'white' : 'rgba(255,255,255,0.55)',
                borderLeft: activeNav === item.id ? '2px solid var(--gold)' : '2px solid transparent',
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <Link
            to={displayZip ? `/candidates?zip=${displayZip}` : '/candidates'}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all"
            style={{ color: 'rgba(255,255,255,0.55)', borderLeft: '2px solid transparent' }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/><path d="M5 8h6M9 6l2 2-2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Browse All
          </Link>
        </nav>

        {/* Bottom: ZIP badge + sign out */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {displayZip && (
            <div className="flex items-center gap-2 mb-3">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1a4 4 0 00-4 4c0 3 4 7 4 7s4-4 4-7a4 4 0 00-4-4z" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2"/></svg>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>ZIP {displayZip}</span>
            </div>
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

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeNav === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="p-8"
            >
              {/* Header */}
              <div className="mb-8">
                <p className="section-label mb-2">Voter Dashboard</p>
                <h1 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--navy)' }}>
                  Your Matched Candidates
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  {displayZip && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5" style={{ background: 'var(--navy)', color: 'white' }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1a3 3 0 00-3 3c0 2.5 3 6 3 6s3-3.5 3-6a3 3 0 00-3-3z" stroke="white" strokeWidth="1.2"/></svg>
                      ZIP {displayZip}
                    </span>
                  )}
                  {displayTopics.slice(0, 3).map(t => (
                    <span key={t} className="text-xs px-2.5 py-1 font-medium capitalize" style={{ background: 'rgba(15,37,87,0.08)', color: 'var(--navy)', border: '1px solid rgba(15,37,87,0.12)' }}>
                      {t.replace(/-/g, ' ')}
                    </span>
                  ))}
                  {displayTopics.length > 3 && (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>+{displayTopics.length - 3} more interests</span>
                  )}
                </div>
              </div>

              {/* Candidate list */}
              {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="card p-5 animate-pulse">
                      <div className="flex gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="h-4 rounded" style={{ background: 'var(--border)', width: '55%' }} />
                          <div className="h-3 rounded" style={{ background: 'var(--border)', width: '40%' }} />
                          <div className="h-3 rounded" style={{ background: 'var(--border)', width: '70%' }} />
                        </div>
                        <div className="w-14 h-14 rounded-full" style={{ background: 'var(--border)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : candidates.length === 0 ? (
                <div className="text-center py-16">
                  <div className="font-display text-5xl mb-4" style={{ color: 'var(--navy)', opacity: 0.15 }}>—</div>
                  <p className="font-medium mb-1" style={{ color: 'var(--navy)' }}>No candidates found for ZIP {displayZip}</p>
                  <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Try updating your ZIP code in My Profile.</p>
                  <button onClick={() => setActiveNav('profile')} className="btn-primary px-6 py-2.5 text-sm">
                    Update my ZIP
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
                    {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} found in your area
                  </p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {candidates.map((c, i) => (
                      <MatchedCandidateCard key={c.id} candidate={c} index={i} voterTopics={displayTopics} />
                    ))}
                  </div>
                </>
              )}

              {/* Browse by issue */}
              {!loading && (
                <div className="mt-12 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="section-label mb-4">Browse by issue</p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_TOPICS.map(t => (
                      <Link
                        key={t}
                        to={`/candidates?zip=${displayZip}&topics=${t}`}
                        className="text-xs px-3 py-2 font-medium capitalize transition-all hover:opacity-80"
                        style={{ background: 'white', color: 'var(--navy)', border: '1px solid var(--border)' }}
                      >
                        {t.replace(/-/g, ' ')}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeNav === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="p-8 max-w-lg"
            >
              <p className="section-label mb-2">My Profile</p>
              <h1 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--navy)' }}>Voter Preferences</h1>
              <span className="block w-10 h-0.5 mb-8" style={{ background: 'var(--gold)' }} />

              {profile?.email && (
                <div className="mb-6 p-4" style={{ background: 'white', border: '1px solid var(--border)' }}>
                  <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Email</div>
                  <div className="font-medium" style={{ color: 'var(--navy)' }}>{profile.email}</div>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: 'var(--navy)' }}>ZIP Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={editZip}
                  onChange={e => setEditZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  className="input-field"
                  placeholder="e.g. 97201"
                />
              </div>

              <div className="mb-8">
                <label className="block text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: 'var(--navy)' }}>Policy Interests</label>
                <TopicSelector selected={editTopics} onChange={setEditTopics} />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={saveProfile}
                  disabled={saving || !/^\d{5}$/.test(editZip) || editTopics.length === 0}
                  className="btn-primary px-8 py-3 disabled:opacity-40"
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                {saveMsg && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm font-medium"
                    style={{ color: '#16a34a' }}
                  >
                    ✓ {saveMsg}
                  </motion.span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
