import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'

const roles = ['board_admin', 'treasurer', 'board_member']
const roleLabel = { board_admin: 'Board Admin', treasurer: 'Treasurer', board_member: 'Board Member' }

export default function BoardMembers() {
  const qc = useQueryClient()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('board_member')

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['board-members'],
    queryFn: () => api.get('/board/members').then((r) => r.data),
  })

  const invite = useMutation({
    mutationFn: (data) => api.post('/board/members/invite', data),
    onSuccess: () => {
      toast.success('Invitation sent')
      qc.invalidateQueries({ queryKey: ['board-members'] })
      setInviteOpen(false)
      setEmail('')
      setRole('board_member')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to send invite'),
  })

  return (
    <AppShell>
      <div className="p-6">
        <PageHeader
          title="Board Members"
          action={
            <Button onClick={() => setInviteOpen(true)}>
              <UserPlus className="size-4 mr-2" />
              Invite member
            </Button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)
          ) : !members.length ? (
            <p className="text-sm text-muted-foreground col-span-3">No board members</p>
          ) : (
            members.map((m) => (
              <div key={m.id} className="border border-border rounded-lg p-4 flex items-center gap-4">
                <Avatar className="size-10">
                  <AvatarFallback>
                    {m.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{m.name || m.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {roleLabel[m.role] || m.role}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>

        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite board member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Email address</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="member@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r} value={r}>{roleLabel[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
              <Button onClick={() => invite.mutate({ email, role })} disabled={invite.isPending || !email}>
                {invite.isPending ? 'Sending…' : 'Send invite'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  )
}
