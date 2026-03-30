import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

// Auth
import Login from '@/pages/auth/Login'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'
import AcceptInvite from '@/pages/auth/AcceptInvite'
import Onboarding from '@/pages/auth/Onboarding'

// Board
import BoardDashboard from '@/pages/board/Dashboard'
import Residents from '@/pages/board/Residents'
import Dues from '@/pages/board/Dues'
import Maintenance from '@/pages/board/Maintenance'
import Announcements from '@/pages/board/Announcements'
import Documents from '@/pages/board/Documents'
import BoardMembers from '@/pages/board/BoardMembers'
import Settings from '@/pages/board/Settings'
import Reports from '@/pages/board/Reports'

// Resident
import ResidentDashboard from '@/pages/resident/Dashboard'
import SubmitRequest from '@/pages/resident/SubmitRequest'
import Profile from '@/pages/resident/Profile'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

function RequireAuth({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />
  return children
}

const boardRoles = ['board_admin', 'treasurer', 'board_member', 'super_admin']

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/invite" element={<AcceptInvite />} />
      <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />

      {/* Board admin */}
      <Route path="/board/dashboard" element={<RequireAuth roles={boardRoles}><BoardDashboard /></RequireAuth>} />
      <Route path="/board/residents" element={<RequireAuth roles={boardRoles}><Residents /></RequireAuth>} />
      <Route path="/board/dues" element={<RequireAuth roles={boardRoles}><Dues /></RequireAuth>} />
      <Route path="/board/maintenance" element={<RequireAuth roles={boardRoles}><Maintenance /></RequireAuth>} />
      <Route path="/board/announcements" element={<RequireAuth roles={boardRoles}><Announcements /></RequireAuth>} />
      <Route path="/board/documents" element={<RequireAuth roles={boardRoles}><Documents /></RequireAuth>} />
      <Route path="/board/members" element={<RequireAuth roles={boardRoles}><BoardMembers /></RequireAuth>} />
      <Route path="/board/settings" element={<RequireAuth roles={boardRoles}><Settings /></RequireAuth>} />
      <Route path="/board/reports" element={<RequireAuth roles={boardRoles}><Reports /></RequireAuth>} />

      {/* Resident */}
      <Route path="/resident/dashboard" element={<RequireAuth><ResidentDashboard /></RequireAuth>} />
      <Route path="/resident/request" element={<RequireAuth><SubmitRequest /></RequireAuth>} />
      <Route path="/resident/profile" element={<RequireAuth><Profile /></RequireAuth>} />

      {/* Default */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
