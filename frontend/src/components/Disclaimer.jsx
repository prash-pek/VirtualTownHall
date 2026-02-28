export default function Disclaimer({ candidateName }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mt-2 text-xs text-amber-800">
      This is an AI-generated representation based on materials provided by {candidateName}. It is not {candidateName} speaking directly.
    </div>
  );
}
