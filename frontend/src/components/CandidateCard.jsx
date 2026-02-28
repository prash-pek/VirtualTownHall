import { Link } from 'react-router-dom';
import AlignmentBadge from './AlignmentBadge';
import VerificationBadge from './VerificationBadge';

export default function CandidateCard({ candidate }) {
  return (
    <Link to={`/candidate/${candidate.id}`} className="block bg-white rounded-xl shadow hover:shadow-md transition-shadow p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg text-gray-900">{candidate.name}</h3>
            {candidate.is_verified === 1 && <VerificationBadge />}
          </div>
          <p className="text-gray-500 text-sm">{candidate.office}</p>
          <p className="text-gray-400 text-sm">{candidate.district} {candidate.party && `· ${candidate.party}`}</p>
        </div>
        {candidate.alignment_score != null && <AlignmentBadge score={candidate.alignment_score} />}
      </div>
    </Link>
  );
}
