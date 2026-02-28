const TOPICS = [
  { tag: 'economy', label: 'Economy & Jobs' },
  { tag: 'education', label: 'Education' },
  { tag: 'healthcare', label: 'Healthcare' },
  { tag: 'housing', label: 'Housing' },
  { tag: 'environment', label: 'Environment' },
  { tag: 'public-safety', label: 'Public Safety' },
  { tag: 'infrastructure', label: 'Infrastructure' },
  { tag: 'taxes', label: 'Taxes & Budget' },
  { tag: 'immigration', label: 'Immigration' },
  { tag: 'civil-rights', label: 'Civil Rights' },
  { tag: 'local-business', label: 'Local Business' },
  { tag: 'transportation', label: 'Transportation' },
  { tag: 'technology', label: 'Technology' },
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
      {label && <p className="section-label mb-3">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {TOPICS.map(t => {
          const active = selected.includes(t.tag);
          return (
            <button
              key={t.tag}
              type="button"
              onClick={() => toggle(t.tag)}
              className="px-3 py-1.5 text-xs font-medium tracking-wide transition-all duration-150"
              style={{
                border: '1.5px solid',
                borderColor: active ? 'var(--navy)' : 'var(--border)',
                background: active ? 'var(--navy)' : 'white',
                color: active ? 'white' : 'var(--ink)',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
