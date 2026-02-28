import { useEffect, useState } from 'react';
import AdminContextManager from '../../components/admin/AdminContextManager';

export default function Context() {
  const [contexts, setContexts] = useState([]);
  const token = localStorage.getItem('token');

  function loadContexts() {
    fetch('/api/candidate/context', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setContexts);
  }

  useEffect(loadContexts, []);

  async function handleDelete(id) {
    await fetch(`/api/candidate/context/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    loadContexts();
  }

  return (
    <div className="p-8 max-w-4xl">
      <p className="section-label mb-2">Context Docs</p>
      <h2 className="font-display text-3xl font-bold mb-8" style={{ color: 'var(--navy)' }}>Platform Materials</h2>
      <AdminContextManager token={token} contexts={contexts} onUpload={loadContexts} onDelete={handleDelete} />
    </div>
  );
}
