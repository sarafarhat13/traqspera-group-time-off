import { useEffect, useMemo, useState } from 'react'
import {
  ModusWcButton,
  ModusWcIcon,
  ModusWcTextarea,
  ModusWcAvatar,
  ModusWcChip,
  ModusWcTextInput,
} from '@trimble-oss/moduswebcomponents-react'

const STATUS_BADGE = {
  pending: 'bg-warning-400 text-secondary-900',
  approved: 'bg-success-600 text-white',
  declined: 'bg-danger-500 text-white',
  mixed: 'bg-secondary-700 text-white',
}

const DECISION_STYLES = {
  pending: 'bg-warning-100 text-warning-800 ring-warning-200',
  approved: 'bg-success-100 text-success-800 ring-success-200',
  declined: 'bg-danger-100 text-danger-800 ring-danger-200',
}

const STATUS_PILL_STYLES = {
  'Full-Time': 'bg-success-100 text-success-800 ring-success-200',
  'Part-Time': 'bg-primary-100 text-primary-800 ring-primary-200',
  Contract: 'bg-warning-100 text-warning-800 ring-warning-200',
  Seasonal: 'bg-secondary-200 text-secondary-700 ring-secondary-300',
  Temporary: 'bg-danger-100 text-danger-800 ring-danger-200',
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

export default function GroupRequestDetailModal({ request, open, onClose, onAction }) {
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
  const [comment, setComment] = useState('')
  const [search, setSearch] = useState('')
  const [historyOpen, setHistoryOpen] = useState(false)

  const numDays = request.days.length
  const hoursPerEmployee = numDays * (request.hoursPerDay ?? 8)
  const totalHours = employees.length * hoursPerEmployee
  const aggStatus = useMemo(
    () => aggregateStatus(employees.map((e) => e.decision)),
    [employees],
  )
  const statusClass = STATUS_BADGE[aggStatus] ?? 'bg-secondary-300 text-secondary-800'
  const statusLabel = aggStatus.charAt(0).toUpperCase() + aggStatus.slice(1)
  const pendingCount = employees.filter((e) => e.decision === 'pending').length

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return employees
    return employees.filter((e) =>
      `${e.name} ${e.employeeNumber} ${e.role} ${e.department}`
        .toLowerCase()
        .includes(q),
    )
  }, [employees, search])

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
      comment,
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="group-detail-title"
      className="fixed inset-0 z-40 flex items-center justify-center bg-secondary-900/50 px-4 py-6 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl animate-scaleIn">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-secondary-200 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <ModusWcIcon name="people_group" size="md" decorative />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="group-detail-title" className="text-base font-semibold text-secondary-900">
                  Group Request #{request.requestNumber} — {request.type}
                </h2>
                <span
                  className={`inline-flex shrink-0 items-center rounded px-2 py-0.5 text-xs font-semibold ${statusClass}`}
                >
                  {statusLabel}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-secondary-500">
                Submitted by{' '}
                <span className="font-medium text-secondary-700">
                  {request.requestedBy.name}
                </span>{' '}
                · {formatDateTime(request.requestedOn)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900"
          >
            <ModusWcIcon name="close" size="md" decorative />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <aside className="min-h-0 overflow-y-auto border-b border-secondary-200 bg-secondary-50/60 p-5 lg:border-b-0 lg:border-r">
            {request.warning && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-3 rounded-md border-l-4 border-warning-400 bg-warning-50 px-3 py-3"
              >
                <ModusWcIcon
                  name="warning"
                  size="md"
                  decorative
                  customClass="mt-0.5 text-secondary-900"
                />
                <div className="text-sm text-secondary-800">
                  <div className="font-semibold text-secondary-900">
                    {request.warning.title}
                  </div>
                  <p className="mt-1 leading-snug">{request.warning.message}</p>
                </div>
              </div>
            )}

            <DetailSection title="Request Details">
              <DetailRow label="Type" value={request.type} />
              <DetailRow
                label="Date Range"
                value={
                  request.dateRange.start === request.dateRange.end
                    ? formatDate(request.dateRange.start)
                    : `${formatDate(request.dateRange.start)} – ${formatDate(request.dateRange.end)}`
                }
              />
              <DetailRow
                label="Hours / day"
                value={`${request.hoursPerDay}h × ${numDays} day${numDays === 1 ? '' : 's'}`}
              />
              <DetailRow
                label="Approver"
                value={`${request.approver.name} — ${request.approver.title}`}
              />
            </DetailSection>

            <DetailSection title="Totals">
              <div className="grid grid-cols-3 gap-2">
                <StatTile label="Employees" value={employees.length} />
                <StatTile label="Pending" value={pendingCount} highlight={pendingCount > 0} />
                <StatTile
                  label="Total hours"
                  value={`${totalHours.toFixed(0)}h`}
                  highlight
                />
              </div>
            </DetailSection>

            {request.requesterComment && (
              <DetailSection title="Requester Comment">
                <p className="leading-snug text-secondary-700">{request.requesterComment}</p>
              </DetailSection>
            )}

            <DetailSection title="Approver Comment">
              <ModusWcTextarea
                id="group-approver-comment"
                value={comment}
                placeholder="Optional note that will be sent with your decision."
                rows={3}
                onInputChange={(e) => setComment(e.detail?.target?.value ?? '')}
              />
            </DetailSection>

            <button
              type="button"
              onClick={() => setHistoryOpen((v) => !v)}
              aria-expanded={historyOpen}
              className="mt-3 flex w-full items-center justify-between rounded-md border border-secondary-200 bg-white px-3 py-2 text-left text-sm font-semibold text-secondary-900 hover:bg-secondary-50"
            >
              <span>History</span>
              <ModusWcIcon
                name={historyOpen ? 'expand_less' : 'expand_more'}
                size="sm"
                decorative
              />
            </button>
            {historyOpen && (
              <ul className="mt-2 space-y-1 rounded-md border border-secondary-200 bg-white px-3 py-2 text-xs text-secondary-700">
                {request.history.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ModusWcIcon
                      name="history"
                      size="sm"
                      decorative
                      customClass="mt-0.5 text-secondary-500"
                    />
                    <span>
                      <span className="font-medium text-secondary-900">{h.actor}</span>{' '}
                      {h.action} ·{' '}
                      <span className="text-secondary-500">{formatDateTime(h.at)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <section className="flex min-h-0 flex-col overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-secondary-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <ModusWcIcon name="people_group" size="sm" decorative />
                <h3 className="text-sm font-semibold text-secondary-800">Employees</h3>
                <ModusWcChip
                  label={`${employees.length} total`}
                  size="sm"
                  variant="filled"
                />
                {pendingCount > 0 && (
                  <ModusWcChip
                    label={`${pendingCount} pending`}
                    size="sm"
                    variant="filled"
                    customClass="chip-warning"
                  />
                )}
              </div>
              <div className="w-full max-w-xs">
                <ModusWcTextInput
                  type="text"
                  includeSearch
                  includeClear
                  value={search}
                  placeholder="Search employees"
                  aria-label="Search employees"
                  onInputChange={(e) => setSearch(e.detail?.target?.value ?? '')}
                  onClearClick={() => setSearch('')}
                />
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-auto scrollbar-thin">
                {filteredEmployees.length === 0 ? (
                  <div className="flex h-full items-center justify-center p-8 text-sm text-secondary-500">
                    No employees match the current search.
                  </div>
                ) : (
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-secondary-200 bg-secondary-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-secondary-600"
                        >
                          Employee
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-secondary-200 bg-secondary-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-secondary-600"
                        >
                          Role / Dept
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-secondary-200 bg-secondary-50 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-secondary-600"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-secondary-200 bg-secondary-50 px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-secondary-600"
                        >
                          Hours
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-secondary-200 bg-secondary-50 px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-secondary-600"
                        >
                          Decision
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map((emp) => {
                        const decisionClass =
                          DECISION_STYLES[emp.decision] ??
                          'bg-secondary-100 text-secondary-700 ring-secondary-200'
                        const statusClassEmp =
                          STATUS_PILL_STYLES[emp.employmentStatus] ??
                          'bg-secondary-100 text-secondary-700 ring-secondary-200'
                        return (
                          <tr
                            key={emp.id}
                            className="border-b border-secondary-100 last:border-b-0"
                          >
                            <td className="px-3 py-2 align-middle">
                              <div className="flex items-center gap-2">
                                <ModusWcAvatar alt={emp.name} size="sm" shape="circle" />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="truncate text-sm font-medium text-secondary-900">
                                      {emp.name}
                                    </span>
                                    <span className="rounded bg-secondary-100 px-1.5 py-0.5 font-mono text-[10px] text-secondary-600">
                                      #{emp.employeeNumber}
                                    </span>
                                  </div>
                                  <div className="mt-0.5">
                                    <span
                                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${statusClassEmp}`}
                                    >
                                      {emp.employmentStatus}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2 align-middle text-xs text-secondary-700">
                              <div className="font-medium text-secondary-800">{emp.role}</div>
                              <div className="text-secondary-500">{emp.department}</div>
                            </td>
                            <td className="px-3 py-2 align-middle">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${decisionClass}`}
                              >
                                {emp.decision.charAt(0).toUpperCase() + emp.decision.slice(1)}
                              </span>
                            </td>
                            <td className="px-3 py-2 align-middle text-right text-secondary-700 tabular-nums">
                              {hoursPerEmployee.toFixed(0)}h
                            </td>
                            <td className="px-3 py-2 align-middle">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => setDecisionFor([emp.id], 'approved')}
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
                                  onClick={() => setDecisionFor([emp.id], 'declined')}
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
                                    onClick={() => setDecisionFor([emp.id], 'pending')}
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
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </section>
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-secondary-200 bg-white px-5 py-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-secondary-600">
            <ModusWcButton variant="outlined" color="tertiary" size="sm" onButtonClick={declineAllPending}>
              <ModusWcIcon name="thumbs_down" size="sm" decorative />
              Decline all pending
            </ModusWcButton>
            <ModusWcButton variant="outlined" color="tertiary" size="sm" onButtonClick={approveAllPending}>
              <ModusWcIcon name="thumbs_up" size="sm" decorative />
              Approve all pending
            </ModusWcButton>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ModusWcButton variant="outlined" color="tertiary" onButtonClick={onClose}>
              Cancel
            </ModusWcButton>
            <ModusWcButton color="danger" onButtonClick={() => submit('decline')}>
              <ModusWcIcon name="thumbs_down" size="sm" decorative />
              Decline All
            </ModusWcButton>
            <button
              type="button"
              onClick={() => submit('approve')}
              className="inline-flex items-center gap-2 rounded-md bg-success-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-success-500 focus:ring-offset-2"
            >
              <ModusWcIcon name="thumbs_up" size="sm" decorative />
              Submit Decision
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}

function DetailSection({ title, children }) {
  return (
    <div className="mb-4">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-secondary-500">
        {title}
      </div>
      <div className="rounded-md border border-secondary-200 bg-white px-3 py-2 text-sm text-secondary-800">
        {children}
      </div>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-3 py-0.5">
      <span className="text-secondary-500">{label}</span>
      <span className="text-right font-medium text-secondary-900">{value}</span>
    </div>
  )
}

function StatTile({ label, value, highlight = false }) {
  return (
    <div className="rounded-md border border-secondary-200 bg-white px-2 py-1.5">
      <div className="text-[10px] font-medium uppercase tracking-wide text-secondary-500">
        {label}
      </div>
      <div
        className={`text-base font-semibold tabular-nums ${
          highlight ? 'text-primary-700' : 'text-secondary-900'
        }`}
      >
        {value}
      </div>
    </div>
  )
}
