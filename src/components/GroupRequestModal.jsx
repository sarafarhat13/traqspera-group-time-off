import { useEffect, useMemo, useState } from 'react'
import {
  ModusWcButton,
  ModusWcIcon,
  ModusWcDate,
  ModusWcSelect,
  ModusWcTextarea,
  ModusWcCard,
  ModusWcChip,
  ModusWcAlert,
} from '@trimble-oss/moduswebcomponents-react'
import EmployeeSelector from './EmployeeSelector'
import { TIME_OFF_TYPES, APPROVERS, EMPLOYEES } from '../data/mockData'

function daysBetween(start, end) {
  if (!start || !end) return 0
  const s = new Date(start)
  const e = new Date(end)
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0
  const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1
  return diff > 0 ? diff : 0
}

function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const APPROVER_OPTIONS = APPROVERS.map((a) => ({
  label: `${a.name} — ${a.title}`,
  value: a.id,
}))

export default function GroupRequestModal({ open, onClose, onSubmit }) {
  const [type, setType] = useState('pto')
  const [dateMode, setDateMode] = useState('range') // 'range' | 'single' | 'multi'
  const [startDate, setStartDate] = useState('2026-04-13')
  const [endDate, setEndDate] = useState('2026-04-17')
  const [singleDate, setSingleDate] = useState('2026-04-15')
  const [multiDates, setMultiDates] = useState(['2026-04-13', '2026-04-15', '2026-04-17'])
  const [hoursPerDay, setHoursPerDay] = useState(8)
  const [approver, setApprover] = useState(APPROVERS[0].id)
  const [comment, setComment] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

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

  const numDays = useMemo(() => {
    if (dateMode === 'single') return singleDate ? 1 : 0
    if (dateMode === 'multi') return multiDates.length
    return daysBetween(startDate, endDate)
  }, [dateMode, startDate, endDate, singleDate, multiDates])

  const totalHours = numDays * Number(hoursPerDay || 0) * selectedIds.length

  function reset() {
    setType('pto')
    setDateMode('range')
    setStartDate('2026-04-13')
    setEndDate('2026-04-17')
    setSingleDate('2026-04-15')
    setMultiDates(['2026-04-13', '2026-04-15', '2026-04-17'])
    setHoursPerDay(8)
    setApprover(APPROVERS[0].id)
    setComment('')
    setSelectedIds([])
    setSubmitted(false)
    setError('')
  }

  function handleClose() {
    onClose?.()
    setTimeout(reset, 200)
  }

  function handleSubmit(e) {
    e?.preventDefault?.()
    setError('')
    if (selectedIds.length === 0) {
      setError('Add at least one employee to this request.')
      return
    }
    if (numDays === 0) {
      setError('Select a valid date or date range.')
      return
    }
    if (!hoursPerDay || hoursPerDay <= 0) {
      setError('Hours per day must be greater than zero.')
      return
    }
    setSubmitted(true)
    onSubmit?.({
      type,
      dateMode,
      startDate,
      endDate,
      singleDate,
      multiDates,
      hoursPerDay,
      approver,
      comment,
      employeeIds: selectedIds,
    })
  }

  function addMultiDate(value) {
    if (!value) return
    setMultiDates((cur) => (cur.includes(value) ? cur : [...cur, value].sort()))
  }
  function removeMultiDate(value) {
    setMultiDates((cur) => cur.filter((d) => d !== value))
  }

  if (!open) return null

  const selectedEmployees = EMPLOYEES.filter((e) => selectedIds.includes(e.id))
  const approverObj = APPROVERS.find((a) => a.id === approver)
  const typeObj = TIME_OFF_TYPES.find((t) => t.id === type)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="group-request-title"
      className="fixed top-0 right-0 bottom-0 left-16 z-40 flex flex-col bg-secondary-50 animate-fadeIn"
    >
      <header className="flex shrink-0 items-center justify-between border-b border-secondary-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-100 text-primary-700">
            <ModusWcIcon name="people_group" size="md" decorative />
          </div>
          <div>
            <h2 id="group-request-title" className="text-base font-semibold text-secondary-900">
              New Group Time Off Request
            </h2>
            <p className="text-xs text-secondary-500">
              Submit a single request that applies to multiple employees.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ModusWcButton variant="borderless" color="secondary" onButtonClick={handleClose}>
            Cancel
          </ModusWcButton>
          <ModusWcButton color="primary" onButtonClick={handleSubmit}>
            Submit Request
          </ModusWcButton>
          <ModusWcButton
            shape="square"
            variant="borderless"
            color="secondary"
            aria-label="Close"
            onButtonClick={handleClose}
          >
            <ModusWcIcon name="close" size="sm" decorative />
          </ModusWcButton>
        </div>
      </header>

      {submitted ? (
        <SuccessPanel
          onClose={handleClose}
          summary={{
            type: typeObj,
            numDays,
            hoursPerDay,
            employees: selectedEmployees,
            approver: approverObj,
          }}
        />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6 lg:grid lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden">
          <div className="flex min-h-0 flex-col overflow-hidden rounded-md border border-secondary-200 bg-white">
            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto scrollbar-thin p-3">
              <SectionTitle icon="tag" title="Type of Time Off" />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {TIME_OFF_TYPES.map((t) => {
                  const active = type === t.id
                  return (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setType(t.id)}
                      aria-pressed={active}
                      className={`flex flex-col items-start gap-1 rounded-md border px-3 py-2.5 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                        active
                          ? 'border-primary-700 bg-primary-700 text-white'
                          : 'border-secondary-300 bg-white text-secondary-900 hover:border-secondary-400 hover:bg-secondary-50'
                      }`}
                    >
                      <span
                        className={`text-xs font-medium uppercase tracking-wide ${
                          active ? 'text-primary-100' : 'text-secondary-500'
                        }`}
                      >
                        {active ? 'Selected' : 'Choose'}
                      </span>
                      <span className={`font-semibold ${active ? 'text-white' : 'text-secondary-900'}`}>
                        {t.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              <Divider />

              <SectionTitle icon="calendar" title="Date Selection" />
              <div className="inline-flex rounded-md bg-secondary-100 p-1">
                {[
                  { id: 'single', label: 'Single day' },
                  { id: 'range', label: 'Date range' },
                  { id: 'multi', label: 'Multiple days' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setDateMode(m.id)}
                    className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                      dateMode === m.id
                        ? 'bg-white text-secondary-900 shadow-xs'
                        : 'text-secondary-700 hover:bg-white/60'
                    }`}
                    aria-pressed={dateMode === m.id}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {dateMode === 'single' && (
                <ModusWcDate
                  label="Date"
                  value={singleDate}
                  onInputChange={(e) => setSingleDate(e.detail?.target?.value ?? '')}
                />
              )}

              {dateMode === 'range' && (
                <div className="grid grid-cols-2 gap-3">
                  <ModusWcDate
                    label="Start date"
                    value={startDate}
                    onInputChange={(e) => setStartDate(e.detail?.target?.value ?? '')}
                  />
                  <ModusWcDate
                    label="End date"
                    value={endDate}
                    onInputChange={(e) => setEndDate(e.detail?.target?.value ?? '')}
                  />
                </div>
              )}

              {dateMode === 'multi' && (
                <div className="flex flex-col gap-3">
                  <ModusWcDate
                    label="Add individual dates"
                    value=""
                    onInputChange={(e) => {
                      const value = e.detail?.target?.value
                      if (value) addMultiDate(value)
                    }}
                  />
                  {multiDates.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {multiDates.map((d) => (
                        <ModusWcChip
                          key={d}
                          label={formatDate(d)}
                          size="sm"
                          variant="filled"
                          showRemove
                          onChipRemove={() => removeMultiDate(d)}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-secondary-500">
                      No dates added yet. Pick dates above to build your list.
                    </p>
                  )}
                </div>
              )}

              <Divider />

              <SectionTitle icon="clock" title="Hours per Day" hint="Applies to all selected dates" />
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="number"
                  min="0.5"
                  max="24"
                  step="0.5"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  className="w-32 rounded-md border border-secondary-300 bg-white px-3 py-2 text-sm"
                  aria-label="Hours per day"
                />
                <div className="flex gap-1">
                  {[4, 6, 8].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setHoursPerDay(preset)}
                      className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
                        hoursPerDay === preset
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50'
                      }`}
                    >
                      {preset}h
                    </button>
                  ))}
                </div>
              </div>

              <Divider />

              <SectionTitle icon="user_account" title="Approver" />
              <ModusWcSelect
                aria-label="Approver"
                options={APPROVER_OPTIONS}
                value={approver}
                onInputChange={(e) => setApprover(e.detail?.target?.value ?? '')}
              />

              <Divider />

              <SectionTitle icon="comment" title="Comment" />
              <ModusWcTextarea
                rows={4}
                placeholder="Optional context the approver and employees will see…"
                value={comment}
                onInputChange={(e) => setComment(e.detail?.target?.value ?? '')}
                label=""
              />
            </form>
          </div>

          <div className="flex min-h-0 flex-col gap-3 lg:h-full lg:overflow-hidden">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-secondary-200 bg-white p-3">
              <EmployeeSelector selectedIds={selectedIds} onChange={setSelectedIds} />
            </div>

            <ModusWcCard bordered customClass="summary-card">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
                  <SummaryStat
                    label="Employees"
                    value={selectedIds.length.toString()}
                    highlight={selectedIds.length > 0}
                  />
                  <SummaryStat label="Days" value={numDays.toString()} />
                  <SummaryStat label="Hours / day" value={`${hoursPerDay}h`} />
                  <SummaryStat
                    label="Total hours"
                    value={`${totalHours.toFixed(1)}h`}
                    highlight
                  />
                </div>
                {error && (
                  <div className="lg:max-w-sm">
                    <ModusWcAlert
                      variant="error"
                      alertTitle={error}
                      role="alert"
                    />
                  </div>
                )}
                <div className="flex shrink-0 items-center gap-2">
                  <ModusWcButton variant="outlined" color="secondary" onButtonClick={handleClose}>
                    Cancel
                  </ModusWcButton>
                  <ModusWcButton color="primary" onButtonClick={handleSubmit}>
                    Submit Request
                  </ModusWcButton>
                </div>
              </div>
            </ModusWcCard>
          </div>
        </div>
      )}
    </div>
  )
}

function SectionTitle({ icon, title, hint }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <div className="flex items-center gap-2">
        <ModusWcIcon name={icon} size="sm" decorative customClass="section-title-icon" />
        <h3 className="text-sm font-semibold text-secondary-800">{title}</h3>
      </div>
      {hint && <span className="text-xs text-secondary-500">{hint}</span>}
    </div>
  )
}

function Divider() {
  return <div className="border-t border-secondary-100" />
}

function SummaryStat({ label, value, highlight = false }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-secondary-500">
        {label}
      </div>
      <div
        className={`mt-0.5 text-lg font-semibold tabular-nums ${
          highlight ? 'text-primary-700' : 'text-secondary-900'
        }`}
      >
        {value}
      </div>
    </div>
  )
}

function SuccessPanel({ onClose, summary }) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <ModusWcCard bordered customClass="success-card max-w-lg">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-100 text-success-700">
            <ModusWcIcon name="check_circle" size="lg" decorative />
          </div>
          <h3 className="text-lg font-semibold text-secondary-900">
            Group request submitted
          </h3>
          <p className="mt-1 text-sm text-secondary-600">
            {summary.employees.length} employee{summary.employees.length === 1 ? '' : 's'} will
            be notified once {summary.approver?.name} reviews this {summary.type?.label.toLowerCase()} request.
          </p>
          <dl className="mt-5 grid grid-cols-2 gap-3 text-left">
            <SummaryRow label="Days" value={`${summary.numDays}`} />
            <SummaryRow label="Hours / day" value={`${summary.hoursPerDay}h`} />
            <SummaryRow label="Employees" value={`${summary.employees.length}`} />
            <SummaryRow
              label="Total hours"
              value={`${(summary.numDays * summary.hoursPerDay * summary.employees.length).toFixed(1)}h`}
            />
          </dl>
          <ModusWcButton color="primary" fullWidth customClass="mt-6" onButtonClick={onClose}>
            Back to Time Off Requests
          </ModusWcButton>
        </div>
      </ModusWcCard>
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="rounded-md bg-secondary-50 px-3 py-2">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-secondary-500">
        {label}
      </dt>
      <dd className="text-sm font-semibold text-secondary-900">{value}</dd>
    </div>
  )
}
