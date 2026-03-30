import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { DollarSign, Send } from 'lucide-react'

export default function Dues() {
  const qc = useQueryClient()
  const [reminderOpen, setReminderOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['dues'],
    queryFn: () => api.get('/board/dues').then((r) => r.data),
  })

  const sendReminders = useMutation({
    mutationFn: () => api.post('/board/dues/reminders'),
    onSuccess: () => {
      toast.success('Reminders sent to all overdue residents')
      setReminderOpen(false)
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to send reminders'),
  })

  const statusVariant = (status) => ({
    paid: 'default',
    overdue: 'destructive',
    pending: 'secondary',
  }[status] || 'secondary')

  return (
    <AppShell>
      <div className="p-6">
        <PageHeader
          title="Dues Management"
          description="Track and manage HOA dues"
          action={
            <Button variant="outline" onClick={() => setReminderOpen(true)}>
              <Send className="size-4 mr-2" />
              Send reminders
            </Button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Collected', value: data?.total_collected, prefix: '$' },
            { label: 'Overdue', value: data?.overdue_count, suffix: ' residents' },
            { label: 'Collection Rate', value: data?.collection_rate, suffix: '%' },
          ].map((s) => (
            <Card key={s.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-7 w-20" />
                ) : (
                  <p className="text-2xl font-semibold">
                    {s.prefix}{s.value != null ? (typeof s.value === 'number' && s.prefix === '$' ? s.value.toLocaleString() : s.value) : '—'}{s.suffix}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Resident</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Unit</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Due Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : !data?.dues?.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No dues records</td>
                </tr>
              ) : (
                data.dues.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{d.resident_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.unit}</td>
                    <td className="px-4 py-3">${d.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.due_date ? new Date(d.due_date).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(d.status)}>{d.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Dialog open={reminderOpen} onOpenChange={setReminderOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Send payment reminders?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground py-2">
              This will send an email reminder to all residents with overdue dues.
            </p>
            <p className="text-xs text-muted-foreground italic">Not financial advice — reminders are informational only.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReminderOpen(false)}>Cancel</Button>
              <Button onClick={() => sendReminders.mutate()} disabled={sendReminders.isPending}>
                {sendReminders.isPending ? 'Sending…' : 'Send reminders'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  )
}
