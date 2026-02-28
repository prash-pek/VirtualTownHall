import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatMessage from './ChatMessage';
import ConversationSummary from './ConversationSummary';

export default function ChatInterface({ conversationId, candidateName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [ended, setEnded] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const messageContent = input.trim();
    const userMsg = { role: 'user', content: messageContent, timestamp: new Date().toISOString() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);

    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST', headers, body: JSON.stringify({ content: messageContent })
      });
      const data = await res.json();
      if (data.content) {
        setMessages(m => [...m, { role: 'assistant', content: data.content, timestamp: data.timestamp }]);
      }
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'I encountered an error. Please try again.', timestamp: new Date().toISOString() }]);
    }
    setLoading(false);
  }

  async function endConversation() {
    setLoading(true);
    const res = await fetch(`/api/conversations/${conversationId}/end`, { method: 'POST' });
    const data = await res.json();
    setSummary(data.summary);
    setEnded(true);
    setLoading(false);
  }

  if (ended && summary) return <ConversationSummary summary={summary} candidateName={candidateName} />;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Message thread */}
      <div className="flex-1 overflow-y-auto space-y-4 py-6 px-4">
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center pt-12"
            >
              <div className="font-display text-3xl font-bold mb-2" style={{ color: 'var(--border)' }}>Ask anything.</div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                What would you like to know about {candidateName}'s platform?
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.map((m, i) => <ChatMessage key={i} message={m} />)}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mr-2 text-white text-xs font-bold" style={{ background: 'var(--navy)' }}>AI</div>
            <div className="px-4 py-3" style={{ border: '1px solid var(--border)', background: 'white' }}>
              <div className="flex gap-1 items-center h-4">
                {[0,1,2].map(i => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--text-muted)' }}
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{ borderTop: '1px solid var(--border)', background: 'var(--cream)' }}>
        {messages.length >= 3 && (
          <div className="px-4 pt-3 flex justify-end">
            <button
              onClick={endConversation}
              disabled={loading}
              className="text-xs font-medium px-3 py-1.5 transition-colors disabled:opacity-40"
              style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--navy)'; e.target.style.color = 'var(--navy)'; }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-muted)'; }}
            >
              End & get summary
            </button>
          </div>
        )}
        <form onSubmit={sendMessage} className="flex gap-0 p-4">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Ask about ${candidateName}'s platform…`}
            disabled={loading}
            className="input-field flex-1 text-sm"
            style={{ borderRight: 'none' }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ minWidth: '80px' }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
