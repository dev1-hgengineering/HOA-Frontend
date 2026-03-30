// Test accounts — use these to log in
// board@test.com / password       → board_admin, approved, onboarding complete
// pending@test.com / password     → board_admin, awaiting super_admin review
// rejected@test.com / password    → board_admin, application rejected
// new@test.com / password         → board_admin, onboarding incomplete (step 2)
// treasurer@test.com / password   → treasurer
// member@test.com / password      → board_member
// resident@test.com / password    → resident
// admin@test.com / password       → super_admin

const orgs = {
  org1: {
    id: 'org1',
    name: 'Oakwood HOA',
    plan: 'starter',
    unit_ceiling: 50,
    approval_status: 'approved',
    onboarding_step: 5,
    onboarding_complete: true,
    trial_ends_at: '2026-05-30',
    rejection_reason: null,
  },
  org2: {
    id: 'org2',
    name: 'Maplewood HOA',
    plan: 'starter',
    unit_ceiling: 50,
    approval_status: 'pending',
    onboarding_step: 5,
    onboarding_complete: true,
    trial_ends_at: null,
    rejection_reason: null,
  },
  org3: {
    id: 'org3',
    name: 'Pinecrest HOA',
    plan: 'starter',
    unit_ceiling: 50,
    approval_status: 'rejected',
    onboarding_step: 5,
    onboarding_complete: true,
    trial_ends_at: null,
    rejection_reason: 'The uploaded verification document was illegible. Please resubmit with a clear, full-page scan of your HOA governing document.',
  },
  org4: {
    id: 'org4',
    name: 'Riverside HOA',
    plan: 'starter',
    unit_ceiling: 50,
    approval_status: 'pending',
    onboarding_step: 2,
    onboarding_complete: false,
    trial_ends_at: null,
    rejection_reason: null,
  },
}

export const users = [
  {
    id: '1',
    name: 'Alice Board',
    first_name: 'Alice',
    last_name: 'Board',
    email: 'board@test.com',
    password: 'password',
    role: 'board_admin',
    org_id: 'org1',
    org: orgs.org1,
  },
  {
    id: '5',
    name: 'Paula Pending',
    first_name: 'Paula',
    last_name: 'Pending',
    email: 'pending@test.com',
    password: 'password',
    role: 'board_admin',
    org_id: 'org2',
    org: orgs.org2,
  },
  {
    id: '6',
    name: 'Randy Rejected',
    first_name: 'Randy',
    last_name: 'Rejected',
    email: 'rejected@test.com',
    password: 'password',
    role: 'board_admin',
    org_id: 'org3',
    org: orgs.org3,
  },
  {
    id: '7',
    name: 'Nina New',
    first_name: 'Nina',
    last_name: 'New',
    email: 'new@test.com',
    password: 'password',
    role: 'board_admin',
    org_id: 'org4',
    org: orgs.org4,
  },
  {
    id: '2',
    name: 'Bob Treasurer',
    first_name: 'Bob',
    last_name: 'Treasurer',
    email: 'treasurer@test.com',
    password: 'password',
    role: 'treasurer',
    org_id: 'org1',
    org: orgs.org1,
  },
  {
    id: '8',
    name: 'Maria Member',
    first_name: 'Maria',
    last_name: 'Member',
    email: 'member@test.com',
    password: 'password',
    role: 'board_member',
    org_id: 'org1',
    org: orgs.org1,
  },
  {
    id: '3',
    name: 'Carol Resident',
    first_name: 'Carol',
    last_name: 'Resident',
    email: 'resident@test.com',
    password: 'password',
    role: 'resident',
    unit: 'Unit 4B',
    org_id: 'org1',
    org: null,
  },
  {
    id: '9',
    name: 'Sam Admin',
    first_name: 'Sam',
    last_name: 'Admin',
    email: 'admin@test.com',
    password: 'password',
    role: 'super_admin',
    org_id: null,
    org: null,
  },
]

export const residents = [
  { id: '1', name: 'Carol Resident', email: 'resident@test.com', unit: 'Unit 4B', active: true, created_at: '2025-01-10' },
  { id: '2', name: 'Dan Smith', email: 'dan@test.com', unit: 'Unit 2A', active: true, created_at: '2025-02-14' },
  { id: '3', name: 'Eve Johnson', email: 'eve@test.com', unit: 'Unit 6C', active: false, created_at: '2025-03-01' },
  { id: '4', name: 'Frank Lee', email: 'frank@test.com', unit: 'Unit 1D', active: true, created_at: '2025-03-15' },
]

export const boardMembers = [
  { id: '1', name: 'Alice Board', email: 'board@test.com', role: 'board_admin' },
  { id: '2', name: 'Bob Treasurer', email: 'treasurer@test.com', role: 'treasurer' },
  { id: '8', name: 'Maria Member', email: 'member@test.com', role: 'board_member' },
]

export const maintenanceRequests = [
  { id: '1', title: 'Leaking pipe in lobby', resident_name: 'Carol Resident', unit: 'Unit 4B', category: 'plumbing', status: 'open', description: 'Water dripping from ceiling near elevator.', created_at: '2026-03-20' },
  { id: '2', title: 'Broken gate latch', resident_name: 'Dan Smith', unit: 'Unit 2A', category: 'common_area', status: 'in_progress', description: 'The main gate latch is broken and does not close securely.', created_at: '2026-03-18' },
  { id: '3', title: 'Pest control needed', resident_name: 'Eve Johnson', unit: 'Unit 6C', category: 'pest_control', status: 'resolved', description: 'Ants in the hallway near unit 6C.', created_at: '2026-03-10' },
]

export const announcements = [
  { id: '1', title: 'Pool closure — April 5', body: 'The pool will be closed on April 5 for routine maintenance. We expect it to reopen by April 7.', author_name: 'Alice Board', created_at: '2026-03-28' },
  { id: '2', title: 'Annual HOA Meeting — April 15', body: 'Please join us for the annual HOA meeting on April 15 at 7pm in the community room. Agenda will be distributed by email.', author_name: 'Alice Board', created_at: '2026-03-25' },
]

export const dues = [
  { id: '1', resident_name: 'Carol Resident', unit: 'Unit 4B', amount: 250, due_date: '2026-04-01', status: 'pending' },
  { id: '2', resident_name: 'Dan Smith', unit: 'Unit 2A', amount: 250, due_date: '2026-03-01', status: 'paid' },
  { id: '3', resident_name: 'Eve Johnson', unit: 'Unit 6C', amount: 250, due_date: '2026-02-01', status: 'overdue' },
  { id: '4', resident_name: 'Frank Lee', unit: 'Unit 1D', amount: 250, due_date: '2026-04-01', status: 'pending' },
]

export const documents = [
  { id: '1', name: 'HOA Bylaws 2024.pdf', size: 204800, url: '#', created_at: '2025-06-01' },
  { id: '2', name: 'Community Rules.pdf', size: 102400, url: '#', created_at: '2025-06-15' },
  { id: '3', name: 'Budget 2026.xlsx', size: 51200, url: '#', created_at: '2026-01-10' },
]

// Resident invite tokens for /accept route
export const residentInviteTokens = {
  'resident-token-abc123': {
    email: 'newresident@test.com',
    unit: 'Unit 3C',
    org_name: 'Oakwood HOA',
    org_id: 'org1',
  },
}

// Board invite tokens for /invite route
export const boardInviteTokens = {
  'board-token-xyz789': {
    email: 'newmember@test.com',
    role: 'board_member',
    org_name: 'Oakwood HOA',
    org_id: 'org1',
  },
}
