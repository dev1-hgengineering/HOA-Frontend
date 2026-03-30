import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function AcceptResident() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { acceptResident } = useAuth()
  const token = params.get('token')

  const [invite, setInvite] = useState(null)
  const [inviteError, setInviteError] = useState('')
  const [form, setForm] = useState({ first_name: '', last_name: '', password: '', confirm_password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setInviteError('No invite token found. Please use the link from your invitation email.')
      return
    }
    api.get(`/auth/resident-invite?token=${token}`)
      .then((res) => setInvite(res.data))
      .catch(() => setInviteError('This invite link is invalid or has expired.'))
  }, [token])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      await acceptResident(token, form.first_name, form.last_name, form.password)
      navigate('/resident/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create your account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (inviteError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Invalid invite</CardTitle>
            <CardDescription>{inviteError}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-center text-muted-foreground">
              Contact your HOA board if you need a new invite sent.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-sm text-muted-foreground">Loading invite…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">You've been invited</CardTitle>
          <CardDescription>
            {invite.org_name} has invited you to join as a resident of{' '}
            <span className="font-medium text-foreground">{invite.unit}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
            )}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={invite.email} disabled className="bg-muted" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="first_name">First name</Label>
                <Input
                  id="first_name"
                  value={form.first_name}
                  onChange={set('first_name')}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last name</Label>
                <Input
                  id="last_name"
                  value={form.last_name}
                  onChange={set('last_name')}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Create password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={set('password')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm password</Label>
              <Input
                id="confirm_password"
                type="password"
                value={form.confirm_password}
                onChange={set('confirm_password')}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Accept invite & create account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
