// Mock data for the Traqspera Time Off prototype.
// All numbers/names are fictional and used to demonstrate the UI flow.

export const TIME_OFF_TYPES = [
  { id: 'pto', label: 'Paid Time Off', color: 'primary' },
  { id: 'holiday', label: 'Holiday', color: 'secondary' },
  { id: 'sick', label: 'Sick Day', color: 'warning' },
  { id: 'vacation', label: 'Vacation', color: 'success' },
  { id: 'team_trip', label: 'Team Trip', color: 'primary' },
]

export const APPROVERS = [
  { id: 'u-101', name: 'Alex Morgan', title: 'Director of Operations' },
  { id: 'u-102', name: 'Priya Patel', title: 'VP, People' },
  { id: 'u-103', name: 'Marcus Chen', title: 'Project Manager' },
  { id: 'u-104', name: 'Dana Reyes', title: 'HR Business Partner' },
]

export const UNIONS = ['Non-Union', 'IBEW Local 353', 'UA Local 46', 'LIUNA 183']
export const DEPARTMENTS = [
  'Field Operations',
  'Project Management',
  'Engineering',
  'Administration',
  'Safety',
  'Finance',
]
export const COST_CENTERS = [
  'CC-100 · HQ',
  'CC-210 · Site A',
  'CC-220 · Site B',
  'CC-310 · Fleet',
  'CC-410 · Shop',
]
export const ROLES = [
  'Foreman',
  'Journeyman',
  'Apprentice',
  'Site Supervisor',
  'Project Coordinator',
  'Estimator',
  'Safety Officer',
  'Admin Assistant',
]

const firstNames = [
  'Sara', 'John', 'Maria', 'David', 'Aisha', 'Ethan', 'Olivia', 'Noah',
  'Liam', 'Emma', 'Carlos', 'Sophia', 'James', 'Isabella', 'Benjamin',
  'Mia', 'Lucas', 'Charlotte', 'Mason', 'Amelia', 'Logan', 'Harper',
  'Jackson', 'Evelyn', 'Aiden', 'Abigail', 'Henry', 'Emily', 'Sebastian',
  'Elizabeth', 'Daniel', 'Sofia', 'Matthew', 'Avery', 'Jayden', 'Ella',
]
const lastNames = [
  'Farhat', 'Smith', 'Garcia', 'Johnson', 'Khan', 'Brown', 'Lee', 'Davis',
  'Martinez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson',
  'Martin', 'Lewis', 'Walker', 'Hall', 'Young', 'King', 'Wright', 'Lopez',
  'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Nelson', 'Carter', 'Mitchell',
  'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell',
]

function pick(arr, i) {
  return arr[i % arr.length]
}

// Generate 36 deterministic employees so the UI is consistent across renders.
export const EMPLOYEES = Array.from({ length: 36 }, (_, i) => {
  const id = 10000 + i + 1
  const first = pick(firstNames, i * 3 + 1)
  const last = pick(lastNames, i * 5 + 2)
  return {
    id: String(id),
    employeeNumber: String(id),
    name: `${first} ${last}`,
    initials: `${first[0]}${last[0]}`,
    role: pick(ROLES, i + 1),
    department: pick(DEPARTMENTS, i + 2),
    costCenter: pick(COST_CENTERS, i + 3),
    union: pick(UNIONS, i + 4),
    email: `${first.toLowerCase()}.${last.toLowerCase()}@traqspera.com`,
  }
})

// Calendar mock — April 2026 (matches the screenshot reference).
// Each event { date: 'YYYY-MM-DD', label, status }
export const CALENDAR_EVENTS = [
  { date: '2026-04-05', label: '10001 - Sara Farhat - Vacation', status: 'approved' },
  { date: '2026-04-06', label: '10001 - Sara Farhat - Vacation', status: 'approved' },
  { date: '2026-04-07', label: '10001 - Sara Farhat - Vacation', status: 'approved' },
  { date: '2026-04-12', label: '10002 - John Smith - PTO', status: 'pending' },
  { date: '2026-04-13', label: '10002 - John Smith - PTO', status: 'pending' },
  { date: '2026-04-14', label: '10002 - John Smith - PTO', status: 'declined' },
  { date: '2026-04-17', label: 'Mental Health Day - Company Holiday', status: 'holiday' },
  { date: '2026-04-21', label: '10002 - John Smith - PTO', status: 'declined' },
  { date: '2026-04-22', label: '10002 - John Smith - Vacation', status: 'approved' },
  { date: '2026-04-23', label: '10002 - John Smith - Vacation', status: 'approved' },
  { date: '2026-04-24', label: '10002 - John Smith - Vacation', status: 'approved' },
]

// Blackout / company event blocks
export const BLOCK_EVENTS = [
  // Spring Product Launch — week long blackout
  ...['2026-04-19', '2026-04-20', '2026-04-21', '2026-04-22', '2026-04-23', '2026-04-24', '2026-04-25'].map((d) => ({
    date: d, label: 'Spring Product Launch', status: 'blackout',
  })),
  // Inventory Count
  ...['2026-04-25', '2026-04-26', '2026-04-27', '2026-04-28', '2026-04-29', '2026-04-30'].map((d) => ({
    date: d, label: 'Inventory Count', status: 'blackout',
  })),
]

export const BALANCES = [
  { id: 'holiday2', label: 'Holiday 2', icon: 'calendar', hours: 0.0 },
  { id: 'sick', label: 'Sick 1', icon: 'thermometer', hours: 0.0 },
  { id: 'holiday1', label: 'Holiday 1', icon: 'calendar', hours: -16.0 },
]
