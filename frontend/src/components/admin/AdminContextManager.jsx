import { useState, useEffect } from 'react';
import TopicSelector from '../TopicSelector';

export default function AdminContextManager({ token, contexts: externalContexts, onUpload, onDelete }) {
  const [tab, setTab] = useState('upload');
  const [file, setFile] = useState(null);
  const [manualText, setManualText] = useState('');
  const [topics, setTopics] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [internalContexts, setInternalContexts] = useState([]);

  const isSelfManaged = !externalContexts;
  const contexts = isSelfManaged ? internalContexts : externalContexts;

  function loadContexts() {
    fetch('/api/candidate/context', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setInternalContexts(Array.isArray(data) ? data : []));
  }

  useEffect(() => { if (isSelfManaged) loadContexts(); }, []);

  async function handleUpload(e) {
    e.preventDefault();
    setUploading(true);
    setMessage('');

    const formData = new FormData();
    if (tab === 'upload' && file) {
      formData.append('file', file);
    } else {
      formData.append('content_text', manualText);
    }
    formData.append('topic_tags', JSON.stringify(topics));

    const res = await fetch('/api/candidate/context', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (res.ok) {
      setMessage('Uploaded successfully. Alignment score updating...');
      setFile(null); setManualText(''); setTopics([]);
      isSelfManaged ? loadContexts() : onUpload();
    } else {
      const err = await res.json();
      setMessage(err.error?.message || 'Upload failed');
    }
    setUploading(false);
  }

  async function handleDelete(id) {
    await fetch(`/api/candidate/context/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    isSelfManaged ? loadContexts() : onDelete(id);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex gap-2 mb-4">
          {['upload', 'manual'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
              {t === 'upload' ? 'Upload Document' : 'Manual Entry'}
            </button>
          ))}
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          {tab === 'upload'
            ? <input type="file" accept=".pdf,.docx,.txt" onChange={e => setFile(e.target.files[0])} className="w-full border rounded-lg p-2" />
            : <textarea value={manualText} onChange={e => setManualText(e.target.value)} rows={6} placeholder="Enter policy positions, statements, or platform text..." className="w-full border rounded-lg px-4 py-3" />
          }
          <TopicSelector selected={topics} onChange={setTopics} label="Tag topics covered" />
          {message && <p className="text-sm text-green-600">{message}</p>}
          <button type="submit" disabled={uploading || (tab === 'upload' ? !file : !manualText)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
            {uploading ? 'Uploading...' : 'Add Context'}
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {contexts.map(c => (
          <div key={c.id} className="bg-white rounded-xl shadow p-4 flex items-start justify-between">
            <div>
              <p className="font-medium text-sm">{c.original_filename || 'Manual Entry'}</p>
              <p className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString()} · {JSON.parse(c.topic_tags || '[]').join(', ')}</p>
            </div>
            <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
