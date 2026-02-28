import AdminAnalytics from '../../components/admin/AdminAnalytics';

export default function Analytics() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Analytics</h2>
      <AdminAnalytics token={localStorage.getItem('token')} />
    </div>
  );
}
