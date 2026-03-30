import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'

const boardRoles = ['board_admin', 'treasurer', 'board_member', 'super_admin']

export default function Onboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isBoard = boardRoles.includes(user?.role)

  // Residents: step 1 = phone, step 2 = welcome
  // Board members: step 1 = welcome only
  const totalSteps = isBoard ? 1 : 2
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')

  const saveProfile = useMutation({
    mutationFn: (payload) => api.patch('/resident/profile', payload),
    onSuccess: () => setStep(2),
    onError: () => setStep(2),
  })

  const dashboardPath = isBoard ? '/board/dashboard' : '/resident/dashboard'
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  const handlePhoneSubmit = (e) => {
    e.preventDefault()
    if (phone.trim()) {
      saveProfile.mutate({ phone })
    } else {
      setStep(2)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">

        {totalSteps > 1 && (
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`h-2 w-8 rounded-full transition-colors ${i + 1 <= step ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
        )}

        {/* Step 1 — residents only: phone number */}
        {!isBoard && step === 1 && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Complete your profile</CardTitle>
              <CardDescription>
                Add a phone number so the board can reach you if needed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone number{' '}
                    <span className="text-muted-foreground text-xs">(optional)</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(214) 555-0100"
                    autoFocus
                  />
                </div>
                <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
                  {saveProfile.isPending ? 'Saving…' : 'Continue'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Final step — all users: welcome */}
        {(isBoard ? step === 1 : step === 2) && (
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-3">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-xl">You're all set, {firstName}!</CardTitle>
              <CardDescription>
                {isBoard
                  ? 'Your board account is ready. Head to the dashboard to manage your HOA.'
                  : 'Your account is ready. Track dues, submit maintenance requests, and stay updated on announcements.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate(dashboardPath)}>
                Go to dashboard
              </Button>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}
