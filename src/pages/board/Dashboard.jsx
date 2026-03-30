import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, DollarSign, Wrench, Megaphone } from 'lucide-react'

function StatCard({ title, value, icon: Icon, loading }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-16" />
        ) : (
          <p className="text-2xl font-semibold">{value}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default function BoardDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/board/dashboard').then((r) => r.data),
  })

  const stats = [
    { title: 'Total Residents', value: data?.resident_count ?? '—', icon: Users },
    { title: 'Dues Collected', value: data?.dues_collected ? `$${data.dues_collected.toLocaleString()}` : '—', icon: DollarSign },
    { title: 'Open Requests', value: data?.open_requests ?? '—', icon: Wrench },
    { title: 'Announcements', value: data?.announcement_count ?? '—', icon: Megaphone },
  ]

  return (
    <AppShell>
      <div className="p-6">
        <PageHeader title="Dashboard" description="Overview of your HOA" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <StatCard key={s.title} {...s} loading={isLoading} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Maintenance Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : data?.recent_requests?.length ? (
                <ul className="divide-y divide-border">
                  {data.recent_requests.map((r) => (
                    <li key={r.id} className="py-2 flex items-center justify-between text-sm">
                      <span className="truncate">{r.title}</span>
                      <Badge variant={r.status === 'open' ? 'destructive' : 'secondary'} className="ml-2 shrink-0">
                        {r.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No requests</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : data?.recent_announcements?.length ? (
                <ul className="divide-y divide-border">
                  {data.recent_announcements.map((a) => (
                    <li key={a.id} className="py-2 text-sm">
                      <p className="font-medium truncate">{a.title}</p>
                      <p className="text-muted-foreground text-xs">{new Date(a.created_at).toLocaleDateString()}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No announcements</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
