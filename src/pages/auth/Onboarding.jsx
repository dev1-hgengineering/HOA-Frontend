import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Upload, CheckCircle2, CreditCard } from 'lucide-react'

const TOTAL_STEPS = 5

const STEP_LABELS = [
  'HOA Details',
  'Board Members',
  'Residents',
  'Payment',
  'Review & Submit',
]

function StepIndicator({ current }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i + 1 <= current ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Step {current} of {TOTAL_STEPS} — {STEP_LABELS[current - 1]}
      </p>
    </div>
  )
}

// ── Step 1: HOA Details ──────────────────────────────────────────────────────

function Step1({ onNext }) {
  const [form, setForm] = useState({ address: '', city: '', state: '', zip: '', unit_count: '' })
  const [error, setError] = useState('')

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const save = useMutation({
    mutationFn: (data) => api.post('/onboarding/step1', data),
    onSuccess: () => onNext(),
    onError: () => setError('Failed to save. Please try again.'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    save.mutate(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
      )}
      <div className="space-y-2">
        <Label htmlFor="address">Street address</Label>
        <Input id="address" placeholder="123 Oak Lane" value={form.address} onChange={set('address')} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" placeholder="Dallas" value={form.city} onChange={set('city')} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" placeholder="TX" maxLength={2} value={form.state} onChange={set('state')} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="zip">ZIP code</Label>
          <Input id="zip" placeholder="75201" value={form.zip} onChange={set('zip')} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit_count">Number of units</Label>
          <Input id="unit_count" type="number" min={1} max={400} placeholder="48" value={form.unit_count} onChange={set('unit_count')} required />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={save.isPending}>
        {save.isPending ? 'Saving…' : 'Continue'}
      </Button>
    </form>
  )
}

// ── Step 2: Invite Board Members ─────────────────────────────────────────────

function Step2({ onNext, onSkip }) {
  const [invites, setInvites] = useState([{ first_name: '', last_name: '', email: '', role: 'board_member' }])
  const [error, setError] = useState('')

  const addRow = () => setInvites((prev) => [...prev, { first_name: '', last_name: '', email: '', role: 'board_member' }])
  const removeRow = (i) => setInvites((prev) => prev.filter((_, idx) => idx !== i))
  const setField = (i, field) => (e) =>
    setInvites((prev) => prev.map((row, idx) => idx === i ? { ...row, [field]: e.target.value } : row))
  const setRole = (i) => (val) =>
    setInvites((prev) => prev.map((row, idx) => idx === i ? { ...row, role: val } : row))

  const save = useMutation({
    mutationFn: (data) => api.post('/onboarding/step2', data),
    onSuccess: () => onNext(),
    onError: () => setError('Failed to save. Please try again.'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const filled = invites.filter((r) => r.email.trim())
    save.mutate({ invites: filled })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
      )}
      <p className="text-sm text-muted-foreground">
        Invite emails are held until your HOA is approved. You can add more later.
      </p>
      <div className="space-y-3">
        {invites.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_1.5fr_auto_auto] gap-2 items-end">
            <div className="space-y-1">
              {i === 0 && <Label className="text-xs">First name</Label>}
              <Input
                placeholder="Jane"
                value={row.first_name}
                onChange={setField(i, 'first_name')}
              />
            </div>
            <div className="space-y-1">
              {i === 0 && <Label className="text-xs">Last name</Label>}
              <Input
                placeholder="Smith"
                value={row.last_name}
                onChange={setField(i, 'last_name')}
              />
            </div>
            <div className="space-y-1">
              {i === 0 && <Label className="text-xs">Email</Label>}
              <Input
                type="email"
                placeholder="jane@example.com"
                value={row.email}
                onChange={setField(i, 'email')}
              />
            </div>
            <div className="space-y-1">
              {i === 0 && <Label className="text-xs">Role</Label>}
              <Select value={row.role} onValueChange={setRole(i)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="board_member">Board member</SelectItem>
                  <SelectItem value="treasurer">Treasurer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className={i === 0 ? 'pt-5' : ''}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeRow(i)}
                disabled={invites.length === 1}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        <Plus className="h-4 w-4 mr-1" />
        Add another
      </Button>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onSkip}>
          Skip for now
        </Button>
        <Button type="submit" className="flex-1" disabled={save.isPending}>
          {save.isPending ? 'Saving…' : 'Continue'}
        </Button>
      </div>
    </form>
  )
}

// ── Step 3: Add Residents ─────────────────────────────────────────────────────

function Step3({ onNext, onSkip }) {
  const [tab, setTab] = useState('manual')
  const [rows, setRows] = useState([{ first_name: '', last_name: '', email: '', unit_number: '' }])
  const [csvFile, setCsvFile] = useState(null)
  const [error, setError] = useState('')

  const addRow = () => setRows((prev) => [...prev, { first_name: '', last_name: '', email: '', unit_number: '' }])
  const removeRow = (i) => setRows((prev) => prev.filter((_, idx) => idx !== i))
  const setField = (i, field) => (e) =>
    setRows((prev) => prev.map((row, idx) => idx === i ? { ...row, [field]: e.target.value } : row))

  const save = useMutation({
    mutationFn: (data) => api.post('/onboarding/step3', data),
    onSuccess: () => onNext(),
    onError: () => setError('Failed to save. Please try again.'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const filled = rows.filter((r) => r.email.trim() || r.unit_number.trim())
    save.mutate({ residents: filled })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
      )}
      <p className="text-sm text-muted-foreground">
        Invite emails are held until your HOA is approved. You can add residents later.
      </p>

      <div className="flex gap-2 border-b">
        {['manual', 'csv'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'
            }`}
          >
            {t === 'manual' ? 'Manual entry' : 'CSV upload'}
          </button>
        ))}
      </div>

      {tab === 'manual' && (
        <div className="space-y-3">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1.5fr_0.8fr_auto] gap-2 items-end">
              <div className="space-y-1">
                {i === 0 && <Label className="text-xs">First name</Label>}
                <Input placeholder="Carol" value={row.first_name} onChange={setField(i, 'first_name')} />
              </div>
              <div className="space-y-1">
                {i === 0 && <Label className="text-xs">Last name</Label>}
                <Input placeholder="Smith" value={row.last_name} onChange={setField(i, 'last_name')} />
              </div>
              <div className="space-y-1">
                {i === 0 && <Label className="text-xs">Email</Label>}
                <Input type="email" placeholder="carol@example.com" value={row.email} onChange={setField(i, 'email')} />
              </div>
              <div className="space-y-1">
                {i === 0 && <Label className="text-xs">Unit</Label>}
                <Input placeholder="4B" value={row.unit_number} onChange={setField(i, 'unit_number')} />
              </div>
              <div className={i === 0 ? 'pt-5' : ''}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRow(i)}
                  disabled={rows.length === 1}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <Plus className="h-4 w-4 mr-1" />
            Add another
          </Button>
        </div>
      )}

      {tab === 'csv' && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Upload a CSV with columns: first_name, last_name, email, unit_number
          </p>
          <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer hover:bg-muted/40 transition-colors">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm font-medium">
              {csvFile ? csvFile.name : 'Click to upload CSV'}
            </span>
            <span className="text-xs text-muted-foreground mt-1">CSV files only</span>
            <input
              type="file"
              accept=".csv"
              className="sr-only"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onSkip}>
          Skip for now
        </Button>
        <Button type="submit" className="flex-1" disabled={save.isPending}>
          {save.isPending ? 'Saving…' : 'Continue'}
        </Button>
      </div>
    </form>
  )
}

// ── Step 4: Payment Setup ────────────────────────────────────────────────────

function Step4({ onNext }) {
  const [form, setForm] = useState({ cardholder: '', number: '', expiry: '', cvc: '' })
  const [error, setError] = useState('')

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const save = useMutation({
    mutationFn: () => api.post('/onboarding/step4', {}),
    onSuccess: () => onNext(),
    onError: () => setError('Card setup failed. Please check your details and try again.'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    save.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
      )}
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
        <CreditCard className="h-4 w-4 shrink-0" />
        <span>Payments are processed securely by Stripe. Your card won't be charged until after approval.</span>
      </div>
      <div className="space-y-2">
        <Label htmlFor="cardholder">Cardholder name</Label>
        <Input id="cardholder" placeholder="Jane Smith" value={form.cardholder} onChange={set('cardholder')} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="number">Card number</Label>
        <Input id="number" placeholder="1234 5678 9012 3456" maxLength={19} value={form.number} onChange={set('number')} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="expiry">Expiry</Label>
          <Input id="expiry" placeholder="MM / YY" maxLength={7} value={form.expiry} onChange={set('expiry')} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cvc">CVC</Label>
          <Input id="cvc" placeholder="123" maxLength={4} value={form.cvc} onChange={set('cvc')} required />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={save.isPending}>
        {save.isPending ? 'Verifying card…' : 'Save payment method'}
      </Button>
    </form>
  )
}

// ── Step 5: Review & Submit ──────────────────────────────────────────────────

function Step5({ onSubmit }) {
  const { org } = useAuth()
  const [docFile, setDocFile] = useState(null)
  const [error, setError] = useState('')

  const submit = useMutation({
    mutationFn: () => api.post('/onboarding/submit', {}),
    onSuccess: () => onSubmit(),
    onError: () => setError('Submission failed. Please try again.'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!docFile) {
      setError('Please upload your HOA governing document to continue.')
      return
    }
    submit.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
      )}

      <div className="rounded-lg border divide-y text-sm">
        <div className="px-4 py-3 flex justify-between">
          <span className="text-muted-foreground">HOA name</span>
          <span className="font-medium">{org?.name || '—'}</span>
        </div>
        <div className="px-4 py-3 flex justify-between">
          <span className="text-muted-foreground">Plan</span>
          <span className="font-medium capitalize">{org?.plan || 'Starter'} — ${org?.plan === 'starter' ? '39' : org?.plan === 'growth' ? '89' : '169'}/mo</span>
        </div>
        <div className="px-4 py-3 flex justify-between">
          <span className="text-muted-foreground">Unit ceiling</span>
          <span className="font-medium">{org?.unit_ceiling || 50} units</span>
        </div>
        <div className="px-4 py-3 flex justify-between">
          <span className="text-muted-foreground">Trial</span>
          <span className="font-medium">60 days (starts after approval)</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>HOA governing document</Label>
        <p className="text-xs text-muted-foreground">
          Upload your CC&Rs, bylaws, or articles of incorporation. Required for verification.
        </p>
        <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted/40 transition-colors">
          <Upload className="h-6 w-6 text-muted-foreground mb-2" />
          <span className="text-sm font-medium">
            {docFile ? docFile.name : 'Click to upload document'}
          </span>
          <span className="text-xs text-muted-foreground mt-1">PDF, DOC, or DOCX</span>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="sr-only"
            onChange={(e) => setDocFile(e.target.files?.[0] || null)}
          />
        </label>
      </div>

      <Button type="submit" className="w-full" disabled={submit.isPending}>
        {submit.isPending ? 'Submitting…' : 'Submit for approval'}
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        Review typically takes 1–2 business days. You'll receive an email with the result.
      </p>
    </form>
  )
}

// ── Main Onboarding shell ────────────────────────────────────────────────────

export default function Onboarding() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { updateOrg } = useAuth()

  const step = Math.max(1, Math.min(5, parseInt(searchParams.get('step') || '1', 10)))

  const goToStep = (n) => {
    setSearchParams({ step: String(n) })
    updateOrg({ onboarding_step: n })
  }

  const STEP_TITLES = [
    'Tell us about your HOA',
    'Invite board members',
    'Add residents',
    'Set up payment',
    'Review & submit',
  ]
  const STEP_DESCRIPTIONS = [
    'We\'ll use this to set up your community.',
    'They\'ll receive invites once your HOA is approved.',
    'Residents will receive invites once your HOA is approved.',
    'A card is required to activate your account after approval.',
    'Submit your HOA for review by our team.',
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-xl space-y-6">
        <StepIndicator current={step} />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{STEP_TITLES[step - 1]}</CardTitle>
            <CardDescription>{STEP_DESCRIPTIONS[step - 1]}</CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && <Step1 onNext={() => goToStep(2)} />}
            {step === 2 && (
              <Step2
                onNext={() => goToStep(3)}
                onSkip={() => { api.post('/onboarding/step2', { invites: [] }); goToStep(3) }}
              />
            )}
            {step === 3 && (
              <Step3
                onNext={() => goToStep(4)}
                onSkip={() => { api.post('/onboarding/step3', { residents: [] }); goToStep(4) }}
              />
            )}
            {step === 4 && <Step4 onNext={() => goToStep(5)} />}
            {step === 5 && <Step5 onSubmit={() => navigate('/pending')} />}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
