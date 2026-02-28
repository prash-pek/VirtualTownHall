import { useEffect, useState } from 'react';

export default function AdminKillSwitch({ token }) {
  const [paused, setPaused] = useState(false);
  const [blockedTopics, setBlockedTopics] = useState([]);
  const [newTopic, setNewTopic] = useState({ topic: '', redirect_message: '', redirect_url: '' });

  function loadData() {
    fetch('/api/candidate/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(c => setPaused(!!c.is_paused));
    // Blocked topics come from the profile endpoint contexts — we'd need a dedicated endpoint in v2
    // For MVP, we show what's returned in context
  }

  useEffect(loadData, []);

  async function toggleGlobalPause() {
    const method = paused ? 'DELETE' : 'POST';
    await fetch('/api/candidate/kill-switch', { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: paused ? undefined : JSON.stringify({ global: true }) });
    setPaused(!paused);
  }

  async function addBlockedTopic(e) {
    e.preventDefault();
    const res = await fetch('/api/candidate/blocked-topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(newTopic)
    });
    if (res.ok) {
      const added = await res.json();
      setBlockedTopics(bt => [...bt, added]);
      setNewTopic({ topic: '', redirect_message: '', redirect_url: '' });
    }
  }

  return (
    <div className="space-y-6">
      <div className={`rounded-xl p-6 border-2 ${paused ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Global Kill Switch</h3>
            <p className="text-sm text-gray-500">Immediately pause all AI conversations for your profile.</p>
          </div>
          <button onClick={toggleGlobalPause} className={`px-5 py-2 rounded-lg font-semibold ${paused ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'}`}>
            {paused ? 'Resume AI' : 'Pause AI'}
          </button>
        </div>
        {paused && <p className="mt-3 text-red-700 text-sm font-medium">AI conversations are currently paused.</p>}
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold mb-4">Add Blocked Topic</h3>
        <form onSubmit={addBlockedTopic} className="space-y-3">
          <input value={newTopic.topic} onChange={e => setNewTopic(t => ({ ...t, topic: e.target.value }))} placeholder="Topic (e.g. personal finances)" required className="w-full border rounded-lg px-4 py-2" />
          <textarea value={newTopic.redirect_message} onChange={e => setNewTopic(t => ({ ...t, redirect_message: e.target.value }))} placeholder="Redirect message shown to voters" rows={2} className="w-full border rounded-lg px-4 py-2" />
          <input value={newTopic.redirect_url} onChange={e => setNewTopic(t => ({ ...t, redirect_url: e.target.value }))} placeholder="Redirect URL (optional)" className="w-full border rounded-lg px-4 py-2" />
          <button type="submit" className="bg-gray-800 text-white px-5 py-2 rounded-lg font-semibold hover:bg-gray-900">Add Blocked Topic</button>
        </form>
      </div>
    </div>
  );
}
