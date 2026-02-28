import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';

export default function Register() {
  const [role, setRole] = useState('constituent');
  const [form, setForm] = useState({ email: '', password: '', zip_code: '', name: '', office: '', election_level: 'local', district: '', zip_codes: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { dispatch } = useApp();
  const navigate = useNavigate();

  function update(field, value) { setForm(f => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    const endpoint = role === 'candidate' ? '/api/auth/candidate/register' : '/api/auth/constituent/register';
    const payload = role === 'candidate'
      ? { ...form, zip_codes: form.zip_codes ? form.zip_codes.split(',').map(z => z.trim()).filter(Boolean) : [] }
      : form;
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error?.message || 'Registration failed'); return; }
    dispatch({ type: 'SET_AUTH', payload: { token: data.token, role, user: data } });
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', role);
    navigate(role === 'candidate' ? '/admin/dashboard' : '/voter/dashboard');
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
            Every candidate deserves to be heard. Every voter deserves to listen.
          </p>
          <span className="block w-12 h-0.5" style={{ background: 'var(--gold)' }} />
        </div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>© 2026 TownHall AI</p>
      </motion.div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-6 md:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Mobile branding */}
          <div className="lg:hidden mb-8 text-center">
            <span className="font-display text-xl font-bold" style={{ color: 'var(--navy)' }}>TownHall AI</span>
          </div>
          <p className="section-label mb-2">Get started</p>
          <h2 className="font-display text-3xl font-bold mb-8" style={{ color: 'var(--navy)' }}>Create account</h2>

          <div className="flex mb-6" style={{ border: '1.5px solid var(--border)' }}>
            {['constituent', 'candidate'].map(r => (
              <button key={r} onClick={() => setRole(r)}
                className="flex-1 py-2.5 text-sm font-medium transition-all duration-150"
                style={{ background: role === r ? 'var(--navy)' : 'white', color: role === r ? 'white' : 'var(--text-muted)' }}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-sm mb-4 px-3 py-2"
              style={{ background: 'rgba(220,38,38,0.08)', color: 'var(--red)', border: '1px solid rgba(220,38,38,0.2)' }}
            >{error}</motion.p>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="email" placeholder="Email address" value={form.email} onChange={e => update('email', e.target.value)} required className="input-field" />
            {role === 'constituent' && (
              <input type="text" placeholder="ZIP code" value={form.zip_code} onChange={e => update('zip_code', e.target.value)} required className="input-field" />
            )}
            {role === 'candidate' && (
              <>
                <input type="password" placeholder="Password" value={form.password} onChange={e => update('password', e.target.value)} required className="input-field" />
                <input type="text" placeholder="Full name" value={form.name} onChange={e => update('name', e.target.value)} required className="input-field" />
                <input type="text" placeholder="Office sought (e.g. City Council Ward 3)" value={form.office} onChange={e => update('office', e.target.value)} required className="input-field" />
                <select value={form.election_level} onChange={e => update('election_level', e.target.value)} className="input-field">
                  <option value="local">Local</option>
                  <option value="state">State</option>
                  <option value="national">National</option>
                </select>
                <input type="text" placeholder="District / Geography" value={form.district} onChange={e => update('district', e.target.value)} required className="input-field" />
                <input type="text" placeholder="ZIP codes served (comma-separated)" value={form.zip_codes} onChange={e => update('zip_codes', e.target.value)} className="input-field" />
              </>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-50">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-sm mt-6 text-center" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/auth/login" className="font-medium" style={{ color: 'var(--navy)' }}>Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
