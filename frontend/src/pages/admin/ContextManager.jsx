import AdminContextManager from '../../components/admin/AdminContextManager';

export default function ContextManager() {
  return (
    <div className="p-8 max-w-4xl">
      <p className="section-label mb-2">Context Docs</p>
      <h2 className="font-display text-3xl font-bold mb-8" style={{ color: 'var(--navy)' }}>Manage Documents</h2>
      <AdminContextManager token={localStorage.getItem('token')} />
    </div>
  );
}
