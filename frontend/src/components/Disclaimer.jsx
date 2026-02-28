export default function Disclaimer({ candidateName }) {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 mt-2 text-xs leading-relaxed"
      style={{
        background: 'rgba(245,166,35,0.08)',
        borderLeft: '3px solid var(--gold)',
        color: 'var(--text-muted)',
      }}
    >
      <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" stroke="var(--gold)" strokeWidth="1.5"/>
        <path d="M7 4v3M7 9v1" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <span>
        <strong style={{ color: 'var(--gold)', fontWeight: 600 }}>AI Representation</strong> — This is an AI-generated representation based on materials provided by {candidateName}. It is not {candidateName} speaking directly.
      </span>
    </div>
  );
}
