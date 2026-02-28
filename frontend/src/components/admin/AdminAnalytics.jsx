import { useEffect, useState } from 'react';

export default function AdminAnalytics({ token }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/candidate/analytics', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div className="text-gray-400">Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Conversations', value: data.total_conversations },
          { label: 'Authenticated', value: data.authenticated_conversations },
          { label: 'Anonymous', value: data.anonymous_conversations },
          { label: 'Unique Constituents', value: data.unique_constituents },
          { label: 'Avg Messages', value: data.avg_messages_per_conversation }
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl shadow p-4">
            <div className="text-2xl font-bold text-blue-600">{stat.value ?? '—'}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {data.top_questions?.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-bold mb-4">Top Topics from Constituents</h3>
          <div className="space-y-3">
            {data.top_questions.map((q, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="capitalize font-medium text-gray-700 w-32">{q.topic}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${Math.min(100, (q.count / data.top_questions[0].count) * 100)}%` }} />
                </div>
                <span className="text-sm text-gray-500 w-12 text-right">{q.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
