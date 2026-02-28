import { useState, useRef, useEffect } from 'react';
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

    const userMsg = { role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);

    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, { method: 'POST', headers, body: JSON.stringify({ content: input }) });
      const data = await res.json();
      if (data.content) setMessages(m => [...m, { role: 'assistant', content: data.content, timestamp: data.timestamp }]);
    } catch (err) {
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
      <div className="flex-1 overflow-y-auto space-y-4 py-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-8">Ask {candidateName}'s AI representative anything about their platform.</p>
        )}
        {messages.map((m, i) => <ChatMessage key={i} message={m} />)}
        {loading && <div className="flex justify-start"><div className="bg-gray-100 rounded-2xl px-4 py-3 text-gray-500 text-sm animate-pulse">Thinking...</div></div>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-3 pt-4 border-t">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about their platform..."
          disabled={loading}
          className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none"
        />
        <button type="submit" disabled={loading || !input.trim()} className="bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50">
          Send
        </button>
        {messages.length > 2 && (
          <button type="button" onClick={endConversation} className="border border-gray-300 px-4 py-3 rounded-xl text-sm hover:bg-gray-50">
            End & Summarize
          </button>
        )}
      </form>
    </div>
  );
}
