import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import CandidateProfile from '../components/CandidateProfile';

export default function CandidateProfilePage() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);

  useEffect(() => {
    fetch(`/api/candidates/${id}/profile`).then(r => r.json()).then(setCandidate);
  }, [id]);

  if (!candidate) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <CandidateProfile candidate={candidate} />
      <div className="mt-6 flex gap-4">
        <Link to={`/candidate/${id}/chat`} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
          Chat with {candidate.name}
        </Link>
        <Link to={`/candidate/${id}/audit`} className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50">
          View Audit Trail
        </Link>
      </div>
    </div>
  );
}
