import { useEffect, useState } from 'react';

export default function Settings() {
  const [form, setForm] = useState({ name: '', bio: '', donation_url: '', party: '' });
  const [saved, setSaved] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('/api/candidate/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(c => setForm({ name: c.name || '', bio: c.bio || '', donation_url: c.donation_url || '', party: c.party || '' }));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    await fetch('/api/candidate/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <form onSubmit={handleSave} className="space-y-4 bg-white rounded-xl p-6 shadow">
        <div><label className="block text-sm font-medium mb-1">Full Name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border rounded-lg px-4 py-2" /></div>
        <div><label className="block text-sm font-medium mb-1">Biography</label><textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={4} className="w-full border rounded-lg px-4 py-2" /></div>
        <div><label className="block text-sm font-medium mb-1">Party Affiliation</label><input value={form.party} onChange={e => setForm(f => ({ ...f, party: e.target.value }))} className="w-full border rounded-lg px-4 py-2" /></div>
        <div><label className="block text-sm font-medium mb-1">Donation Page URL</label><input type="url" value={form.donation_url} onChange={e => setForm(f => ({ ...f, donation_url: e.target.value }))} className="w-full border rounded-lg px-4 py-2" /></div>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
