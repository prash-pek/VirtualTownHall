import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ChatInterface from '../components/ChatInterface';
import Disclaimer from '../components/Disclaimer';

export default function ChatPage() {
  const { id: candidateId } = useParams();
  const location = useLocation();
  const from = location.state?.from || '/candidates';
  const [conversationId, setConversationId] = useState(null);
  const [candidate, setCandidate] = useState(null);

  useEffect(() => {
    fetch(`/api/candidates/${candidateId}/profile`).then(r => r.json()).then(setCandidate);
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    fetch('/api/conversations', { method: 'POST', headers, body: JSON.stringify({ candidate_id: candidateId }) })
      .then(r => r.json()).then(data => setConversationId(data.id));
  }, [candidateId]);

  if (!conversationId || !candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cream)' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-8 h-8 mx-auto mb-3 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--navy)', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Starting conversation…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--cream)' }}>
      {/* Chat header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ background: 'var(--navy)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                to={`/candidate/${candidateId}`}
                state={{ from }}
                className="text-xs font-medium mb-1 flex items-center gap-1 transition-opacity hover:opacity-70"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                ← Back to profile
              </Link>
              <h2 className="font-display text-xl font-semibold text-white">{candidate.name}</h2>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{candidate.office} · {candidate.district}</p>
            </div>
            {candidate.is_paused === 1 && (
              <span className="text-xs font-semibold px-3 py-1.5" style={{ background: 'rgba(220,38,38,0.2)', color: '#FCA5A5' }}>
                AI Paused
              </span>
            )}
          </div>
          <Disclaimer candidateName={candidate.name} />
        </div>
      </motion.div>

      {/* Chat body */}
      <div className="flex-1 min-h-0 max-w-3xl w-full mx-auto flex flex-col">
        <ChatInterface conversationId={conversationId} candidateName={candidate.name} />
      </div>
    </div>
  );
}
