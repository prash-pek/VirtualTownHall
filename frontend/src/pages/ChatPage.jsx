import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ChatInterface from '../components/ChatInterface';
import Disclaimer from '../components/Disclaimer';

export default function ChatPage() {
  const { id: candidateId } = useParams();
  const [conversationId, setConversationId] = useState(null);
  const [candidate, setCandidate] = useState(null);

  useEffect(() => {
    fetch(`/api/candidates/${candidateId}/profile`).then(r => r.json()).then(setCandidate);
    fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_id: candidateId })
    }).then(r => r.json()).then(data => setConversationId(data.id));
  }, [candidateId]);

  if (!conversationId || !candidate) return <div className="p-8 text-center">Starting conversation...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col h-screen">
      <div className="mb-4">
        <h2 className="text-xl font-bold">{candidate.name}</h2>
        <p className="text-gray-500 text-sm">{candidate.office} — {candidate.district}</p>
        <Disclaimer candidateName={candidate.name} />
      </div>
      <ChatInterface conversationId={conversationId} candidateName={candidate.name} />
    </div>
  );
}
