import { useEffect, useMemo, useState } from 'react'
import {
  ModusWcButton,
  ModusWcIcon,
  ModusWcSelect,
  ModusWcTextarea,
} from '@trimble-oss/moduswebcomponents-react'

const STATUS_BADGE = {
  pending: 'bg-warning-100 text-warning-800 ring-warning-200',
  approved: 'bg-success-100 text-success-800 ring-success-200',
  declined: 'bg-danger-100 text-danger-800 ring-danger-200',
}

const STEP_STYLES = {
  approved: {
    icon: 'check_circle',
    iconClass: 'text-success-600',
    pill: 'bg-success-100 text-success-800 ring-success-200',
    label: 'Approved',
  },
  pending: {
    icon: 'clock',
    iconClass: 'text-warning-600',
    pill: 'bg-warning-100 text-warning-800 ring-warning-200',
    label: 'Awaiting decision',
  },
  declined: {
    icon: 'cancel_circle',
    iconClass: 'text-danger-600',
    pill: 'bg-danger-100 text-danger-800 ring-danger-200',
    label: 'Declined',
  },
  awaiting: {
    icon: 'lock',
    iconClass: 'text-secondary-400',
    pill: 'bg-secondary-100 text-secondary-600 ring-secondary-200',
    label: 'Awaiting prior approval',
  },
}

const STATUS_PILL_STYLES = {
  'Full-Time': 'bg-success-100 text-success-800 ring-success-200',
  'Part-Time': 'bg-primary-100 text-primary-800 ring-primary-200',
  Contract: 'bg-warning-100 text-warning-800 ring-warning-200',
  Seasonal: 'bg-secondary-200 text-secondary-700 ring-secondary-300',
  Temporary: 'bg-danger-100 text-danger-800 ring-danger-200',
}

const GROUP_BY_OPTIONS = [
  { label: 'No grouping', value: 'none' },
  { label: 'Department', value: 'department' },
  { label: 'Role', value: 'role' },
]

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

function deriveRequestStatus(chain) {
  if (chain.some((s) => s.status === 'declined')) return 'declined'
  if (chain.every((s) => s.status === 'approved')) return 'approved'
  return 'pending'
}

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
  const [chain, setChain] = useState(() =>
    request.approvalChain.map((step) => ({ ...step })),
  )
  const [groupBy, setGroupBy] = useState('none')
  const [comment, setComment] = useState('')

  const numDays = request.days.length
  const hoursPerEmployee = numDays * (request.hoursPerDay ?? 8)
  const totalHours = request.employees.length * hoursPerEmployee

  const requestStatus = useMemo(() => deriveRequestStatus(chain), [chain])
  const approvedSteps = chain.filter((s) => s.status === 'approved').length
  const declinedSteps = chain.filter((s) => s.status === 'declined').length
  const currentStepIndex = chain.findIndex((s) => s.status === 'pending')
  const currentStep = currentStepIndex >= 0 ? chain[currentStepIndex] : null
  const canAct = Boolean(currentStep?.isCurrentUser) && requestStatus === 'pending'
  const progressPct =
    chain.length === 0 ? 0 : (approvedSteps / chain.length) * 100

  const grouped = useMemo(() => {
    if (groupBy === 'none') {
      return [{ id: 'all', label: 'All employees', rows: request.employees }]
    }
    const buckets = new Map()
    for (const e of request.employees) {
      const key = e[groupBy] ?? '—'
      if (!buckets.has(key)) buckets.set(key, [])
      buckets.get(key).push(e)
    }
    return Array.from(buckets.entries())
      .sort(([a], [b]) => String(a).localeCompare(String(b)))
      .map(([key, rows]) => ({ id: key, label: key, rows }))
  }, [groupBy, request.employees])

  function submit(action) {
    if (!canAct) return
    const now = new Date().toISOString()
    const nextChain = chain.map((step, idx) => {
      if (idx !== currentStepIndex) return step
      return {
        ...step,
        status: action === 'approve' ? 'approved' : 'declined',
        actedOn: now,
        comment: comment.trim() || step.comment,
      }
    })
    setChain(nextChain)
    onAction?.(action, {
      request: { ...request, approvalChain: nextChain, status: deriveRequestStatus(nextChain) },
      comment,
      step: currentStep,
    })
  }

  const statusClass = STATUS_BADGE[requestStatus] ?? STATUS_BADGE.pending
  const statusLabel = requestStatus.charAt(0).toUpperCase() + requestStatus.slice(1)

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
            Close
          </ModusWcButton>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="rounded-md border border-secondary-200 bg-white shadow-sm">
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h1
                  id="group-detail-title"
                  className="text-xl font-semibold text-secondary-900"
                >
                  {request.type} Request
                </h1>
                <span className="text-xs text-secondary-500">
                  Request #{request.requestNumber}
                </span>
              </div>

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
                    {request.requestedBy.title} · Submitted{' '}
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
                {request.requesterComment && (
                  <DetailRow label="Description">{request.requesterComment}</DetailRow>
                )}
              </dl>

              {request.warning && requestStatus === 'pending' && (
                <div
                  role="alert"
                  className="mt-5 flex items-start gap-3 rounded-md border-l-4 border-warning-400 bg-warning-50 px-3 py-3"
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

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-secondary-900">Employees</h2>
                  <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-600 px-1.5 text-[11px] font-semibold text-white">
                    {request.employees.length}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-secondary-600">
                  <span className="font-medium">Group by</span>
                  <div className="min-w-[150px]">
                    <ModusWcSelect
                      aria-label="Group employees by"
                      size="sm"
                      options={GROUP_BY_OPTIONS}
                      value={groupBy}
                      onInputChange={(e) =>
                        setGroupBy(e.detail?.target?.value ?? 'none')
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
                {grouped.map((group) => (
                  <div
                    key={group.id}
                    className="overflow-hidden rounded-md border border-secondary-200"
                  >
                    {groupBy !== 'none' && (
                      <div className="flex items-center justify-between bg-secondary-50 px-4 py-2.5">
                        <span className="text-sm font-semibold text-secondary-800">
                          {group.label}{' '}
                          <span className="font-normal text-secondary-500">
                            ({group.rows.length} employee
                            {group.rows.length === 1 ? '' : 's'})
                          </span>
                        </span>
                        <span className="text-sm font-semibold text-secondary-900 tabular-nums">
                          {(group.rows.length * hoursPerEmployee).toFixed(0)} hrs
                        </span>
                      </div>
                    )}
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
                          <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-secondary-600">
                            Status
                          </th>
                          <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-secondary-600">
                            Hours
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.rows.map((emp) => {
                          const statusClassEmp =
                            STATUS_PILL_STYLES[emp.employmentStatus] ??
                            'bg-secondary-100 text-secondary-700 ring-secondary-200'
                          return (
                            <tr
                              key={emp.id}
                              className="border-b border-secondary-100 last:border-b-0"
                            >
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
                              <td className="px-3 py-2 align-middle text-xs text-secondary-700">
                                {emp.role}
                              </td>
                              <td className="px-3 py-2 align-middle">
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusClassEmp}`}
                                >
                                  {emp.employmentStatus}
                                </span>
                              </td>
                              <td className="px-3 py-2 align-middle text-right text-secondary-700 tabular-nums">
                                {hoursPerEmployee.toFixed(0)}h
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-md border border-secondary-200 bg-white shadow-sm">
              <div className="h-1 w-full bg-warning-400" aria-hidden />
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-secondary-900">Approval Workflow</h2>
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
                      {approvedSteps} of {chain.length} approved
                      {declinedSteps > 0 ? ` · ${declinedSteps} declined` : ''}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary-100">
                    <div
                      className={`h-full rounded-full transition-all ${
                        requestStatus === 'declined' ? 'bg-danger-500' : 'bg-success-500'
                      }`}
                      style={{ width: `${progressPct}%` }}
                      aria-hidden
                    />
                  </div>
                </div>

                <ol className="mt-5 space-y-0">
                  {chain.map((step, idx) => (
                    <WorkflowStep
                      key={step.id}
                      step={step}
                      index={idx}
                      isLast={idx === chain.length - 1}
                      isCurrent={idx === currentStepIndex}
                    />
                  ))}
                </ol>

                {canAct && (
                  <div className="mt-5 rounded-md border border-secondary-200 bg-secondary-50 p-3">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary-600">
                      Your decision
                    </div>
                    <ModusWcTextarea
                      id="approver-comment"
                      rows={3}
                      value={comment}
                      placeholder={`Notes for ${request.requestedBy.name.split(' ')[0]} and downstream approvers…`}
                      onInputChange={(e) => setComment(e.detail?.target?.value ?? '')}
                    />
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => submit('decline')}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-danger-300 bg-white px-3 py-2 text-sm font-semibold text-danger-700 shadow-sm transition hover:border-danger-500 hover:bg-danger-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger-500 focus-visible:ring-offset-2"
                      >
                        <ModusWcIcon name="close" size="sm" decorative />
                        Decline
                      </button>
                      <button
                        type="button"
                        onClick={() => submit('approve')}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md bg-success-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-success-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-success-500 focus-visible:ring-offset-2"
                      >
                        <ModusWcIcon name="check" size="sm" decorative />
                        Approve
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-md border border-secondary-200 bg-white px-4 py-3 text-xs text-secondary-700 shadow-sm">
              <ModusWcIcon
                name="info"
                size="sm"
                decorative
                customClass="mt-0.5 text-secondary-500"
              />
              <span>
                {requestStatus === 'declined'
                  ? 'A declined step stops the workflow. The requester can revise and resubmit.'
                  : requestStatus === 'approved'
                    ? 'All approvers have signed off. The request is fully approved.'
                    : 'Each step must be approved in order. The request advances automatically once you act.'}
              </span>
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

function WorkflowStep({ step, index, isLast, isCurrent }) {
  const styles = STEP_STYLES[step.status] ?? STEP_STYLES.awaiting
  const connectorClass =
    step.status === 'approved'
      ? 'bg-success-300'
      : step.status === 'declined'
        ? 'bg-danger-300'
        : 'bg-secondary-200'
  return (
    <li className="relative grid grid-cols-[28px_1fr] gap-x-3 pb-4 last:pb-0">
      <div className="relative flex flex-col items-center">
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white ring-2 ${
            isCurrent
              ? 'ring-warning-400'
              : step.status === 'approved'
                ? 'ring-success-400'
                : step.status === 'declined'
                  ? 'ring-danger-400'
                  : 'ring-secondary-300'
          }`}
        >
          <ModusWcIcon
            name={styles.icon}
            size="sm"
            decorative
            customClass={styles.iconClass}
          />
        </div>
        {!isLast && (
          <div className={`mt-0.5 w-0.5 flex-1 ${connectorClass}`} aria-hidden />
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-secondary-500">
            Step {index + 1} · {step.role}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${styles.pill}`}
          >
            {styles.label}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <div
            aria-hidden
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary-700 text-[10px] font-semibold text-white"
          >
            {step.approver.initials || initials(step.approver.name)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-secondary-900">
              {step.approver.name}
              {step.isCurrentUser && (
                <span className="ml-1.5 rounded bg-primary-100 px-1.5 py-0.5 text-[10px] font-semibold text-primary-700">
                  You
                </span>
              )}
            </div>
            <div className="truncate text-xs text-secondary-500">
              {step.approver.title}
            </div>
          </div>
        </div>
        {step.actedOn && (
          <div className="mt-1 text-[11px] text-secondary-500">
            {step.status === 'approved' ? 'Approved' : 'Declined'}{' '}
            {formatDateTime(step.actedOn)}
          </div>
        )}
        {step.comment && (
          <blockquote className="mt-1 rounded-md bg-secondary-50 px-2.5 py-1.5 text-xs italic text-secondary-700">
            &ldquo;{step.comment}&rdquo;
          </blockquote>
        )}
        {isCurrent && step.isCurrentUser && (
          <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-warning-50 px-2 py-0.5 text-[11px] font-medium text-warning-800 ring-1 ring-inset ring-warning-200">
            <ModusWcIcon name="alert" size="sm" decorative customClass="text-warning-600" />
            Awaiting your action
          </div>
        )}
      </div>
    </li>
  )
}
