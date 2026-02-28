import AdminPersonaEditor from '../../components/admin/AdminPersonaEditor';

export default function PersonaEditor() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Configure AI Persona</h2>
      <AdminPersonaEditor token={localStorage.getItem('token')} />
    </div>
  );
}
