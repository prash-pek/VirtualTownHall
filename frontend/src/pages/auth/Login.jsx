import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function Login() {
  const [role, setRole] = useState('constituent');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { dispatch } = useApp();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const endpoint = role === 'candidate' ? '/api/auth/candidate/login' : '/api/auth/constituent/login';
    const body = role === 'candidate' ? { email, password } : { email };

    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();

    if (!res.ok) { setError(data.error?.message || 'Login failed'); return; }

    dispatch({ type: 'SET_AUTH', payload: { token: data.token, role, user: data } });
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', role);
    navigate(role === 'candidate' ? '/admin/dashboard' : '/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-8">
        <h2 className="text-2xl font-bold mb-6">Sign In</h2>
        <div className="flex gap-2 mb-6">
          {['constituent', 'candidate'].map(r => (
            <button key={r} onClick={() => setRole(r)} className={`flex-1 py-2 rounded-lg text-sm font-medium ${role === r ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border rounded-lg px-4 py-2" />
          {role === 'candidate' && <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border rounded-lg px-4 py-2" />}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">Sign In</button>
        </form>
      </div>
    </div>
  );
}
