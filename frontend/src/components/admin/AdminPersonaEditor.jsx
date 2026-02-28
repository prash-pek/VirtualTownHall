import { useEffect, useState } from 'react';

const TONES = ['warm and approachable', 'direct and confident', 'thoughtful and evidence-based', 'formal and professional', 'conversational and relatable'];

export default function AdminPersonaEditor({ token }) {
  const [config, setConfig] = useState({ tone: '', style_guidelines: '', key_phrases: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/candidate/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(c => {
        const pc = typeof c.persona_config === 'string' ? JSON.parse(c.persona_config || '{}') : (c.persona_config || {});
        setConfig({ tone: pc.tone || '', style_guidelines: pc.style_guidelines || '', key_phrases: (pc.key_phrases || []).join(', ') });
      });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    await fetch('/api/candidate/persona', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ tone: config.tone, style_guidelines: config.style_guidelines, key_phrases: config.key_phrases.split(',').map(s => s.trim()).filter(Boolean) })
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSave} className="bg-white rounded-xl shadow p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium mb-2">Communication Tone</label>
        <div className="grid grid-cols-1 gap-2">
          {TONES.map(t => (
            <label key={t} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50">
              <input type="radio" name="tone" value={t} checked={config.tone === t} onChange={() => setConfig(c => ({ ...c, tone: t }))} />
              <span className="text-sm capitalize">{t}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Style Guidelines</label>
        <textarea value={config.style_guidelines} onChange={e => setConfig(c => ({ ...c, style_guidelines: e.target.value }))} rows={4} placeholder="e.g. Lead with data, use plain language, avoid jargon..." className="w-full border rounded-lg px-4 py-3" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Key Phrases (comma-separated)</label>
        <input value={config.key_phrases} onChange={e => setConfig(c => ({ ...c, key_phrases: e.target.value }))} placeholder="e.g. community first, practical solutions, working together" className="w-full border rounded-lg px-4 py-2" />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
        {saved ? 'Saved!' : 'Save Persona'}
      </button>
    </form>
  );
}
