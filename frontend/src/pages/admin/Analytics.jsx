import AdminAnalytics from '../../components/admin/AdminAnalytics';

export default function Analytics() {
  return (
    <div className="p-8 max-w-4xl">
      <p className="section-label mb-2">Analytics</p>
      <h2 className="font-display text-3xl font-bold mb-8" style={{ color: 'var(--navy)' }}>Constituent Insights</h2>
      <AdminAnalytics token={localStorage.getItem('token')} />
    </div>
  );
}
