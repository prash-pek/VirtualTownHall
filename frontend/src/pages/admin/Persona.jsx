import AdminPersonaEditor from '../../components/admin/AdminPersonaEditor';

export default function Persona() {
  return (
    <div className="p-8 max-w-3xl">
      <p className="section-label mb-2">AI Persona</p>
      <h2 className="font-display text-3xl font-bold mb-8" style={{ color: 'var(--navy)' }}>Configure Persona</h2>
      <AdminPersonaEditor token={localStorage.getItem('token')} />
    </div>
  );
}
