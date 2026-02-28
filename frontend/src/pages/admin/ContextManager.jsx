import AdminContextManager from '../../components/admin/AdminContextManager';

export default function ContextManager() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Context Documents</h2>
      <AdminContextManager token={localStorage.getItem('token')} />
    </div>
  );
}
