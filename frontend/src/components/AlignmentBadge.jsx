export default function AlignmentBadge({ score, size = 'sm' }) {
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
  const bg = score >= 80 ? 'bg-green-50 border-green-200' : score >= 60 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';
  const textSize = size === 'lg' ? 'text-2xl' : 'text-lg';

  return (
    <div className={`border rounded-xl px-3 py-2 text-center ${bg}`}>
      <div className={`font-bold ${color} ${textSize}`}>{Math.round(score)}%</div>
      <div className="text-xs text-gray-500">Alignment</div>
    </div>
  );
}
