export default function AlignmentBadge({ score, size = 'sm' }) {
  const color = score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--gold)' : 'var(--red)';
  const label = score >= 80 ? 'High' : score >= 60 ? 'Moderate' : 'Low';

  if (size === 'lg') {
    return (
      <div className="text-center">
        <div
          className="relative inline-flex items-center justify-center w-20 h-20 rounded-full border-4"
          style={{ borderColor: color }}
        >
          <span className="font-display font-bold text-xl" style={{ color }}>{Math.round(score)}</span>
          <span className="absolute -bottom-0.5 text-xs font-semibold" style={{ color, fontSize: '10px' }}>%</span>
        </div>
        <div className="text-xs mt-1.5 font-semibold tracking-wide" style={{ color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label} Alignment</div>
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold tracking-wide"
      style={{
        border: '1.5px solid',
        borderColor: color,
        color,
        background: `${color}12`,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {Math.round(score)}% aligned
    </div>
  );
}
