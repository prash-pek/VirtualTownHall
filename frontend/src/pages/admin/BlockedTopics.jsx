import AdminKillSwitch from '../../components/admin/AdminKillSwitch';

export default function BlockedTopics() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Blocked Topics & Kill Switch</h2>
      <AdminKillSwitch token={localStorage.getItem('token')} />
    </div>
  );
}
