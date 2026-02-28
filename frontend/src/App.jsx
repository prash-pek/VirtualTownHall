import { Routes, Route, Link } from 'react-router-dom';
import Landing from './pages/Landing';
import CandidateList from './pages/CandidateList';
import CandidateProfilePage from './pages/CandidateProfilePage';
import ChatPage from './pages/ChatPage';
import AuditPage from './pages/AuditPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VoterOnboarding from './pages/voter/Onboarding';
import VoterDashboard from './pages/voter/Dashboard';
import CandidateLayout from './components/admin/CandidateLayout';
import Dashboard from './pages/admin/Dashboard';
import Context from './pages/admin/Context';
import ContextManager from './pages/admin/ContextManager';
import Persona from './pages/admin/Persona';
import PersonaEditor from './pages/admin/PersonaEditor';
import BlockedTopics from './pages/admin/BlockedTopics';
import Analytics from './pages/admin/Analytics';
import AdminAudit from './pages/admin/Audit';
import Settings from './pages/admin/Settings';
import PlatformCandidates from './pages/platform-admin/Candidates';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/onboarding" element={<VoterOnboarding />} />
      <Route path="/voter/dashboard" element={<VoterDashboard />} />
      <Route path="/candidates" element={<CandidateList />} />
      <Route path="/candidate/:id" element={<CandidateProfilePage />} />
      <Route path="/candidate/:id/chat" element={<ChatPage />} />
      <Route path="/candidate/:id/audit" element={<AuditPage />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />

      {/* All candidate admin pages share the persistent sidebar layout */}
      <Route element={<CandidateLayout />}>
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/context" element={<Context />} />
        <Route path="/admin/context-manager" element={<ContextManager />} />
        <Route path="/admin/persona" element={<Persona />} />
        <Route path="/admin/persona-editor" element={<PersonaEditor />} />
        <Route path="/admin/blocked-topics" element={<BlockedTopics />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/audit" element={<AdminAudit />} />
        <Route path="/admin/settings" element={<Settings />} />
      </Route>

      <Route path="/platform-admin/candidates" element={<PlatformCandidates />} />

      {/* 404 catch-all */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cream)' }}>
          <div className="text-center">
            <p className="font-display text-6xl font-bold mb-4" style={{ color: 'var(--navy)', opacity: 0.15 }}>404</p>
            <h1 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--navy)' }}>Page not found</h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>The page you're looking for doesn't exist.</p>
            <Link to="/" className="btn-primary px-6 py-2.5 text-sm">Back to Home</Link>
          </div>
        </div>
      } />
    </Routes>
  );
}
