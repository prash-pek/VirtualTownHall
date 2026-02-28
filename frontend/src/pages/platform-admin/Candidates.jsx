import { useEffect, useState } from 'react';

export default function PlatformCandidates() {
  const [candidates, setCandidates] = useState([]);
  const token = localStorage.getItem('token');

  function load() {
    fetch('/api/admin/candidates', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setCandidates);
  }

  useEffect(load, []);

  async function toggleVerify(id, currentlyVerified) {
    const method = currentlyVerified ? 'DELETE' : 'PUT';
    await fetch(`/api/admin/candidates/${id}/verify`, { method, headers: { Authorization: `Bearer ${token}` } });
    load();
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Platform Admin — Candidate Verification</h2>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-sm text-gray-600"><tr>
            <th className="text-left px-4 py-3">Name</th>
            <th className="text-left px-4 py-3">Office</th>
            <th className="text-left px-4 py-3">Level</th>
            <th className="text-left px-4 py-3">Verified</th>
            <th className="px-4 py-3"></th>
          </tr></thead>
          <tbody>{candidates.map(c => (
            <tr key={c.id} className="border-t">
              <td className="px-4 py-3 font-medium">{c.name}</td>
              <td className="px-4 py-3 text-gray-600">{c.office}</td>
              <td className="px-4 py-3 text-gray-600 capitalize">{c.election_level}</td>
              <td className="px-4 py-3">{c.is_verified ? <span className="text-green-600 font-medium">✓ Yes</span> : <span className="text-gray-400">No</span>}</td>
              <td className="px-4 py-3">
                <button onClick={() => toggleVerify(c.id, c.is_verified)} className={`px-3 py-1 rounded text-sm font-medium ${c.is_verified ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                  {c.is_verified ? 'Revoke' : 'Verify'}
                </button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
