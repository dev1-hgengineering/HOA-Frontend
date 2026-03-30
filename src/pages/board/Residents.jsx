import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Search, UserPlus } from 'lucide-react'

function InviteDialog({ open, onClose }) {
  const qc = useQueryClient()
  const [email, setEmail] = useState('')
  const [unit, setUnit] = useState('')

  const invite = useMutation({
    mutationFn: (data) => api.post('/board/residents/invite', data),
    onSuccess: () => {
      toast.success('Invitation sent')
      qc.invalidateQueries({ queryKey: ['residents'] })
      onClose()
      setEmail('')
      setUnit('')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to send invite'),
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite resident</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="resident@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Unit / Address</Label>
            <Input id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unit 12A" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => invite.mutate({ email, unit })} disabled={invite.isPending || !email}>
            {invite.isPending ? 'Sending…' : 'Send invite'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function Residents() {
  const [search, setSearch] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)

  const { data: residents = [], isLoading } = useQuery({
    queryKey: ['residents'],
    queryFn: () => api.get('/board/residents').then((r) => r.data),
  })

  const filtered = residents.filter((r) =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.unit?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppShell>
      <div className="p-6">
        <PageHeader
          title="Residents"
          description={`${residents.length} residents`}
          action={
            <Button onClick={() => setInviteOpen(true)}>
              <UserPlus className="size-4 mr-2" />
              Invite resident
            </Button>
          }
        />

        <div className="mb-4 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search residents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Resident</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Unit</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(4)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No residents found
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs">
                            {r.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{r.name || '—'}</p>
                          <p className="text-muted-foreground text-xs">{r.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.unit || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={r.active ? 'default' : 'secondary'}>
                        {r.active ? 'Active' : 'Invited'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <InviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
      </div>
    </AppShell>
  )
}
