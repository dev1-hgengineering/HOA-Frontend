// Test accounts — use these to log in
export const users = [
  {
    id: '1',
    name: 'Alice Board',
    email: 'board@test.com',
    password: 'password',
    role: 'board_admin',
    unit: null,
  },
  {
    id: '2',
    name: 'Bob Treasurer',
    email: 'treasurer@test.com',
    password: 'password',
    role: 'treasurer',
    unit: null,
  },
  {
    id: '3',
    name: 'Carol Resident',
    email: 'resident@test.com',
    password: 'password',
    role: 'resident',
    unit: 'Unit 4B',
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
