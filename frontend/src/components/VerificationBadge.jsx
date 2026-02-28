export default function VerificationBadge({ showLabel = false }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold tracking-wide px-2 py-0.5"
      style={{
        background: 'var(--navy)',
        color: 'white',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}
      title="Verified candidate"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {showLabel && 'Verified'}
    </span>
  );
}
