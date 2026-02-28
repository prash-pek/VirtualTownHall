import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import TopicSelector from '../../components/TopicSelector';

const TOTAL_STEPS = 5;

const STEP_LABELS = ['Welcome', 'Location', 'Your Issues', 'Priorities', 'Your Profile'];

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

export default function VoterOnboarding() {
  const navigate = useNavigate();
  const { dispatch } = useApp();

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [zip, setZip] = useState('');
  const [topics, setTopics] = useState([]);
  const [priorities, setPriorities] = useState([]); // ordered top-3
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const zipValid = /^\d{5}$/.test(zip);

  function goTo(next) {
    setDir(next > step ? 1 : -1);
    setStep(next);
  }

  function togglePriority(topic) {
    setPriorities(prev => {
      if (prev.includes(topic)) return prev.filter(t => t !== topic);
      if (prev.length >= 3) return prev;
      return [...prev, topic];
    });
  }

  async function handleSubmit() {
    setError(''); setLoading(true);
    // Merge: priorities first (ranked), then rest of selected topics
    const orderedTags = [...priorities, ...topics.filter(t => !priorities.includes(t))];
    const res = await fetch('/api/auth/constituent/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, zip_code: zip, interest_tags: orderedTags }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error?.message || 'Something went wrong'); return; }
    dispatch({ type: 'SET_AUTH', payload: { token: data.token, role: 'constituent', user: data } });
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', 'constituent');
    localStorage.setItem('voterZip', zip);
    localStorage.setItem('voterTopics', JSON.stringify(orderedTags));
    navigate('/voter/dashboard');
  }

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--cream)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 sm:px-6 md:px-8 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <a href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--navy)' }}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="4" r="2.5" fill="white"/>
              <path d="M2 12c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display font-bold" style={{ color: 'var(--navy)' }}>TownHall AI</span>
        </a>
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          Step {step} of {TOTAL_STEPS} — {STEP_LABELS[step - 1]}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 w-full" style={{ background: 'var(--border)' }}>
        <motion.div
          className="h-full"
          style={{ background: 'var(--navy)' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />
      </div>

      {/* Step dots */}
      <div className="flex items-center justify-center gap-2 pt-6 pb-2">
        {STEP_LABELS.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{ background: i + 1 <= step ? 'var(--navy)' : 'var(--border)', transform: i + 1 === step ? 'scale(1.5)' : 'scale(1)' }}
            />
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {/* STEP 1 — Welcome */}
              {step === 1 && (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-8"
                    style={{ background: 'var(--navy)' }}
                  >
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <path d="M14 4L17 10L24 11L19 16L20 23L14 20L8 23L9 16L4 11L11 10L14 4Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                  <p className="section-label mb-4">Voter Onboarding</p>
                  <h1 className="font-display text-4xl font-bold mb-4" style={{ color: 'var(--navy)' }}>
                    Democracy works better when voters are informed.
                  </h1>
                  <span className="block w-12 h-0.5 mx-auto mb-6" style={{ background: 'var(--gold)' }} />
                  <p className="text-base leading-relaxed mb-10" style={{ color: 'var(--text-muted)' }}>
                    In 3 minutes, we'll find every candidate on your ballot and match them to your values.
                    You'll be able to have real conversations with each one — grounded in their own platform.
                  </p>
                  <div className="flex flex-col gap-3 mb-8 text-left max-w-sm mx-auto">
                    {[
                      'Find candidates running in your area',
                      'See how their positions align with your priorities',
                      'Chat directly with each candidate\'s AI representative',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" style={{ background: 'var(--navy)' }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => goTo(2)} className="btn-primary px-10 py-3.5 text-base">
                    Let's find your candidates →
                  </button>
                </div>
              )}

              {/* STEP 2 — Location */}
              {step === 2 && (
                <div>
                  <p className="section-label mb-4">Step 2 of 5</p>
                  <h2 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--navy)' }}>Where do you live?</h2>
                  <span className="block w-10 h-0.5 mb-6" style={{ background: 'var(--gold)' }} />
                  <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
                    Your ZIP code lets us find all the candidates running in your area — from local school board to national office.
                  </p>
                  <div className="mb-8">
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: 'var(--navy)' }}>ZIP Code</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={5}
                      placeholder="e.g. 97201"
                      value={zip}
                      onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                      className="input-field text-xl tracking-widest py-4"
                      autoFocus
                    />
                    {zip.length > 0 && !zipValid && (
                      <p className="text-xs mt-2" style={{ color: 'var(--red)' }}>Enter a valid 5-digit ZIP code</p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => goTo(1)} className="btn-outline px-6 py-3">← Back</button>
                    <button onClick={() => goTo(3)} disabled={!zipValid} className="btn-primary flex-1 py-3 disabled:opacity-40">
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3 — Issues */}
              {step === 3 && (
                <div>
                  <p className="section-label mb-4">Step 3 of 5</p>
                  <h2 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--navy)' }}>What issues matter to you?</h2>
                  <span className="block w-10 h-0.5 mb-4" style={{ background: 'var(--gold)' }} />
                  <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                    Select all the policy areas you care about. We'll match you with candidates who have strong positions on these issues.
                  </p>
                  <TopicSelector selected={topics} onChange={setTopics} label="" />
                  <div className="flex gap-3 mt-8">
                    <button onClick={() => goTo(2)} className="btn-outline px-6 py-3">← Back</button>
                    <button onClick={() => goTo(4)} disabled={topics.length === 0} className="btn-primary flex-1 py-3 disabled:opacity-40">
                      Continue with {topics.length} issue{topics.length !== 1 ? 's' : ''} →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4 — Priorities */}
              {step === 4 && (
                <div>
                  <p className="section-label mb-4">Step 4 of 5</p>
                  <h2 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--navy)' }}>What are your top 3 priorities?</h2>
                  <span className="block w-10 h-0.5 mb-4" style={{ background: 'var(--gold)' }} />
                  <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                    Click to rank your most important issues. This helps us surface the most relevant candidates first.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {topics.map(topic => {
                      const rank = priorities.indexOf(topic);
                      const isRanked = rank !== -1;
                      const rankLabel = ['1st', '2nd', '3rd'][rank];
                      return (
                        <button
                          key={topic}
                          onClick={() => togglePriority(topic)}
                          className="flex items-center justify-between px-4 py-3 text-sm font-medium transition-all"
                          style={{
                            background: isRanked ? 'var(--navy)' : 'white',
                            color: isRanked ? 'white' : 'var(--navy)',
                            border: `1.5px solid ${isRanked ? 'var(--navy)' : 'var(--border)'}`,
                            opacity: !isRanked && priorities.length >= 3 ? 0.4 : 1,
                          }}
                          disabled={!isRanked && priorities.length >= 3}
                        >
                          <span className="capitalize">{topic.replace(/-/g, ' ')}</span>
                          {isRanked && (
                            <span className="text-xs font-bold ml-2 px-1.5 py-0.5" style={{ background: 'var(--gold)', color: 'white' }}>
                              {rankLabel}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {priorities.length > 0 && (
                    <button
                      onClick={() => setPriorities([])}
                      className="text-xs mb-6 transition-opacity hover:opacity-70"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Clear selection
                    </button>
                  )}

                  <div className="flex gap-3 mt-4">
                    <button onClick={() => goTo(3)} className="btn-outline px-6 py-3">← Back</button>
                    <button onClick={() => goTo(5)} className="btn-primary flex-1 py-3">
                      {priorities.length > 0 ? `Continue with ${priorities.length} priorit${priorities.length > 1 ? 'ies' : 'y'} →` : 'Skip →'}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5 — Save profile */}
              {step === 5 && (
                <div>
                  <p className="section-label mb-4">Step 5 of 5</p>
                  <h2 className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--navy)' }}>Save your voter profile</h2>
                  <span className="block w-10 h-0.5 mb-4" style={{ background: 'var(--gold)' }} />
                  <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                    Enter your email to save your preferences and access your personalized voter dashboard.
                    No password needed — we'll send you a magic link.
                  </p>

                  {/* Summary of selections */}
                  <div className="p-4 mb-6" style={{ background: 'white', border: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-3 mb-3 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                      <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Your ZIP</div>
                      <div className="font-display font-bold" style={{ color: 'var(--navy)' }}>{zip}</div>
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                      Your top priorities
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(priorities.length > 0 ? priorities : topics.slice(0, 3)).map((t, i) => (
                        <span key={t} className="text-xs px-2.5 py-1 font-medium capitalize" style={{ background: 'var(--navy)', color: 'white' }}>
                          {priorities.length > 0 && i < 3 ? `${i + 1}. ` : ''}{t.replace(/-/g, ' ')}
                        </span>
                      ))}
                      {topics.length > 3 && priorities.length === 0 && (
                        <span className="text-xs px-2.5 py-1" style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                          +{topics.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-sm mb-4 px-3 py-2"
                      style={{ background: 'rgba(220,38,38,0.08)', color: 'var(--red)', border: '1px solid rgba(220,38,38,0.2)' }}
                    >{error}</motion.p>
                  )}

                  <div className="mb-6">
                    <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: 'var(--navy)' }}>Email Address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="input-field py-4"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => goTo(4)} className="btn-outline px-6 py-3">← Back</button>
                    <button
                      onClick={handleSubmit}
                      disabled={!email || loading}
                      className="btn-primary flex-1 py-3 disabled:opacity-40"
                    >
                      {loading ? 'Creating your profile…' : 'See my candidates →'}
                    </button>
                  </div>

                  <p className="text-xs mt-4 text-center" style={{ color: 'var(--text-muted)' }}>
                    Already have an account?{' '}
                    <a href="/auth/login" style={{ color: 'var(--navy)' }} className="font-medium">Sign in</a>
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
