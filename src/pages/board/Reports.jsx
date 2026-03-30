import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export default function Reports() {
  const { data, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => api.get('/board/reports').then((r) => r.data),
  })

  const download = (type) => {
    window.open(`/api/board/reports/export?type=${type}`, '_blank')
  }

  return (
    <AppShell>
      <div className="p-6">
        <PageHeader title="Reports" description="Financial and operational summaries" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Dues Report</CardTitle>
              <Button variant="outline" size="sm" onClick={() => download('dues')}>
                <Download className="size-4 mr-1.5" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ) : (
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Total collected</dt>
                    <dd className="font-medium">${data?.dues?.total_collected?.toLocaleString() ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Total outstanding</dt>
                    <dd className="font-medium">${data?.dues?.total_outstanding?.toLocaleString() ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Collection rate</dt>
                    <dd className="font-medium">{data?.dues?.collection_rate ?? '—'}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Overdue accounts</dt>
                    <dd className="font-medium">{data?.dues?.overdue_count ?? '—'}</dd>
                  </div>
                </dl>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Maintenance Report</CardTitle>
              <Button variant="outline" size="sm" onClick={() => download('maintenance')}>
                <Download className="size-4 mr-1.5" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ) : (
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Total requests</dt>
                    <dd className="font-medium">{data?.maintenance?.total ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Open</dt>
                    <dd className="font-medium">{data?.maintenance?.open ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">In progress</dt>
                    <dd className="font-medium">{data?.maintenance?.in_progress ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Resolved</dt>
                    <dd className="font-medium">{data?.maintenance?.resolved ?? '—'}</dd>
                  </div>
                </dl>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
