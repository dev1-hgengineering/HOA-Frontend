import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export default function Profile() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/resident/profile').then((r) => r.data),
  })

  useEffect(() => {
    if (data) {
      setName(data.name || '')
      setPhone(data.phone || '')
    }
  }, [data])

  const saveProfile = useMutation({
    mutationFn: (payload) => api.patch('/resident/profile', payload),
    onSuccess: () => toast.success('Profile updated'),
    onError: (err) => toast.error(err.response?.data?.error || 'Update failed'),
  })

  const changePassword = useMutation({
    mutationFn: (payload) => api.post('/resident/change-password', payload),
    onSuccess: () => {
      toast.success('Password changed')
      setCurrentPassword('')
      setNewPassword('')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Password change failed'),
  })

  return (
    <AppShell>
      <div className="p-6 max-w-xl">
        <PageHeader title="My Profile" />

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(214) 555-0100" />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input value={data?.unit || '—'} disabled />
                </div>
                <Button
                  onClick={() => saveProfile.mutate({ name, phone })}
                  disabled={saveProfile.isPending}
                >
                  {saveProfile.isPending ? 'Saving…' : 'Save changes'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-pw">Current password</Label>
              <Input id="current-pw" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pw">New password</Label>
              <Input id="new-pw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <Button
              onClick={() => changePassword.mutate({ current_password: currentPassword, new_password: newPassword })}
              disabled={changePassword.isPending || !currentPassword || !newPassword}
            >
              {changePassword.isPending ? 'Saving…' : 'Change password'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
