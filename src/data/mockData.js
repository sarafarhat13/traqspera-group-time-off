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
export const EMPLOYMENT_STATUSES = [
  'Full-Time',
  'Part-Time',
  'Contract',
  'Seasonal',
  'Temporary',
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
    employmentStatus: pick(EMPLOYMENT_STATUSES, i * 2 + 1),
    email: `${first.toLowerCase()}.${last.toLowerCase()}@traqspera.com`,
  }
})

// Calendar mock — April 2026 (matches the screenshot reference).
// Each event { date: 'YYYY-MM-DD', label, status, requestId?, kind? }
// kind: 'group' marks employer-wide team time-off; default is individual.
export const CALENDAR_EVENTS = [
  { date: '2026-04-01', label: 'Q2 Safety Training (24 employees)', status: 'pending', requestId: 'grp-100', kind: 'group' },
  { date: '2026-04-02', label: 'Q2 Safety Training (24 employees)', status: 'pending', requestId: 'grp-100', kind: 'group' },
  { date: '2026-04-05', label: '10001 - Sara Farhat - Vacation', status: 'approved' },
  { date: '2026-04-06', label: '10001 - Sara Farhat - Vacation', status: 'approved' },
  { date: '2026-04-07', label: '10001 - Sara Farhat - Vacation', status: 'approved' },
  { date: '2026-04-12', label: '10002 - John Smith - PTO', status: 'pending', requestId: 'req-482' },
  { date: '2026-04-13', label: '10002 - John Smith - PTO', status: 'pending', requestId: 'req-482' },
  { date: '2026-04-14', label: '10002 - John Smith - PTO', status: 'declined', requestId: 'req-482' },
  { date: '2026-04-17', label: 'Mental Health Day - Company Holiday', status: 'holiday' },
  { date: '2026-04-21', label: '10002 - John Smith - PTO', status: 'declined', requestId: 'req-512' },
  { date: '2026-04-22', label: '10002 - John Smith - Vacation', status: 'approved' },
  { date: '2026-04-23', label: '10002 - John Smith - Vacation', status: 'approved' },
  { date: '2026-04-24', label: '10002 - John Smith - Vacation', status: 'approved' },
  { date: '2026-04-27', label: 'Engineering Offsite (8 employees)', status: 'approved', requestId: 'grp-101', kind: 'group' },
  { date: '2026-04-28', label: 'Engineering Offsite (8 employees)', status: 'approved', requestId: 'grp-101', kind: 'group' },
]

// Full request payloads keyed by id (powering the request detail modal).
export const REQUESTS = {
  'req-482': {
    id: 'req-482',
    requestNumber: 482,
    employee: {
      id: '10002',
      employeeNumber: '10002',
      name: 'Dwayne Johnson',
      initials: 'DJ',
    },
    status: 'pending',
    requestedOn: '2026-04-09T13:20:00',
    type: 'Vacation 1',
    dateRange: { start: '2026-04-13', end: '2026-04-17' },
    requesterComment: 'Going to visit family in London.',
    days: [
      { date: '2026-04-13', hours: 4, conflict: false },
      { date: '2026-04-14', hours: 4, conflict: true },
      { date: '2026-04-15', hours: 8, conflict: false },
      { date: '2026-04-16', hours: 8, conflict: false },
      { date: '2026-04-17', hours: 8, conflict: false },
    ],
    totalHours: 32,
    balance: { vacation: 12, sick: 0 },
    warning: {
      kind: 'limit',
      title: 'Daily absence limit exceeded',
      message:
        'Approving this request will exceed the recommended daily absence limit for this date range. Please review coverage before approving.',
    },
    history: [
      { at: '2026-04-09T13:20:00', actor: 'Dwayne Johnson', action: 'Submitted request' },
    ],
  },
  'req-512': {
    id: 'req-512',
    requestNumber: 512,
    employee: {
      id: '10002',
      employeeNumber: '10002',
      name: 'Dwayne Johnson',
      initials: 'DJ',
    },
    status: 'pending',
    requestedOn: '2026-04-15T09:05:00',
    type: 'Vacation 1',
    dateRange: { start: '2026-04-21', end: '2026-04-21' },
    requesterComment: 'Day off requested during product launch week.',
    days: [
      { date: '2026-04-21', hours: 8, conflict: true },
    ],
    totalHours: 8,
    balance: { vacation: 12, sick: 0 },
    warning: {
      kind: 'blackout',
      title: 'Blackout date(s) requested',
      message:
        'This request overrides company blackout date(s). Please review coverage before approving.',
    },
    history: [
      { at: '2026-04-15T09:05:00', actor: 'Dwayne Johnson', action: 'Submitted request' },
    ],
  },
}

// Full group-request payloads keyed by id (powering the group detail page).
// Each request has a sequential approvalChain that moves Manager → HR → Payroll.
function groupEmployees(indices) {
  return indices.map((i) => ({
    ...EMPLOYEES[i % EMPLOYEES.length],
  }))
}

export const GROUP_REQUESTS = {
  'grp-100': {
    id: 'grp-100',
    requestNumber: 100,
    kind: 'group',
    requestedBy: {
      id: 'u-105',
      name: 'Jordan Rivera',
      title: 'Field Operations Manager',
      initials: 'JR',
    },
    status: 'pending',
    requestedOn: '2026-03-22T10:15:00',
    type: 'Mandatory Training',
    dateRange: { start: '2026-04-01', end: '2026-04-02' },
    hoursPerDay: 8,
    requesterComment:
      'Mandatory Q2 safety re-certification for all field crews. Coverage has been arranged with subcontractors.',
    days: [
      { date: '2026-04-01', conflict: false },
      { date: '2026-04-02', conflict: false },
    ],
    employees: groupEmployees(
      [0, 2, 3, 5, 6, 8, 9, 11, 12, 14, 15, 17, 18, 20, 21, 23, 24, 26, 27, 29, 30, 32, 33, 35],
    ),
    approvalChain: [
      {
        id: 'step-mgr',
        role: 'Direct Manager',
        approver: {
          id: 'u-101',
          name: 'Alex Morgan',
          title: 'Director of Operations',
          initials: 'AM',
        },
        status: 'approved',
        actedOn: '2026-03-23T08:42:00',
        comment: 'Coverage looks good for the dates requested.',
      },
      {
        id: 'step-hr',
        role: 'HR Business Partner',
        approver: {
          id: 'u-104',
          name: 'Dana Reyes',
          title: 'HR Business Partner',
          initials: 'DR',
        },
        status: 'pending',
        actedOn: null,
        comment: null,
        isCurrentUser: true,
      },
      {
        id: 'step-payroll',
        role: 'Payroll',
        approver: {
          id: 'u-107',
          name: 'Lin Chen',
          title: 'Payroll Manager',
          initials: 'LC',
        },
        status: 'awaiting',
        actedOn: null,
        comment: null,
      },
    ],
    warning: {
      kind: 'coverage',
      title: '24 employees out for 2 consecutive days',
      message:
        'Approving this request will exceed the recommended daily absence limit for Field Operations. Please confirm coverage before approving.',
    },
  },
  'grp-101': {
    id: 'grp-101',
    requestNumber: 101,
    kind: 'group',
    requestedBy: {
      id: 'u-106',
      name: 'Priya Patel',
      title: 'VP, People',
      initials: 'PP',
    },
    status: 'approved',
    requestedOn: '2026-03-30T09:00:00',
    type: 'Team Trip',
    dateRange: { start: '2026-04-27', end: '2026-04-28' },
    hoursPerDay: 8,
    requesterComment:
      'Engineering team offsite at the lakeside conference center — planning workshop and Q3 roadmap.',
    days: [
      { date: '2026-04-27', conflict: false },
      { date: '2026-04-28', conflict: false },
    ],
    employees: groupEmployees([1, 4, 7, 10, 13, 16, 19, 22]),
    approvalChain: [
      {
        id: 'step-mgr',
        role: 'Direct Manager',
        approver: {
          id: 'u-103',
          name: 'Marcus Chen',
          title: 'Project Manager',
          initials: 'MC',
        },
        status: 'approved',
        actedOn: '2026-03-30T14:12:00',
        comment: 'Approved — roadmap planning is critical.',
      },
      {
        id: 'step-hr',
        role: 'HR Business Partner',
        approver: {
          id: 'u-104',
          name: 'Dana Reyes',
          title: 'HR Business Partner',
          initials: 'DR',
        },
        status: 'approved',
        actedOn: '2026-03-31T09:18:00',
        comment: null,
      },
      {
        id: 'step-payroll',
        role: 'Payroll',
        approver: {
          id: 'u-107',
          name: 'Lin Chen',
          title: 'Payroll Manager',
          initials: 'LC',
        },
        status: 'approved',
        actedOn: '2026-03-31T15:40:00',
        comment: 'PTO accrual will be applied accordingly.',
      },
    ],
  },
}

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
