import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Wrench,
  Megaphone,
  FileText,
  ShieldCheck,
  Settings,
  BarChart3,
  LogOut,
  User,
} from 'lucide-react'

const boardNav = [
  { href: '/board/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/board/residents', label: 'Residents', icon: Users },
  { href: '/board/dues', label: 'Dues', icon: DollarSign },
  { href: '/board/maintenance', label: 'Maintenance', icon: Wrench },
  { href: '/board/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/board/documents', label: 'Documents', icon: FileText },
  { href: '/board/members', label: 'Board Members', icon: ShieldCheck },
  { href: '/board/reports', label: 'Reports', icon: BarChart3 },
  { href: '/board/settings', label: 'Settings', icon: Settings },
]

const residentNav = [
  { href: '/resident/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/resident/request', label: 'Submit Request', icon: Wrench },
  { href: '/resident/profile', label: 'My Profile', icon: User },
]

export default function AppShell({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isBoard = user?.role === 'board_admin' || user?.role === 'treasurer' || user?.role === 'board_member'
  const nav = isBoard ? boardNav : residentNav

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border flex flex-col shrink-0">
        <div className="h-14 flex items-center px-4 border-b border-border">
          <span className="font-semibold text-sm text-foreground">HOA Manager</span>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = location.pathname === href
            return (
              <Link
                key={href}
                to={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full px-2 py-2 rounded-md hover:bg-muted transition-colors text-sm text-left">
                <Avatar className="size-7">
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/resident/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="size-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
