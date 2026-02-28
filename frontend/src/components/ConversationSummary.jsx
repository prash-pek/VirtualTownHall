import { Link } from 'react-router-dom';

export default function ConversationSummary({ summary, candidateName }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-xl font-bold mb-4">Conversation Summary</h3>
        <p className="text-gray-700 leading-relaxed mb-6">{summary}</p>
        <div className="flex gap-3">
          <Link to="/" className="flex-1 text-center border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
            Find More Candidates
          </Link>
        </div>
      </div>
    </div>
  );
}
