# Coder 2 — Frontend Track (TownHall AI)

## Setup

```bash
git clone https://github.com/prash-pek/VirtualTownHall
cd VirtualTownHall/frontend
npm install
npm run dev
```

Vite starts on http://localhost:5173. The backend (Coder 1) runs on port 3001 — wait for them to confirm it's up before testing API calls.

---

## Your Tasks

### 1. Fix `frontend/src/components/ChatInterface.jsx` — stale input bug

Find the `sendMessage` function. Before `setInput('')`, capture the value:

```js
const messageContent = input.trim();
setInput('');
// use messageContent in fetch body, NOT input
```

Also verify:
- Auth token is sent in the Authorization header when `localStorage.getItem('token')` exists
- Loading state disables the input correctly
- Auto-scroll to bottom on new messages works

### 2. Fix `frontend/src/pages/auth/Register.jsx` — missing zip_codes field

Add a zip_codes input to the candidate registration form:

```jsx
<input
  type="text"
  placeholder="ZIP codes (comma-separated, e.g. 97201, 97202)"
  value={form.zip_codes || ''}
  onChange={e => setForm({...form, zip_codes: e.target.value})}
/>
```

Before submitting, convert to array:

```js
zip_codes: form.zip_codes ? form.zip_codes.split(',').map(z => z.trim()) : []
```

### 3. Create `frontend/src/pages/admin/ContextManager.jsx`

```jsx
import AdminContextManager from '../../components/admin/AdminContextManager';
export default function ContextManager() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Context Documents</h2>
      <AdminContextManager token={localStorage.getItem('token')} />
    </div>
  );
}
```

### 4. Create `frontend/src/pages/admin/PersonaEditor.jsx`

```jsx
import AdminPersonaEditor from '../../components/admin/AdminPersonaEditor';
export default function PersonaEditor() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Configure AI Persona</h2>
      <AdminPersonaEditor token={localStorage.getItem('token')} />
    </div>
  );
}
```

### 5. Create `frontend/src/pages/admin/Settings.jsx`

Profile/donation URL editor. Fetch `GET /api/candidate/profile`, show editable form for `name`, `bio`, `donation_url`, `party`, submit with `PUT /api/candidate/profile`.

```jsx
import { useEffect, useState } from 'react';

export default function Settings() {
  const [form, setForm] = useState({ name: '', bio: '', donation_url: '', party: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/candidate/profile', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => r.json()).then(data => setForm(data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/candidate/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(form)
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input className="w-full border rounded p-2" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea className="w-full border rounded p-2" rows={4} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Party</label>
          <input className="w-full border rounded p-2" value={form.party} onChange={e => setForm({...form, party: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Donation URL</label>
          <input className="w-full border rounded p-2" value={form.donation_url} onChange={e => setForm({...form, donation_url: e.target.value})} />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
```

### 6. Create `frontend/src/pages/admin/Audit.jsx`

```jsx
import { useEffect, useState } from 'react';
import AuditTimeline from '../../components/AuditTimeline';

export default function Audit() {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    fetch('/api/candidate/audit-log', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => r.json()).then(setLogs);
  }, []);
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Audit Trail</h2>
      <AuditTimeline logs={logs} detailed={true} />
    </div>
  );
}
```

### 7. Create `frontend/src/pages/platform-admin/Candidates.jsx`

Fetch `GET /api/admin/candidates` with admin token. Display table with verify/unverify buttons calling `PUT /api/admin/candidates/:id/verify`.

```jsx
import { useEffect, useState } from 'react';

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);

  const load = () => {
    fetch('/api/admin/candidates', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => r.json()).then(setCandidates);
  };

  useEffect(load, []);

  const toggleVerify = async (id, verified) => {
    await fetch(`/api/admin/candidates/${id}/verify`, {
      method: verified ? 'DELETE' : 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    load();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">All Candidates</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-3 border">Name</th>
            <th className="text-left p-3 border">Party</th>
            <th className="text-left p-3 border">District</th>
            <th className="text-left p-3 border">Status</th>
            <th className="text-left p-3 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map(c => (
            <tr key={c.id} className="border-b">
              <td className="p-3 border">{c.name}</td>
              <td className="p-3 border">{c.party}</td>
              <td className="p-3 border">{c.district}</td>
              <td className="p-3 border">
                {c.is_verified ? (
                  <span className="text-green-600 font-medium">Verified</span>
                ) : (
                  <span className="text-gray-500">Unverified</span>
                )}
              </td>
              <td className="p-3 border">
                <button
                  onClick={() => toggleVerify(c.id, c.is_verified)}
                  className={`px-3 py-1 rounded text-sm ${c.is_verified ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                >
                  {c.is_verified ? 'Unverify' : 'Verify'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 8. Polish & test the constituent flow

1. Enter ZIP `97201` → confirm 2-3 seeded candidates appear
2. Click a candidate → profile shows bio, topics, alignment score, audit trail
3. Click "Chat" → disclaimer shows, conversation starts
4. Send 3+ messages → verify AI responds with citations
5. Click "End & Summarize" → summary card appears
6. Test anonymous flow (no token) and authenticated flow

Fix any display issues:
- `AlignmentBadge` color coding: green ≥80, yellow 60-79, red <60
- `VerificationBadge` blue checkmark visible
- Blocked topic response shows redirect message

### 9. Polish & test the admin flow

1. Register new candidate with ZIP codes
2. Login → Dashboard shows name, alignment score, AI status
3. `/admin/context` → upload a text file, add topic tags
4. `/admin/persona` → select tone, add style guidelines, save
5. `/admin/blocked-topics` → add a blocked topic with redirect, test kill switch toggle
6. `/admin/analytics` → after test conversations, verify question counts appear

---

## Key Files You Own

| File | Status |
|---|---|
| `frontend/src/components/ChatInterface.jsx` | Bug fix needed |
| `frontend/src/pages/auth/Register.jsx` | Bug fix needed |
| `frontend/src/pages/admin/ContextManager.jsx` | CREATE |
| `frontend/src/pages/admin/PersonaEditor.jsx` | CREATE |
| `frontend/src/pages/admin/Settings.jsx` | CREATE |
| `frontend/src/pages/admin/Audit.jsx` | CREATE |
| `frontend/src/pages/platform-admin/Candidates.jsx` | CREATE |

---

## Sync Points with Coder 1

| Time | Action |
|---|---|
| T+10 min | Confirm backend is up before testing API calls |
| T+45 min | Share any API contract issues you find |
| T+75 min | Run full end-to-end demo together |
