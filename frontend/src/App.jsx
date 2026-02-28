import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import CandidateList from './pages/CandidateList';
import CandidateProfilePage from './pages/CandidateProfilePage';
import ChatPage from './pages/ChatPage';
import AuditPage from './pages/AuditPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
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
      <Route path="/candidates" element={<CandidateList />} />
      <Route path="/candidate/:id" element={<CandidateProfilePage />} />
      <Route path="/candidate/:id/chat" element={<ChatPage />} />
      <Route path="/candidate/:id/audit" element={<AuditPage />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/admin/context" element={<Context />} />
      <Route path="/admin/context-manager" element={<ContextManager />} />
      <Route path="/admin/persona" element={<Persona />} />
      <Route path="/admin/persona-editor" element={<PersonaEditor />} />
      <Route path="/admin/blocked-topics" element={<BlockedTopics />} />
      <Route path="/admin/analytics" element={<Analytics />} />
      <Route path="/admin/audit" element={<AdminAudit />} />
      <Route path="/admin/settings" element={<Settings />} />
      <Route path="/platform-admin/candidates" element={<PlatformCandidates />} />
    </Routes>
  );
}
