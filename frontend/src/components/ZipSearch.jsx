import { useState } from 'react';
import TopicSelector from './TopicSelector';

export default function ZipSearch({ onSearch }) {
  const [zip, setZip] = useState('');
  const [topics, setTopics] = useState([]);
  const [showTopics, setShowTopics] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (zip.match(/^\d{5}$/)) onSearch({ zip, topics });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="section-label block mb-2">Your ZIP code</label>
        <div className="flex gap-0">
          <input
            type="text"
            placeholder="e.g. 97201"
            value={zip}
            onChange={e => setZip(e.target.value)}
            maxLength={5}
            pattern="\d{5}"
            className="input-field flex-1 text-base"
            style={{ borderRight: 'none' }}
          />
          <button
            type="submit"
            disabled={!zip.match(/^\d{5}/)}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            style={{ minWidth: '120px' }}
          >
            Find Candidates
          </button>
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowTopics(v => !v)}
          className="flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: showTopics ? 'var(--navy)' : 'var(--text-muted)' }}
        >
          <span
            className="inline-block transition-transform duration-200"
            style={{ transform: showTopics ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >▶</span>
          Filter by issues {topics.length > 0 && <span className="px-1.5 py-0.5 text-xs rounded-full text-white" style={{ background: 'var(--gold)' }}>{topics.length}</span>}
        </button>
        {showTopics && (
          <div className="mt-3">
            <TopicSelector selected={topics} onChange={setTopics} />
          </div>
        )}
      </div>
    </form>
  );
}
