import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

const statusOptions = ['open', 'in_progress', 'resolved', 'closed']

const statusVariant = (s) => ({
  open: 'destructive',
  in_progress: 'default',
  resolved: 'secondary',
  closed: 'outline',
}[s] || 'secondary')

export default function Maintenance() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState(null)
  const [status, setStatus] = useState('')
  const [note, setNote] = useState('')

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['maintenance'],
    queryFn: () => api.get('/board/maintenance').then((r) => r.data),
  })

  const update = useMutation({
    mutationFn: ({ id, status, note }) => api.patch(`/board/maintenance/${id}`, { status, note }),
    onSuccess: () => {
      toast.success('Request updated')
      qc.invalidateQueries({ queryKey: ['maintenance'] })
      setSelected(null)
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Update failed'),
  })

  const openRequest = (r) => {
    setSelected(r)
    setStatus(r.status)
    setNote('')
  }

  return (
    <AppShell>
      <div className="p-6">
        <PageHeader title="Maintenance Requests" description={`${requests.length} total`} />

        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Resident</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Submitted</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : !requests.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No requests</td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium max-w-xs truncate">{r.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.resident_name}</td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{r.category}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(r.status)}>{r.status.replace('_', ' ')}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => openRequest(r)}>View</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{selected?.title}</DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-4 py-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{selected.description || 'No description'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Resident</p>
                    <p>{selected.resident_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Unit</p>
                    <p>{selected.unit || '—'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Update status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Note (optional)</Label>
                  <Textarea
                    placeholder="Add a note to the resident…"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
              <Button
                onClick={() => update.mutate({ id: selected.id, status, note })}
                disabled={update.isPending}
              >
                {update.isPending ? 'Saving…' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  )
}
