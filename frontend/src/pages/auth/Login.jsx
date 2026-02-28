import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';

export default function Login() {
  const [role, setRole] = useState('constituent');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { dispatch } = useApp();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    const endpoint = role === 'candidate' ? '/api/auth/candidate/login' : '/api/auth/constituent/login';
    const body = role === 'candidate' ? { email, password } : { email };

    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error?.message || 'Sign in failed'); return; }
    dispatch({ type: 'SET_AUTH', payload: { token: data.token, role, user: data } });
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', role);
    navigate(role === 'candidate' ? '/admin/dashboard' : '/');
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--cream)' }}>
      {/* Left panel */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex flex-col justify-between w-96 p-12"
        style={{ background: 'var(--navy)' }}
      >
        <Link to="/" className="font-display text-2xl font-bold text-white">TownHall AI</Link>
        <div>
          <p className="font-display text-3xl font-bold text-white leading-tight mb-4">
            Democracy works better when voters are informed.
          </p>
          <span className="block w-12 h-0.5" style={{ background: 'var(--gold)' }} />
        </div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>© 2026 TownHall AI</p>
      </motion.div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <p className="section-label mb-2">Welcome back</p>
          <h2 className="font-display text-3xl font-bold mb-8" style={{ color: 'var(--navy)' }}>Sign in</h2>

          {/* Role toggle */}
          <div className="flex mb-6" style={{ border: '1.5px solid var(--border)' }}>
            {['constituent', 'candidate'].map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className="flex-1 py-2.5 text-sm font-medium transition-all duration-150"
                style={{
                  background: role === r ? 'var(--navy)' : 'white',
                  color: role === r ? 'white' : 'var(--text-muted)',
                }}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm mb-4 px-3 py-2"
              style={{ background: 'rgba(220,38,38,0.08)', color: 'var(--red)', border: '1px solid rgba(220,38,38,0.2)' }}
            >
              {error}
            </motion.p>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required className="input-field" />
            {role === 'candidate' && (
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="input-field" />
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-50">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-sm mt-6 text-center" style={{ color: 'var(--text-muted)' }}>
            No account?{' '}
            <Link to="/auth/register" className="font-medium" style={{ color: 'var(--navy)' }}>Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
