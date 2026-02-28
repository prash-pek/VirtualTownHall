import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function Register() {
  const [role, setRole] = useState('constituent');
  const [form, setForm] = useState({ email: '', password: '', zip_code: '', name: '', office: '', election_level: 'local', district: '', zip_codes: '' });
  const [error, setError] = useState('');
  const { dispatch } = useApp();
  const navigate = useNavigate();

  function update(field, value) { setForm(f => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const endpoint = role === 'candidate' ? '/api/auth/candidate/register' : '/api/auth/constituent/register';
    const body = role === 'candidate'
      ? { ...form, zip_codes: form.zip_codes ? form.zip_codes.split(',').map(z => z.trim()) : [] }
      : form;
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();

    if (!res.ok) { setError(data.error?.message || 'Registration failed'); return; }
    dispatch({ type: 'SET_AUTH', payload: { token: data.token, role, user: data } });
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', role);
    navigate(role === 'candidate' ? '/admin/dashboard' : '/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-8">
        <h2 className="text-2xl font-bold mb-6">Create Account</h2>
        <div className="flex gap-2 mb-6">
          {['constituent', 'candidate'].map(r => (
            <button key={r} onClick={() => setRole(r)} className={`flex-1 py-2 rounded-lg text-sm font-medium ${role === r ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" value={form.email} onChange={e => update('email', e.target.value)} required className="w-full border rounded-lg px-4 py-2" />
          {role === 'constituent' && <input type="text" placeholder="ZIP Code" value={form.zip_code} onChange={e => update('zip_code', e.target.value)} required className="w-full border rounded-lg px-4 py-2" />}
          {role === 'candidate' && <>
            <input type="password" placeholder="Password" value={form.password} onChange={e => update('password', e.target.value)} required className="w-full border rounded-lg px-4 py-2" />
            <input type="text" placeholder="Full Name" value={form.name} onChange={e => update('name', e.target.value)} required className="w-full border rounded-lg px-4 py-2" />
            <input type="text" placeholder="Office (e.g. City Council Ward 3)" value={form.office} onChange={e => update('office', e.target.value)} required className="w-full border rounded-lg px-4 py-2" />
            <select value={form.election_level} onChange={e => update('election_level', e.target.value)} className="w-full border rounded-lg px-4 py-2">
              <option value="local">Local</option>
              <option value="state">State</option>
              <option value="national">National</option>
            </select>
            <input type="text" placeholder="District / Geography" value={form.district} onChange={e => update('district', e.target.value)} required className="w-full border rounded-lg px-4 py-2" />
            <input type="text" placeholder="ZIP codes (comma-separated, e.g. 97201, 97202)" value={form.zip_codes} onChange={e => update('zip_codes', e.target.value)} className="w-full border rounded-lg px-4 py-2" />
          </>}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">Create Account</button>
        </form>
      </div>
    </div>
  );
}
