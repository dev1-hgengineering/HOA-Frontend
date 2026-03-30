import { http, HttpResponse, delay } from 'msw'
import {
  users, residents, boardMembers, maintenanceRequests,
  announcements, dues, documents, residentInviteTokens, boardInviteTokens,
} from './data'

// In-memory session (persists for the browser tab)
let currentUser = null
let currentOrg = null
let mockResidents = [...residents]
let mockRequests = [...maintenanceRequests]
let mockAnnouncements = [...announcements]
let mockDocs = [...documents]
let nextId = 100

const base = '/api'

export const handlers = [
  // ── Auth ────────────────────────────────────────────────────────────────────

  http.get(`${base}/auth/me`, async () => {
    await delay(150)
    if (!currentUser) return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return HttpResponse.json({ user: currentUser, org: currentOrg })
  }),

  http.post(`${base}/auth/login`, async ({ request }) => {
    await delay(400)
    const { email, password } = await request.json()
    const found = users.find((u) => u.email === email && u.password === password)
    if (!found) return HttpResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    const { password: _, ...safeUser } = found
    currentUser = safeUser
    currentOrg = safeUser.org || null
    return HttpResponse.json({ user: safeUser, org: currentOrg })
  }),

  http.post(`${base}/auth/logout`, async () => {
    await delay(200)
    currentUser = null
    currentOrg = null
    return HttpResponse.json({ ok: true })
  }),

  http.post(`${base}/auth/signup`, async ({ request }) => {
    await delay(600)
    const { hoa_name, first_name, last_name, email, password } = await request.json()

    // Check email already in use
    if (users.find((u) => u.email === email)) {
      return HttpResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    const newOrg = {
      id: `org-${++nextId}`,
      name: hoa_name,
      plan: 'starter',
      unit_ceiling: 50,
      approval_status: 'pending',
      onboarding_step: 1,
      onboarding_complete: false,
      trial_ends_at: null,
      rejection_reason: null,
    }
    const newUser = {
      id: String(++nextId),
      name: `${first_name} ${last_name}`,
      first_name,
      last_name,
      email,
      role: 'board_admin',
      org_id: newOrg.id,
      org: newOrg,
    }
    currentUser = newUser
    currentOrg = newOrg
    return HttpResponse.json({ user: newUser, org: newOrg })
  }),

  http.post(`${base}/auth/forgot-password`, async () => {
    await delay(600)
    return HttpResponse.json({ ok: true })
  }),

  http.post(`${base}/auth/reset-password`, async () => {
    await delay(400)
    return HttpResponse.json({ ok: true })
  }),

  // Accept invite for board_member / treasurer
  http.get(`${base}/auth/invite`, async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const token = url.searchParams.get('token')
    const invite = boardInviteTokens[token]
    if (!invite) return HttpResponse.json({ error: 'Invalid or expired invite link' }, { status: 400 })
    return HttpResponse.json(invite)
  }),

  http.post(`${base}/auth/accept-invite`, async ({ request }) => {
    await delay(400)
    const { token, first_name, last_name, password } = await request.json()
    const invite = boardInviteTokens[token]
    if (!invite) return HttpResponse.json({ error: 'Invalid or expired invite link' }, { status: 400 })

    const user = {
      id: String(++nextId),
      name: `${first_name} ${last_name}`,
      first_name,
      last_name,
      email: invite.email,
      role: invite.role,
      org_id: invite.org_id,
      org: null,
    }
    currentUser = user
    currentOrg = null
    return HttpResponse.json({ user })
  }),

  // Accept invite for residents
  http.get(`${base}/auth/resident-invite`, async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const token = url.searchParams.get('token')
    const invite = residentInviteTokens[token]
    if (!invite) return HttpResponse.json({ error: 'Invalid or expired invite link' }, { status: 400 })
    return HttpResponse.json(invite)
  }),

  http.post(`${base}/auth/accept-resident`, async ({ request }) => {
    await delay(400)
    const { token, first_name, last_name, password } = await request.json()
    const invite = residentInviteTokens[token]
    if (!invite) return HttpResponse.json({ error: 'Invalid or expired invite link' }, { status: 400 })

    const user = {
      id: String(++nextId),
      name: `${first_name} ${last_name}`,
      first_name,
      last_name,
      email: invite.email,
      role: 'resident',
      unit: invite.unit,
      org_id: invite.org_id,
      org: null,
    }
    currentUser = user
    currentOrg = null
    return HttpResponse.json({ user })
  }),

  // ── Onboarding ──────────────────────────────────────────────────────────────

  http.post(`${base}/onboarding/step1`, async ({ request }) => {
    await delay(400)
    const data = await request.json()
    if (currentOrg) {
      Object.assign(currentOrg, { ...data, onboarding_step: 2 })
      if (currentUser) currentUser.org = currentOrg
    }
    return HttpResponse.json({ ok: true })
  }),

  http.post(`${base}/onboarding/step2`, async ({ request }) => {
    await delay(400)
    // board member invites — just acknowledge in mock
    if (currentOrg) {
      currentOrg.onboarding_step = 3
      if (currentUser) currentUser.org = currentOrg
    }
    return HttpResponse.json({ ok: true })
  }),

  http.post(`${base}/onboarding/step3`, async ({ request }) => {
    await delay(400)
    // resident invites — just acknowledge in mock
    if (currentOrg) {
      currentOrg.onboarding_step = 4
      if (currentUser) currentUser.org = currentOrg
    }
    return HttpResponse.json({ ok: true })
  }),

  http.post(`${base}/onboarding/step4`, async ({ request }) => {
    await delay(800)
    // payment setup — always succeeds in mock
    if (currentOrg) {
      currentOrg.onboarding_step = 5
      if (currentUser) currentUser.org = currentOrg
    }
    return HttpResponse.json({ ok: true })
  }),

  http.post(`${base}/onboarding/submit`, async ({ request }) => {
    await delay(600)
    if (currentOrg) {
      currentOrg.onboarding_step = 5
      currentOrg.onboarding_complete = true
      currentOrg.approval_status = 'pending'
      if (currentUser) currentUser.org = currentOrg
    }
    return HttpResponse.json({ ok: true })
  }),

  // ── Board: Dashboard ────────────────────────────────────────────────────────

  http.get(`${base}/board/dashboard`, async () => {
    await delay(300)
    return HttpResponse.json({
      resident_count: mockResidents.length,
      dues_collected: dues.filter((d) => d.status === 'paid').reduce((s, d) => s + d.amount, 0),
      open_requests: mockRequests.filter((r) => r.status === 'open').length,
      announcement_count: mockAnnouncements.length,
      recent_requests: mockRequests.slice(0, 3),
      recent_announcements: mockAnnouncements.slice(0, 3),
    })
  }),

  // ── Board: Residents ────────────────────────────────────────────────────────

  http.get(`${base}/board/residents`, async () => {
    await delay(300)
    return HttpResponse.json(mockResidents)
  }),

  http.post(`${base}/board/residents/invite`, async ({ request }) => {
    await delay(500)
    const { email, unit } = await request.json()
    mockResidents = [...mockResidents, {
      id: String(++nextId), name: null, email, unit, active: false,
      created_at: new Date().toISOString(),
    }]
    return HttpResponse.json({ ok: true })
  }),

  // ── Board: Dues ─────────────────────────────────────────────────────────────

  http.get(`${base}/board/dues`, async () => {
    await delay(300)
    const paid = dues.filter((d) => d.status === 'paid')
    const total = dues.reduce((s, d) => s + d.amount, 0)
    const collected = paid.reduce((s, d) => s + d.amount, 0)
    return HttpResponse.json({
      dues,
      total_collected: collected,
      overdue_count: dues.filter((d) => d.status === 'overdue').length,
      collection_rate: Math.round((collected / total) * 100),
    })
  }),

  http.post(`${base}/board/dues/reminders`, async () => {
    await delay(600)
    return HttpResponse.json({ ok: true })
  }),

  // ── Board: Maintenance ──────────────────────────────────────────────────────

  http.get(`${base}/board/maintenance`, async () => {
    await delay(300)
    return HttpResponse.json(mockRequests)
  }),

  http.patch(`${base}/board/maintenance/:id`, async ({ params, request }) => {
    await delay(400)
    const { status, note } = await request.json()
    mockRequests = mockRequests.map((r) =>
      r.id === params.id ? { ...r, status, note } : r
    )
    return HttpResponse.json({ ok: true })
  }),

  // ── Board: Announcements ────────────────────────────────────────────────────

  http.get(`${base}/board/announcements`, async () => {
    await delay(300)
    return HttpResponse.json(mockAnnouncements)
  }),

  http.post(`${base}/board/announcements`, async ({ request }) => {
    await delay(400)
    const { title, body } = await request.json()
    const a = {
      id: String(++nextId), title, body,
      author_name: currentUser?.name || 'Board',
      created_at: new Date().toISOString(),
    }
    mockAnnouncements = [a, ...mockAnnouncements]
    return HttpResponse.json(a)
  }),

  http.delete(`${base}/board/announcements/:id`, async ({ params }) => {
    await delay(300)
    mockAnnouncements = mockAnnouncements.filter((a) => a.id !== params.id)
    return HttpResponse.json({ ok: true })
  }),

  // ── Board: Documents ────────────────────────────────────────────────────────

  http.get(`${base}/board/documents`, async () => {
    await delay(300)
    return HttpResponse.json(mockDocs)
  }),

  http.post(`${base}/board/documents`, async ({ request }) => {
    await delay(800)
    const form = await request.formData()
    const file = form.get('file')
    const doc = {
      id: String(++nextId),
      name: file?.name || 'document.pdf',
      size: file?.size || 0,
      url: '#',
      created_at: new Date().toISOString(),
    }
    mockDocs = [doc, ...mockDocs]
    return HttpResponse.json(doc)
  }),

  http.delete(`${base}/board/documents/:id`, async ({ params }) => {
    await delay(300)
    mockDocs = mockDocs.filter((d) => d.id !== params.id)
    return HttpResponse.json({ ok: true })
  }),

  // ── Board: Members ──────────────────────────────────────────────────────────

  http.get(`${base}/board/members`, async () => {
    await delay(300)
    return HttpResponse.json(boardMembers)
  }),

  http.post(`${base}/board/members/invite`, async () => {
    await delay(500)
    return HttpResponse.json({ ok: true })
  }),

  // ── Board: Settings ─────────────────────────────────────────────────────────

  http.get(`${base}/board/settings`, async () => {
    await delay(300)
    return HttpResponse.json({
      name: 'Oakwood HOA',
      dues_amount: 250,
      dues_due_day: 1,
    })
  }),

  http.patch(`${base}/board/settings`, async () => {
    await delay(400)
    return HttpResponse.json({ ok: true })
  }),

  // ── Board: Reports ──────────────────────────────────────────────────────────

  http.get(`${base}/board/reports`, async () => {
    await delay(300)
    return HttpResponse.json({
      dues: { total_collected: 250, total_outstanding: 750, collection_rate: 25, overdue_count: 1 },
      maintenance: { total: 3, open: 1, in_progress: 1, resolved: 1 },
    })
  }),

  // ── Resident ────────────────────────────────────────────────────────────────

  http.get(`${base}/resident/dashboard`, async () => {
    await delay(300)
    const myDues = dues.find((d) => d.resident_name === currentUser?.name) || dues[0]
    return HttpResponse.json({
      dues: myDues,
      requests: mockRequests.filter((r) => r.resident_name === currentUser?.name),
      announcements: mockAnnouncements,
    })
  }),

  http.post(`${base}/resident/maintenance`, async ({ request }) => {
    await delay(500)
    const { title, category, description } = await request.json()
    const r = {
      id: String(++nextId), title, category, description,
      resident_name: currentUser?.name,
      unit: currentUser?.unit,
      status: 'open',
      created_at: new Date().toISOString(),
    }
    mockRequests = [r, ...mockRequests]
    return HttpResponse.json(r)
  }),

  http.get(`${base}/resident/profile`, async () => {
    await delay(300)
    return HttpResponse.json(currentUser)
  }),

  http.patch(`${base}/resident/profile`, async ({ request }) => {
    await delay(400)
    const updates = await request.json()
    currentUser = { ...currentUser, ...updates }
    return HttpResponse.json(currentUser)
  }),

  http.post(`${base}/resident/change-password`, async () => {
    await delay(400)
    return HttpResponse.json({ ok: true })
  }),
]
