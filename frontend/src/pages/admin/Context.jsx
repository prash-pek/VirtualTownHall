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
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Context Documents</h2>
      <AdminContextManager token={token} contexts={contexts} onUpload={loadContexts} onDelete={handleDelete} />
    </div>
  );
}
