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
    <div className="p-8 max-w-2xl">
      <p className="section-label mb-2">Settings</p>
      <h2 className="font-display text-3xl font-bold mb-8" style={{ color: 'var(--navy)' }}>Profile & Settings</h2>
      <form onSubmit={handleSave} className="space-y-4 card p-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--navy)' }}>Full Name</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--navy)' }}>Biography</label>
          <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={4} className="input-field" style={{ resize: 'vertical' }} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--navy)' }}>Party Affiliation</label>
          <input value={form.party} onChange={e => setForm(f => ({ ...f, party: e.target.value }))} className="input-field" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--navy)' }}>Donation Page URL</label>
          <input type="url" value={form.donation_url} onChange={e => setForm(f => ({ ...f, donation_url: e.target.value }))} className="input-field" placeholder="https://..." />
        </div>
        <button type="submit" className="btn-primary px-8 py-3">
          {saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
