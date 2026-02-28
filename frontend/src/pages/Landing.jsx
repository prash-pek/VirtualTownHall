import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ZipSearch from '../components/ZipSearch';

const STATS = [
  { value: '538', label: 'Electoral Votes' },
  { value: '535', label: 'Members of Congress' },
  { value: '500K+', label: 'Local Races' },
];

const CANDIDATE_FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 5h14M4 9h10M4 13h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <rect x="12" y="12" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M15 16h2M15 18h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Upload Your Platform',
    body: 'Drop in PDFs, white papers, speeches, and policy documents. The AI speaks only from your verified materials — never fabricating a position you don\'t hold.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M11 7v4l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Available 24/7',
    body: 'Your AI representative answers constituent questions around the clock — while your staff sleeps. No hold times, no generic form letters.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 17l4-4 3 3 4-5 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="3" y="3" width="16" height="16" rx="1" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
    title: 'Constituent Intelligence',
    body: 'See exactly what voters are asking about — ranked by topic, frequency, and geography. Stop guessing what matters to your district.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3l2.5 5.5L19 9.5l-4 4 1 5.5L11 16.5 6 19l1-5.5-4-4 5.5-1L11 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Verified & Trusted',
    body: 'A platform-issued verification badge tells voters this is the real you. An Alignment Score shows your AI reflects your public record — full transparency.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="5" y="9" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M8 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="11" cy="14" r="1.5" fill="currentColor"/>
      </svg>
    ),
    title: 'Full Control',
    body: 'Block topics you\'re not ready to address. Activate a global kill switch in one click if breaking news demands it. You\'re always in charge.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 4v2M11 16v2M4 11H2M20 11h-2M6.34 6.34L4.93 4.93M17.07 17.07l-1.41-1.41M6.34 15.66l-1.41 1.41M17.07 4.93l-1.41 1.41" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="11" cy="11" r="3.5" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
    title: 'Drive Donations',
    body: 'Attach your donation link to your profile and surface it naturally at the end of conversations. Turn civic engagement into campaign support.',
  },
];

const PAIN_POINTS = [
  { stat: '~40%', text: 'of down-ballot races decided by voters who don\'t know the candidates' },
  { stat: '100s', text: 'of constituent calls go unanswered by understaffed campaign offices daily' },
  { stat: '0', text: 'personal conversations most candidates have with the majority of their voters' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { delay, duration: 0.5, ease: 'easeOut' },
});

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleSearch({ zip, topics }) {
    const params = new URLSearchParams({ zip });
    if (topics.length) params.set('topics', topics.join(','));
    navigate(`/candidates?${params.toString()}`);
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream)' }}>

      {/* ── Nav ── */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 transition-all duration-300"
        style={{
          background: scrolled ? 'var(--navy)' : 'var(--cream)',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--border)',
          boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.15)' : 'none',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 flex items-center justify-center rounded-full" style={{ background: scrolled ? 'rgba(255,255,255,0.15)' : 'var(--navy)' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="4" r="2.5" fill="white"/>
              <path d="M2 12c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display font-bold text-lg tracking-tight" style={{ color: scrolled ? 'white' : 'var(--navy)' }}>TownHall</span>
          <span className="text-xs font-semibold px-1.5 py-0.5" style={{ background: 'var(--gold)', color: 'white', letterSpacing: '0.05em' }}>AI</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#for-voters"
            className="text-sm font-medium transition-colors"
            style={{ color: scrolled ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)' }}
            onMouseEnter={e => e.target.style.color = scrolled ? 'white' : 'var(--navy)'}
            onMouseLeave={e => e.target.style.color = scrolled ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)'}
          >
            For Voters
          </a>
          <a href="#for-candidates"
            className="text-sm font-medium transition-colors"
            style={{ color: scrolled ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)' }}
            onMouseEnter={e => e.target.style.color = scrolled ? 'white' : 'var(--navy)'}
            onMouseLeave={e => e.target.style.color = scrolled ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)'}
          >
            For Candidates
          </a>
          <Link to="/auth/login"
            className="text-sm font-medium transition-colors"
            style={{ color: scrolled ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)' }}
            onMouseEnter={e => e.target.style.color = scrolled ? 'white' : 'var(--navy)'}
            onMouseLeave={e => e.target.style.color = scrolled ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)'}
          >
            Sign In
          </Link>
          <Link to="/onboarding"
            className="text-xs py-2 px-5 font-semibold tracking-wide transition-all"
            style={{ background: scrolled ? 'var(--gold)' : 'var(--navy)', color: 'white' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Get Started →
          </Link>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <div className="max-w-6xl mx-auto px-8 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="section-label mb-6">
              Civic Technology — Est. 2026
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
              className="font-display text-6xl lg:text-7xl leading-none tracking-tight mb-6"
              style={{ color: 'var(--navy)' }}
            >
              Every voter deserves a real conversation.
            </motion.h1>
            <motion.span
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="block w-16 h-0.5 mb-6 origin-left"
              style={{ background: 'var(--gold)' }}
            />
            <motion.p
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-lg leading-relaxed mb-10" style={{ color: 'var(--text-muted)' }}
            >
              TownHall AI lets you have a personal conversation with every candidate on your ballot —
              grounded in their own words, policy papers, and platform. Not spin. Not ads. Real positions.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="flex gap-8 pt-8" style={{ borderTop: '1px solid var(--border)' }}
            >
              {STATS.map((s, i) => (
                <div key={i}>
                  <div className="font-display text-2xl font-bold" style={{ color: 'var(--navy)' }}>{s.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.6, ease: 'easeOut' }}
          >
            <div className="px-8 pt-8 pb-6" style={{ background: 'var(--navy)' }}>
              <p className="section-label mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Find your candidates</p>
              <h2 className="font-display text-2xl text-white">Who's on your ballot?</h2>
            </div>
            <div className="p-8 card">
              <ZipSearch onSearch={handleSearch} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── How it works (voters) ── */}
      <div id="for-voters" className="max-w-6xl mx-auto px-8 py-16" style={{ borderTop: '1px solid var(--border)' }}>
        <motion.p {...fadeUp()} className="section-label mb-10">For voters — how it works</motion.p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { n: '01', title: 'Enter your ZIP', body: 'See every candidate on your ballot — from school board to Senate — in one place.' },
            { n: '02', title: 'Start a conversation', body: 'Ask anything. The AI responds only from the candidate\'s own verified materials.' },
            { n: '03', title: 'Vote with confidence', body: 'Compare positions across races, check alignment scores, and make an informed decision.' },
          ].map((step, i) => (
            <motion.div key={i} {...fadeUp(i * 0.1)}>
              <div className="font-display text-5xl font-bold mb-4" style={{ color: 'var(--navy)', opacity: 0.12 }}>{step.n}</div>
              <h3 className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--navy)' }}>{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── The Problem (candidate pitch setup) ── */}
      <div style={{ background: 'var(--ink)' }} id="for-candidates">
        <div className="max-w-6xl mx-auto px-8 py-20">
          <motion.div {...fadeUp()} className="max-w-2xl mb-16">
            <p className="section-label mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>The problem</p>
            <h2 className="font-display text-5xl font-bold text-white leading-tight mb-4">
              Political communication is broken.
            </h2>
            <span className="block w-14 h-0.5 mb-6" style={{ background: 'var(--gold)' }} />
            <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Candidates broadcast to everyone and reach no one personally. Voters get ads, not answers.
              Staff get buried in calls. Down-ballot races — the ones that most directly affect daily life —
              go decided by voters who barely know who's on the ticket.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: 'rgba(255,255,255,0.08)' }}>
            {PAIN_POINTS.map((p, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.12)}
                className="px-8 py-10"
                style={{ background: 'var(--ink)' }}
              >
                <div className="font-display text-5xl font-bold mb-3" style={{ color: 'var(--gold)' }}>{p.stat}</div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{p.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── For Candidates: value prop ── */}
      <div style={{ background: 'var(--navy)' }}>
        <div className="max-w-6xl mx-auto px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-16">
            <motion.div {...fadeUp()}>
              <p className="section-label mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>For candidates</p>
              <h2 className="font-display text-5xl font-bold text-white leading-tight mb-4">
                Scale your voice. Understand your voters.
              </h2>
              <span className="block w-14 h-0.5 mb-6" style={{ background: 'var(--gold)' }} />
              <p className="text-base leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
                TownHall AI gives every candidate — from local school board to national office —
                an always-available AI representative that engages voters in substantive policy conversations.
                You upload your platform. We handle the conversations. You get the intelligence.
              </p>
              <Link to="/auth/register" className="btn-gold inline-flex">
                Register your candidacy →
              </Link>
            </motion.div>

            {/* Pull quote */}
            <motion.div {...fadeUp(0.15)} className="lg:pt-8">
              <div className="px-8 py-8" style={{ borderLeft: '4px solid var(--gold)' }}>
                <p className="font-display text-2xl italic text-white leading-snug mb-4">
                  "This is the positive use case for AI-generated likenesses — not deception, but deeper democratic access."
                </p>
                <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--gold)' }}>
                  TownHall AI — Core Thesis
                </span>
              </div>
            </motion.div>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: 'rgba(255,255,255,0.1)' }}>
            {CANDIDATE_FEATURES.map((f, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.07)}
                className="px-7 py-8 group"
                style={{ background: 'var(--navy)' }}
                whileHover={{ background: 'rgba(15,37,87,0.7)' }}
              >
                <div className="mb-4" style={{ color: 'var(--gold)' }}>{f.icon}</div>
                <h3 className="font-display text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── How onboarding works (candidates) ── */}
      <div style={{ background: 'var(--cream)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-8 py-20">
          <motion.div {...fadeUp()} className="mb-14">
            <p className="section-label mb-3">Candidate onboarding</p>
            <h2 className="font-display text-4xl font-bold" style={{ color: 'var(--navy)' }}>
              Live in minutes. Not months.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { n: '01', title: 'Register', body: 'Create your candidate account with your office, district, and party.' },
              { n: '02', title: 'Upload your platform', body: 'Add PDFs, speeches, policy papers, or type positions directly.' },
              { n: '03', title: 'Configure your persona', body: 'Set your AI\'s tone, style, and which topics it will or won\'t address.' },
              { n: '04', title: 'Go live', body: 'Get verified, publish your profile, and start reaching voters at scale.' },
            ].map((step, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)}>
                <div className="font-display text-4xl font-bold mb-3" style={{ color: 'var(--navy)', opacity: 0.12 }}>{step.n}</div>
                <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--navy)' }}>{step.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <motion.div
        {...fadeUp()}
        style={{ background: 'var(--gold)' }}
      >
        <div className="max-w-6xl mx-auto px-8 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-3xl font-bold text-white mb-1">Ready to reach every voter?</h3>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Free for local candidates. Get your AI representative live today.
            </p>
          </div>
          <div className="flex gap-4 flex-shrink-0">
            <Link
              to="/auth/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 font-semibold text-sm tracking-wide transition-all"
              style={{ background: 'var(--navy)', color: 'white' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--ink)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--navy)'}
            >
              Register as Candidate
            </Link>
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 px-7 py-3.5 font-semibold text-sm tracking-wide transition-all"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Footer ── */}
      <div className="px-8 py-6 text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <span>© 2026 TownHall AI — AI-powered civic communication</span>
          <span>All AI conversations are grounded in candidate-provided materials only</span>
        </div>
      </div>

    </div>
  );
}
