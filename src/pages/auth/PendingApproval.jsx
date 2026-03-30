import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Clock, XCircle, Upload, LogOut } from 'lucide-react'

function PendingView({ org }) {
  const submittedDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center">
          <Clock className="h-7 w-7 text-amber-600" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <h1 className="text-xl font-semibold">Application under review</h1>
        <p className="text-sm text-muted-foreground">
          We received your submission and will review it within 1–2 business days.
        </p>
      </div>
      <div className="rounded-lg border divide-y text-sm">
        <div className="px-4 py-3 flex justify-between">
          <span className="text-muted-foreground">HOA</span>
          <span className="font-medium">{org?.name || '—'}</span>
        </div>
        <div className="px-4 py-3 flex justify-between">
          <span className="text-muted-foreground">Status</span>
          <span className="text-amber-600 font-medium">Awaiting review</span>
        </div>
        <div className="px-4 py-3 flex justify-between">
          <span className="text-muted-foreground">Submitted</span>
          <span className="font-medium">{submittedDate}</span>
        </div>
      </div>
      <p className="text-sm text-center text-muted-foreground">
        You'll receive an email at <span className="text-foreground font-medium">{org?.email || 'your email'}</span> when your application is reviewed.
      </p>
    </div>
  )
}

function RejectedView({ org, onResubmit, resubmitting }) {
  const [docFile, setDocFile] = useState(null)
  const [fileError, setFileError] = useState('')

  const handleResubmit = (e) => {
    e.preventDefault()
    setFileError('')
    if (!docFile) {
      setFileError('Please upload a new document before resubmitting.')
      return
    }
    onResubmit(docFile)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
          <XCircle className="h-7 w-7 text-destructive" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <h1 className="text-xl font-semibold">Application not approved</h1>
        <p className="text-sm text-muted-foreground">
          Your application for <span className="font-medium text-foreground">{org?.name}</span> was not approved.
        </p>
      </div>

      {org?.rejection_reason && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm font-medium text-destructive mb-1">Reason</p>
          <p className="text-sm text-muted-foreground">{org.rejection_reason}</p>
        </div>
      )}

      <form onSubmit={handleResubmit} className="space-y-4">
        {fileError && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{fileError}</p>
        )}
        <div className="space-y-2">
          <p className="text-sm font-medium">Upload new document</p>
          <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted/40 transition-colors">
            <Upload className="h-6 w-6 text-muted-foreground mb-2" />
            <span className="text-sm font-medium">
              {docFile ? docFile.name : 'Click to upload'}
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
        <Button type="submit" className="w-full" disabled={resubmitting}>
          {resubmitting ? 'Resubmitting…' : 'Resubmit application'}
        </Button>
      </form>
    </div>
  )
}

export default function PendingApproval() {
  const { user, org, logout, updateOrg } = useAuth()
  const navigate = useNavigate()
  const [resubmitted, setResubmitted] = useState(false)

  const status = org?.approval_status || 'pending'

  const resubmit = useMutation({
    mutationFn: (file) => {
      const form = new FormData()
      form.append('document', file)
      return api.post('/onboarding/submit', form)
    },
    onSuccess: () => {
      updateOrg({ approval_status: 'resubmitted', rejection_reason: null })
      setResubmitted(true)
    },
  })

  const displayStatus = resubmitted ? 'resubmitted' : status

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardContent className="pt-6 pb-6">
            {(displayStatus === 'pending' || displayStatus === 'resubmitted') && (
              <PendingView org={org} />
            )}
            {displayStatus === 'rejected' && (
              <RejectedView
                org={org}
                onResubmit={(file) => resubmit.mutate(file)}
                resubmitting={resubmit.isPending}
              />
            )}
          </CardContent>
        </Card>

        <button
          onClick={logout}
          className="flex items-center gap-2 mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}
