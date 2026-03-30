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

export default function Settings() {
  const [name, setName] = useState('')
  const [duesAmount, setDuesAmount] = useState('')
  const [dueDay, setDueDay] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get('/board/settings').then((r) => r.data),
  })

  useEffect(() => {
    if (data) {
      setName(data.name || '')
      setDuesAmount(data.dues_amount?.toString() || '')
      setDueDay(data.dues_due_day?.toString() || '')
    }
  }, [data])

  const save = useMutation({
    mutationFn: (payload) => api.patch('/board/settings', payload),
    onSuccess: () => toast.success('Settings saved'),
    onError: (err) => toast.error(err.response?.data?.error || 'Save failed'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    save.mutate({
      name,
      dues_amount: parseFloat(duesAmount),
      dues_due_day: parseInt(dueDay, 10),
    })
  }

  return (
    <AppShell>
      <div className="p-6 max-w-2xl">
        <PageHeader title="Settings" />

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">HOA Details</CardTitle>
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
                    <Label htmlFor="name">HOA Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Dues Configuration</CardTitle>
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
                    <Label htmlFor="dues-amount">Monthly dues amount ($)</Label>
                    <Input
                      id="dues-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={duesAmount}
                      onChange={(e) => setDuesAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due-day">Due day of month (1–28)</Label>
                    <Input
                      id="due-day"
                      type="number"
                      min="1"
                      max="28"
                      value={dueDay}
                      onChange={(e) => setDueDay(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Not financial advice — dues configuration is for informational tracking only.
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Button type="submit" disabled={save.isPending || isLoading}>
            {save.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </div>
    </AppShell>
  )
}
