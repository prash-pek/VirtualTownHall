import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ZipSearch from '../components/ZipSearch';

const STATS = [
  { value: '538', label: 'Electoral Votes' },
  { value: '535', label: 'Members of Congress' },
  { value: '500K+', label: 'Local Races' },
];

export default function Landing() {
  const navigate = useNavigate();

  function handleSearch({ zip, topics }) {
    const params = new URLSearchParams({ zip });
    if (topics.length) params.set('topics', topics.join(','));
    navigate(`/candidates?${params.toString()}`);
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream)' }}>
      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between px-8 py-5"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 flex items-center justify-center rounded-full" style={{ background: 'var(--navy)' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="4" r="2.5" fill="white"/>
              <path d="M2 12c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display font-700 text-lg tracking-tight" style={{ color: 'var(--navy)' }}>TownHall</span>
          <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ background: 'var(--gold)', color: 'white', letterSpacing: '0.05em' }}>AI</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="/auth/login" className="text-sm font-medium transition-colors" style={{ color: 'var(--text-muted)' }}
             onMouseEnter={e => e.target.style.color = 'var(--navy)'}
             onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
            Sign In
          </a>
          <a href="/auth/register" className="btn-primary text-xs py-2 px-4">
            Register as Candidate
          </a>
        </div>
      </motion.nav>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-8 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: Headline */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="section-label mb-6"
            >
              Civic Technology — Est. 2026
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
              className="font-display text-6xl lg:text-7xl leading-none tracking-tight mb-6"
              style={{ color: 'var(--navy)' }}
            >
              Every voter deserves a real conversation.
            </motion.h1>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="block w-16 h-0.5 mb-6 origin-left"
              style={{ background: 'var(--gold)' }}
            />
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-lg leading-relaxed mb-10"
              style={{ color: 'var(--text-muted)' }}
            >
              TownHall AI lets you have a personal conversation with every candidate on your ballot —
              grounded in their own words, policy papers, and platform. Not spin. Not ads. Real positions.
            </motion.p>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex gap-8 pt-8"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              {STATS.map((s, i) => (
                <div key={i}>
                  <div className="font-display text-2xl font-bold" style={{ color: 'var(--navy)' }}>{s.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Search panel */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.6, ease: 'easeOut' }}
          >
            {/* Panel header */}
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

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="max-w-6xl mx-auto px-8 py-16"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <p className="section-label mb-10">How it works</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { n: '01', title: 'Enter your ZIP', body: 'See every candidate on your ballot — from school board to Senate.' },
            { n: '02', title: 'Start a conversation', body: 'Ask anything. The AI responds using only the candidate\'s verified materials.' },
            { n: '03', title: 'Vote with confidence', body: 'Compare positions, check alignment scores, and make an informed decision.' },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
            >
              <div className="font-display text-5xl font-bold mb-4 opacity-15" style={{ color: 'var(--navy)' }}>{step.n}</div>
              <h3 className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--navy)' }}>{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.body}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <div className="px-8 py-6 text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span>© 2026 TownHall AI — AI-powered civic communication</span>
          <span>All AI conversations are based on candidate-provided materials</span>
        </div>
      </div>
    </div>
  );
}
