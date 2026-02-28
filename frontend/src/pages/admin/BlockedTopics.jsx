import AdminKillSwitch from '../../components/admin/AdminKillSwitch';

export default function BlockedTopics() {
  return (
    <div className="p-8 max-w-3xl">
      <p className="section-label mb-2">Blocked Topics</p>
      <h2 className="font-display text-3xl font-bold mb-8" style={{ color: 'var(--navy)' }}>Topics & Kill Switch</h2>
      <AdminKillSwitch token={localStorage.getItem('token')} />
    </div>
  );
}
