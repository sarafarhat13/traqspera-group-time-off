import { useEffect, useMemo, useState } from 'react'
import {
  ModusWcButton,
  ModusWcIcon,
  ModusWcSelect,
} from '@trimble-oss/moduswebcomponents-react'

const STATUS_BADGE = {
  pending: 'bg-warning-100 text-warning-800 ring-warning-200',
  approved: 'bg-success-100 text-success-800 ring-success-200',
  declined: 'bg-danger-100 text-danger-800 ring-danger-200',
  mixed: 'bg-secondary-200 text-secondary-800 ring-secondary-300',
}

const DECISION_STYLES = {
  pending: 'bg-warning-100 text-warning-800 ring-warning-200',
  approved: 'bg-success-100 text-success-800 ring-success-200',
  declined: 'bg-danger-100 text-danger-800 ring-danger-200',
}

const GROUPS = [
  { id: 'approved', label: 'Approved', icon: 'check_circle', color: 'success' },
  { id: 'pending', label: 'Pending Approval', icon: 'clock', color: 'warning' },
  { id: 'declined', label: 'Declined', icon: 'cancel_circle', color: 'danger' },
]

const GROUP_COLORS = {
  success: {
    icon: 'text-success-600',
    headerText: 'text-success-700',
    headerBg: 'bg-success-50',
    border: 'border-success-200',
  },
  warning: {
    icon: 'text-warning-600',
    headerText: 'text-warning-800',
    headerBg: 'bg-warning-50',
    border: 'border-warning-200',
  },
  danger: {
    icon: 'text-danger-600',
    headerText: 'text-danger-700',
    headerBg: 'bg-danger-50',
    border: 'border-danger-200',
  },
}

function parseLocalDate(value) {
  if (!value) return null
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/
  if (dateOnly.test(value)) {
    const [y, m, day] = value.split('-').map(Number)
    return new Date(y, m - 1, day)
  }
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function formatDate(value) {
  const d = parseLocalDate(value)
  if (!d) return value ?? '—'
  return d.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(value) {
  const d = parseLocalDate(value)
  if (!d) return value ?? '—'
  const date = d.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const time = d
    .toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    .toLowerCase()
  return `${date} at ${time}`
}

function aggregateStatus(decisions) {
  if (decisions.length === 0) return 'pending'
  const set = new Set(decisions)
  if (set.size === 1) return decisions[0]
  return 'mixed'
}

function initials(name) {
  if (!name) return ''
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const GROUP_BY_OPTIONS = [
  { label: 'Status', value: 'status' },
  { label: 'Department', value: 'department' },
  { label: 'Role', value: 'role' },
]

export default function GroupRequestDetailPage({ request, open, onClose, onAction }) {
  useEffect(() => {
    if (!open) return
    function onEsc(e) {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onEsc)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onEsc)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open || !request) return null
  return <Body key={request.id} request={request} onClose={onClose} onAction={onAction} />
}

function Body({ request, onClose, onAction }) {
  const [employees, setEmployees] = useState(() =>
    request.employees.map((e) => ({ ...e })),
  )
  const [groupBy, setGroupBy] = useState('status')
  const [expanded, setExpanded] = useState({ approved: true, pending: true, declined: true })

  const numDays = request.days.length
  const hoursPerEmployee = numDays * (request.hoursPerDay ?? 8)
  const totalHours = employees.length * hoursPerEmployee

  const aggStatus = useMemo(
    () => aggregateStatus(employees.map((e) => e.decision)),
    [employees],
  )
  const approvedCount = employees.filter((e) => e.decision === 'approved').length
  const pendingCount = employees.filter((e) => e.decision === 'pending').length
  const declinedCount = employees.filter((e) => e.decision === 'declined').length
  const decidedCount = approvedCount + declinedCount
  const progressPct = employees.length === 0 ? 0 : (approvedCount / employees.length) * 100

  const grouped = useMemo(() => {
    if (groupBy === 'status') {
      return GROUPS.map((g) => ({
        ...g,
        rows: employees.filter((e) => e.decision === g.id),
      }))
    }
    const buckets = new Map()
    for (const e of employees) {
      const key = e[groupBy] ?? '—'
      if (!buckets.has(key)) buckets.set(key, [])
      buckets.get(key).push(e)
    }
    return Array.from(buckets.entries())
      .sort(([a], [b]) => String(a).localeCompare(String(b)))
      .map(([key, rows]) => ({
        id: key,
        label: key,
        icon: 'group',
        color: 'success',
        rows,
      }))
  }, [groupBy, employees])

  function setDecisionFor(ids, decision) {
    setEmployees((cur) =>
      cur.map((e) => (ids.includes(e.id) ? { ...e, decision } : e)),
    )
  }
  function approveAllPending() {
    setEmployees((cur) =>
      cur.map((e) => (e.decision === 'pending' ? { ...e, decision: 'approved' } : e)),
    )
  }
  function declineAllPending() {
    setEmployees((cur) =>
      cur.map((e) => (e.decision === 'pending' ? { ...e, decision: 'declined' } : e)),
    )
  }
  function submit(action) {
    onAction?.(action, {
      request: { ...request, employees, status: aggStatus },
    })
  }

  const statusClass = STATUS_BADGE[aggStatus] ?? STATUS_BADGE.pending
  const statusLabel = aggStatus.charAt(0).toUpperCase() + aggStatus.slice(1)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="group-detail-title"
      className="fixed top-0 right-0 bottom-0 left-16 z-40 flex flex-col bg-secondary-100 animate-fadeIn"
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-secondary-300 bg-secondary-200/70 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 text-sm font-medium text-secondary-700">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back to Time Off Requests"
            className="rounded-md p-1 text-secondary-700 hover:bg-secondary-300/60 hover:text-secondary-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <ModusWcIcon name="arrow_back" size="md" decorative />
          </button>
          <span>Group request details</span>
        </div>
        <div className="flex items-center gap-2">
          <ModusWcButton variant="outlined" color="tertiary" size="md" onButtonClick={onClose}>
            Cancel
          </ModusWcButton>
          <button
            type="button"
            onClick={() => submit('approve')}
            className="inline-flex items-center gap-2 rounded-md bg-success-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-success-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-success-500 focus-visible:ring-offset-2"
          >
            <ModusWcIcon name="thumbs_up" size="sm" decorative />
            Submit Decision
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-md border border-secondary-200 bg-white shadow-sm">
            <div className="p-5 sm:p-6">
              <h1
                id="group-detail-title"
                className="text-xl font-semibold text-secondary-900"
              >
                {request.type} Request
              </h1>

              <div className="mt-4 flex items-center gap-3 rounded-md bg-secondary-50 px-4 py-3">
                <div
                  aria-hidden
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-700 text-sm font-semibold text-white"
                >
                  {request.requestedBy.initials || initials(request.requestedBy.name)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-secondary-900">
                    {request.requestedBy.name}
                  </div>
                  <div className="truncate text-xs text-secondary-500">
                    Submitted by {request.requestedBy.name} on{' '}
                    {formatDateTime(request.requestedOn)}
                  </div>
                </div>
              </div>

              <dl className="mt-5 grid grid-cols-[120px_1fr] gap-y-3 text-sm">
                <DetailRow label="Date range">
                  {request.dateRange.start === request.dateRange.end
                    ? formatDate(request.dateRange.start)
                    : `${formatDate(request.dateRange.start)} - ${formatDate(request.dateRange.end)}`}
                </DetailRow>
                <DetailRow label="Hours per day">
                  {request.hoursPerDay}h × {numDays} day{numDays === 1 ? '' : 's'}
                </DetailRow>
                <DetailRow label="Approver">
                  {request.approver.name} — {request.approver.title}
                </DetailRow>
                {request.requesterComment && (
                  <DetailRow label="Description">{request.requesterComment}</DetailRow>
                )}
              </dl>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-secondary-900">Employees</h2>
                  <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-600 px-1.5 text-[11px] font-semibold text-white">
                    {employees.length}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-secondary-600">
                  <span className="font-medium">Group by</span>
                  <div className="min-w-[140px]">
                    <ModusWcSelect
                      aria-label="Group employees by"
                      size="sm"
                      options={GROUP_BY_OPTIONS}
                      value={groupBy}
                      onInputChange={(e) =>
                        setGroupBy(e.detail?.target?.value ?? 'status')
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-md bg-secondary-50 px-4 py-3 text-sm">
                <span className="font-semibold text-secondary-900">Total</span>
                <span className="text-base font-semibold text-secondary-900 tabular-nums">
                  {totalHours.toFixed(0)} hrs
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {grouped.map((group) => {
                  const palette = GROUP_COLORS[group.color] ?? GROUP_COLORS.success
                  const isExpanded = expanded[group.id] ?? true
                  if (group.rows.length === 0) return null
                  return (
                    <div
                      key={group.id}
                      className={`overflow-hidden rounded-md border ${palette.border}`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded((cur) => ({ ...cur, [group.id]: !isExpanded }))
                        }
                        aria-expanded={isExpanded}
                        className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition ${palette.headerBg} hover:brightness-[0.98]`}
                      >
                        <div className="flex items-center gap-2">
                          <ModusWcIcon
                            name={group.icon}
                            size="sm"
                            decorative
                            customClass={palette.icon}
                          />
                          <span className={`text-sm font-semibold ${palette.headerText}`}>
                            {group.label}{' '}
                            <span className="font-normal text-secondary-500">
                              ({group.rows.length} employee
                              {group.rows.length === 1 ? '' : 's'})
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-secondary-900 tabular-nums">
                            {(group.rows.length * hoursPerEmployee).toFixed(0)} hrs
                          </span>
                          <ModusWcIcon
                            name={isExpanded ? 'expand_less' : 'expand_more'}
                            size="sm"
                            decorative
                            customClass="text-secondary-500"
                          />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="bg-white">
                          <table className="w-full border-collapse text-sm">
                            <thead>
                              <tr className="border-b border-secondary-200 bg-secondary-50/60">
                                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-secondary-600">
                                  Employee
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-secondary-600">
                                  Department
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-secondary-600">
                                  Role
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-secondary-600">
                                  Hours
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-secondary-600">
                                  Status
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-secondary-600">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.rows.map((emp) => (
                                <EmployeeRow
                                  key={emp.id}
                                  emp={emp}
                                  hoursPerEmployee={hoursPerEmployee}
                                  onApprove={() => setDecisionFor([emp.id], 'approved')}
                                  onDecline={() => setDecisionFor([emp.id], 'declined')}
                                  onReset={() => setDecisionFor([emp.id], 'pending')}
                                />
                              ))}
                              <tr className="bg-secondary-50/40">
                                <td colSpan={3} />
                                <td className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-secondary-600">
                                  Total:
                                </td>
                                <td
                                  colSpan={2}
                                  className="px-3 py-2 text-left text-sm font-semibold text-secondary-900 tabular-nums"
                                >
                                  {(group.rows.length * hoursPerEmployee).toFixed(0)} hrs
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )
                })}

                {employees.length > 0 && grouped.every((g) => g.rows.length === 0) && (
                  <div className="rounded-md border border-secondary-200 bg-secondary-50 px-4 py-3 text-sm text-secondary-500">
                    No employees in this view.
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-md border border-secondary-200 bg-white shadow-sm">
              <div className="h-1 w-full bg-warning-400" aria-hidden />
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-secondary-900">Approvals</h2>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusClass}`}
                  >
                    {statusLabel}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-xs text-secondary-700">
                    <span className="font-semibold">Approvals Progress</span>
                    <span className="text-secondary-500">
                      {approvedCount} of {employees.length} approved
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary-100">
                    <div
                      className="h-full rounded-full bg-success-500 transition-all"
                      style={{ width: `${progressPct}%` }}
                      aria-hidden
                    />
                  </div>
                </div>

                <h3 className="mt-5 text-sm font-semibold text-secondary-800">
                  Employee Decisions
                </h3>

                <DecisionBucket
                  icon="check_circle"
                  iconClass="text-success-600"
                  textClass="text-success-700"
                  label={`Approved (${approvedCount} employee${approvedCount === 1 ? '' : 's'})`}
                  employees={employees.filter((e) => e.decision === 'approved')}
                  chipClass="bg-success-100 text-success-800 ring-success-200"
                />
                <DecisionBucket
                  icon="clock"
                  iconClass="text-warning-600"
                  textClass="text-warning-800"
                  label={`Pending Approval (${pendingCount} employee${pendingCount === 1 ? '' : 's'})`}
                  employees={employees.filter((e) => e.decision === 'pending')}
                  chipClass="bg-warning-100 text-warning-800 ring-warning-200"
                />
                <DecisionBucket
                  icon="cancel_circle"
                  iconClass="text-danger-600"
                  textClass="text-danger-700"
                  label={`Declined (${declinedCount} employee${declinedCount === 1 ? '' : 's'})`}
                  employees={employees.filter((e) => e.decision === 'declined')}
                  chipClass="bg-danger-100 text-danger-800 ring-danger-200"
                />

                {request.warning && declinedCount === 0 && pendingCount > 0 && (
                  <div
                    role="alert"
                    className="mt-4 rounded-md border-l-4 border-warning-400 bg-warning-50 px-3 py-2 text-xs text-secondary-800"
                  >
                    <div className="font-semibold text-secondary-900">
                      {request.warning.title}
                    </div>
                    <p className="mt-0.5 leading-snug">{request.warning.message}</p>
                  </div>
                )}

                <div className="mt-5 flex flex-col gap-2 border-t border-secondary-100 pt-4">
                  <ModusWcButton
                    variant="outlined"
                    color="tertiary"
                    size="sm"
                    fullWidth
                    onButtonClick={approveAllPending}
                    disabled={pendingCount === 0}
                  >
                    <ModusWcIcon name="thumbs_up" size="sm" decorative />
                    Approve all pending
                  </ModusWcButton>
                  <ModusWcButton
                    variant="outlined"
                    color="tertiary"
                    size="sm"
                    fullWidth
                    onButtonClick={declineAllPending}
                    disabled={pendingCount === 0}
                  >
                    <ModusWcIcon name="thumbs_down" size="sm" decorative />
                    Decline all pending
                  </ModusWcButton>
                </div>

                <div className="mt-3 text-[11px] text-secondary-500">
                  {decidedCount} of {employees.length} decisions made
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-md border border-secondary-200 bg-white px-4 py-3 text-xs text-secondary-700 shadow-sm">
              <ModusWcIcon
                name="info"
                size="sm"
                decorative
                customClass="mt-0.5 text-secondary-500"
              />
              <span>Declined employees can be reviewed and resubmitted by the requester.</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, children }) {
  return (
    <>
      <dt className="text-secondary-500">{label}</dt>
      <dd className="font-semibold text-secondary-900">{children}</dd>
    </>
  )
}

function EmployeeRow({ emp, hoursPerEmployee, onApprove, onDecline, onReset }) {
  const decisionClass =
    DECISION_STYLES[emp.decision] ?? 'bg-secondary-100 text-secondary-700 ring-secondary-200'
  return (
    <tr className="border-b border-secondary-100 last:border-b-0">
      <td className="px-4 py-2 align-middle">
        <div className="flex items-center gap-2">
          <div
            aria-hidden
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary-700 text-[11px] font-semibold text-white"
          >
            {emp.initials || initials(emp.name)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="truncate text-sm font-medium text-primary-700 hover:text-primary-800"
              >
                {emp.name}
              </a>
              <span className="rounded bg-secondary-100 px-1.5 py-0.5 font-mono text-[10px] text-secondary-600">
                #{emp.employeeNumber}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-3 py-2 align-middle text-xs text-secondary-700">
        {emp.department}
      </td>
      <td className="px-3 py-2 align-middle text-xs text-secondary-700">{emp.role}</td>
      <td className="px-3 py-2 align-middle text-right text-secondary-700 tabular-nums">
        {hoursPerEmployee.toFixed(0)}h
      </td>
      <td className="px-3 py-2 align-middle">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${decisionClass}`}
        >
          {emp.decision.charAt(0).toUpperCase() + emp.decision.slice(1)}
        </span>
      </td>
      <td className="px-3 py-2 align-middle">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={onApprove}
            aria-label={`Approve ${emp.name}`}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-md border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-success-500 ${
              emp.decision === 'approved'
                ? 'border-success-600 bg-success-600 text-white'
                : 'border-secondary-300 bg-white text-secondary-600 hover:border-success-500 hover:text-success-700'
            }`}
          >
            <ModusWcIcon name="thumbs_up" size="sm" decorative />
          </button>
          <button
            type="button"
            onClick={onDecline}
            aria-label={`Decline ${emp.name}`}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-md border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-danger-500 ${
              emp.decision === 'declined'
                ? 'border-danger-600 bg-danger-600 text-white'
                : 'border-secondary-300 bg-white text-secondary-600 hover:border-danger-500 hover:text-danger-700'
            }`}
          >
            <ModusWcIcon name="thumbs_down" size="sm" decorative />
          </button>
          {emp.decision !== 'pending' && (
            <button
              type="button"
              onClick={onReset}
              aria-label={`Reset decision for ${emp.name}`}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-secondary-300 bg-white text-secondary-600 transition hover:border-secondary-400 hover:text-secondary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-400"
            >
              <ModusWcIcon name="refresh" size="sm" decorative />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

function DecisionBucket({ icon, iconClass, textClass, label, employees, chipClass }) {
  if (employees.length === 0) return null
  return (
    <div className="mt-3">
      <div className="flex items-center gap-1.5">
        <ModusWcIcon name={icon} size="sm" decorative customClass={iconClass} />
        <span className={`text-sm font-semibold ${textClass}`}>{label}</span>
      </div>
      <div className="mt-1.5 ml-5 flex flex-wrap gap-1.5">
        {employees.map((emp) => (
          <span
            key={emp.id}
            title={`${emp.name} (#${emp.employeeNumber})`}
            className={`inline-flex h-6 items-center gap-1 rounded-full px-2 text-[11px] font-medium ring-1 ring-inset ${chipClass}`}
          >
            <span className="font-semibold tabular-nums">
              {emp.initials || initials(emp.name)}
            </span>
            <span className="font-mono text-[10px] opacity-75">
              #{emp.employeeNumber}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
