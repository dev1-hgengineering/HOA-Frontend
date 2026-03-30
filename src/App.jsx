import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

// Auth
import Login from '@/pages/auth/Login'
import Signup from '@/pages/auth/Signup'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import ResetPassword from '@/pages/auth/ResetPassword'
import AcceptInvite from '@/pages/auth/AcceptInvite'
import AcceptResident from '@/pages/auth/AcceptResident'
import Onboarding from '@/pages/auth/Onboarding'
import PendingApproval from '@/pages/auth/PendingApproval'

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

// Handles board_admin-specific routing: incomplete onboarding → /onboarding, not approved → /pending
function BoardAdminRoute({ children }) {
  const { user, org } = useAuth()
  if (user?.role !== 'board_admin') return children
  if (!org) return children
  if (!org.onboarding_complete) {
    return <Navigate to={`/onboarding?step=${org.onboarding_step || 1}`} replace />
  }
  if (org.approval_status !== 'approved') {
    return <Navigate to="/pending" replace />
  }
  return children
}

const boardRoles = ['board_admin', 'treasurer', 'board_member', 'super_admin']

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/invite" element={<AcceptInvite />} />
      <Route path="/accept" element={<AcceptResident />} />

      {/* Board admin: onboarding & pending (auth required, no approval gate) */}
      <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
      <Route path="/pending" element={<RequireAuth><PendingApproval /></RequireAuth>} />

      {/* Board */}
      <Route path="/board/dashboard" element={<RequireAuth roles={boardRoles}><BoardAdminRoute><BoardDashboard /></BoardAdminRoute></RequireAuth>} />
      <Route path="/board/residents" element={<RequireAuth roles={boardRoles}><BoardAdminRoute><Residents /></BoardAdminRoute></RequireAuth>} />
      <Route path="/board/dues" element={<RequireAuth roles={boardRoles}><BoardAdminRoute><Dues /></BoardAdminRoute></RequireAuth>} />
      <Route path="/board/maintenance" element={<RequireAuth roles={boardRoles}><BoardAdminRoute><Maintenance /></BoardAdminRoute></RequireAuth>} />
      <Route path="/board/announcements" element={<RequireAuth roles={boardRoles}><BoardAdminRoute><Announcements /></BoardAdminRoute></RequireAuth>} />
      <Route path="/board/documents" element={<RequireAuth roles={boardRoles}><BoardAdminRoute><Documents /></BoardAdminRoute></RequireAuth>} />
      <Route path="/board/members" element={<RequireAuth roles={boardRoles}><BoardAdminRoute><BoardMembers /></BoardAdminRoute></RequireAuth>} />
      <Route path="/board/settings" element={<RequireAuth roles={boardRoles}><BoardAdminRoute><Settings /></BoardAdminRoute></RequireAuth>} />
      <Route path="/board/reports" element={<RequireAuth roles={boardRoles}><BoardAdminRoute><Reports /></BoardAdminRoute></RequireAuth>} />

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
