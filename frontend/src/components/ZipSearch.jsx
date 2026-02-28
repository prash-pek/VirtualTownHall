import { useState } from 'react';
import TopicSelector from './TopicSelector';

export default function ZipSearch({ onSearch }) {
  const [zip, setZip] = useState('');
  const [topics, setTopics] = useState([]);

  function handleSubmit(e) {
    e.preventDefault();
    if (zip.match(/^\d{5}$/)) onSearch({ zip, topics });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Enter your ZIP code"
          value={zip}
          onChange={e => setZip(e.target.value)}
          maxLength={5}
          pattern="\d{5}"
          className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-blue-500 focus:outline-none"
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700">
          Find Candidates
        </button>
      </div>
      <TopicSelector selected={topics} onChange={setTopics} label="Filter by topics (optional)" />
    </form>
  );
}
