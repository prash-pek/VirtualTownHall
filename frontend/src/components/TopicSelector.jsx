const TOPICS = [
  { tag: 'economy', label: 'Economy & Jobs' },
  { tag: 'education', label: 'Education' },
  { tag: 'healthcare', label: 'Healthcare' },
  { tag: 'housing', label: 'Housing' },
  { tag: 'environment', label: 'Environment & Climate' },
  { tag: 'public-safety', label: 'Public Safety' },
  { tag: 'infrastructure', label: 'Infrastructure' },
  { tag: 'taxes', label: 'Taxes & Budget' },
  { tag: 'immigration', label: 'Immigration' },
  { tag: 'civil-rights', label: 'Civil Rights' },
  { tag: 'local-business', label: 'Local Business' },
  { tag: 'transportation', label: 'Transportation' },
  { tag: 'technology', label: 'Technology & Privacy' },
  { tag: 'veterans', label: 'Veterans' },
  { tag: 'gun-policy', label: 'Gun Policy' },
  { tag: 'foreign-policy', label: 'Foreign Policy' },
  { tag: 'social-services', label: 'Social Services' },
  { tag: 'agriculture', label: 'Agriculture' }
];

export default function TopicSelector({ selected, onChange, label }) {
  function toggle(tag) {
    onChange(selected.includes(tag) ? selected.filter(t => t !== tag) : [...selected, tag]);
  }

  return (
    <div>
      {label && <p className="text-sm text-gray-500 mb-2">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {TOPICS.map(t => (
          <button
            key={t.tag}
            type="button"
            onClick={() => toggle(t.tag)}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${selected.includes(t.tag) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
