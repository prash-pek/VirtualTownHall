import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CandidateCard from '../components/CandidateCard';

export default function CandidateList() {
  const [searchParams] = useSearchParams();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const zip = searchParams.get('zip');
    const topics = searchParams.get('topics');
    const query = new URLSearchParams({ zip });
    if (topics) query.set('topics', topics);

    fetch(`/api/candidates?${query}`)
      .then(r => r.json())
      .then(data => { setCandidates(data); setLoading(false); });
  }, [searchParams]);

  if (loading) return <div className="p-8 text-center">Loading candidates...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Candidates in your area</h2>
      {candidates.length === 0
        ? <p className="text-gray-500">No candidates found for this ZIP code.</p>
        : <div className="grid gap-4">{candidates.map(c => <CandidateCard key={c.id} candidate={c} />)}</div>
      }
    </div>
  );
}
