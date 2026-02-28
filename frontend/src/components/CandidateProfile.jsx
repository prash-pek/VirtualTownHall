import AlignmentBadge from './AlignmentBadge';
import VerificationBadge from './VerificationBadge';

export default function CandidateProfile({ candidate }) {
  const topics = [...new Set((candidate.contexts || []).flatMap(c => JSON.parse(c.topic_tags || '[]')))];

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold">{candidate.name}</h1>
            {candidate.is_verified === 1 && <VerificationBadge />}
          </div>
          <p className="text-gray-600">{candidate.office} — {candidate.district}</p>
          {candidate.party && <p className="text-gray-400 text-sm">{candidate.party}</p>}
        </div>
        {candidate.alignment_score != null && <AlignmentBadge score={candidate.alignment_score} size="lg" />}
      </div>

      {candidate.bio && <p className="text-gray-700 mb-4">{candidate.bio}</p>}

      {topics.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-500 mb-2">Topics covered</p>
          <div className="flex flex-wrap gap-2">
            {topics.map(t => <span key={t} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">{t}</span>)}
          </div>
        </div>
      )}

      {candidate.alignment_rationale && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm text-gray-600">
          <span className="font-medium">Alignment note: </span>{candidate.alignment_rationale}
        </div>
      )}

      {candidate.donation_url && (
        <a href={candidate.donation_url} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
          Donate to {candidate.name}
        </a>
      )}
    </div>
  );
}
