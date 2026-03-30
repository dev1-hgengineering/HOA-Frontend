import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function ResidentDashboard() {
  const { user } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['resident-dashboard'],
    queryFn: () => api.get('/resident/dashboard').then((r) => r.data),
  })

  const statusVariant = (s) => ({
    paid: 'default',
    overdue: 'destructive',
    pending: 'secondary',
  }[s] || 'secondary')

  return (
    <AppShell>
      <div className="p-6">
        <PageHeader
          title={`Welcome, ${user?.name?.split(' ')[0] || 'Resident'}`}
          description="Your HOA portal"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dues status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dues Status</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Amount due</span>
                    <span className="font-semibold">${data?.dues?.amount?.toLocaleString() ?? '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Due date</span>
                    <span className="text-sm">{data?.dues?.due_date ? new Date(data.dues.due_date).toLocaleDateString() : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={statusVariant(data?.dues?.status)}>{data?.dues?.status || '—'}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground italic pt-1">
                    Not financial advice — contact your board for payment instructions.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My requests */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">My Maintenance Requests</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/resident/request">New request</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : !data?.requests?.length ? (
                <p className="text-sm text-muted-foreground">No requests submitted yet.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {data.requests.map((r) => (
                    <li key={r.id} className="py-2 flex items-center justify-between text-sm">
                      <span className="truncate">{r.title}</span>
                      <Badge variant={r.status === 'open' ? 'destructive' : 'secondary'} className="ml-2 shrink-0">
                        {r.status.replace('_', ' ')}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base">Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : !data?.announcements?.length ? (
                <p className="text-sm text-muted-foreground">No announcements.</p>
              ) : (
                <div className="space-y-4">
                  {data.announcements.map((a) => (
                    <div key={a.id} className="border-l-2 border-border pl-4">
                      <p className="font-medium text-sm">{a.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 mb-1">
                        {new Date(a.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">{a.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
