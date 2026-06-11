import { useEffect, useMemo, useState } from 'react'
import {
  X,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  UserCheck,
  MessageSquare,
  Tag,
  CheckCircle2,
  Users as UsersIcon,
  Info,
} from 'lucide-react'
import EmployeeSelector from './EmployeeSelector'
import { TIME_OFF_TYPES, APPROVERS, EMPLOYEES } from '../data/mockData'

const TYPE_TILE_STYLES = {
  primary: 'border-primary-300 bg-primary-50 text-primary-800',
  secondary: 'border-secondary-300 bg-secondary-50 text-secondary-800',
  warning: 'border-warning-300 bg-warning-50 text-warning-800',
  success: 'border-success-300 bg-success-50 text-success-800',
}

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
      className="fixed inset-0 z-40 flex flex-col bg-secondary-50 animate-fadeIn"
    >
      {/* Modal header */}
      <header className="flex shrink-0 items-center justify-between border-b border-secondary-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-100 text-primary-700">
            <UsersIcon className="h-5 w-5" />
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
          <button type="button" onClick={handleClose} className="btn-ghost">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} className="btn-primary">
            Submit Request
          </button>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="ml-1 rounded p-1.5 text-secondary-500 hover:bg-secondary-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Body */}
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
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6 lg:grid lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:overflow-hidden">
          {/* LEFT: Request details */}
          <form
            onSubmit={handleSubmit}
            className="card flex flex-col gap-5 overflow-y-auto scrollbar-thin p-5"
          >
            <SectionTitle icon={Tag} title="Type of Time Off" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TIME_OFF_TYPES.map((t) => {
                const active = type === t.id
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setType(t.id)}
                    className={`flex flex-col items-start gap-1 rounded-md border px-3 py-2.5 text-left text-sm transition ${
                      active
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/30'
                        : TYPE_TILE_STYLES[t.color] + ' hover:brightness-95'
                    }`}
                  >
                    <span className="text-xs font-medium uppercase tracking-wide text-secondary-500">
                      {active ? 'Selected' : 'Choose'}
                    </span>
                    <span className="font-semibold text-secondary-900">{t.label}</span>
                  </button>
                )
              })}
            </div>

            <Divider />

            <SectionTitle icon={CalendarIcon} title="Date Selection" />
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
              <div>
                <label className="label" htmlFor="single-date">Date</label>
                <input
                  id="single-date"
                  type="date"
                  className="input"
                  value={singleDate}
                  onChange={(e) => setSingleDate(e.target.value)}
                />
              </div>
            )}

            {dateMode === 'range' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="start-date">Start date</label>
                  <input
                    id="start-date"
                    type="date"
                    className="input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="end-date">End date</label>
                  <input
                    id="end-date"
                    type="date"
                    className="input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            {dateMode === 'multi' && (
              <div>
                <label className="label" htmlFor="add-date">Add individual dates</label>
                <div className="flex items-center gap-2">
                  <input
                    id="add-date"
                    type="date"
                    className="input"
                    onChange={(e) => {
                      addMultiDate(e.target.value)
                      e.target.value = ''
                    }}
                  />
                </div>
                {multiDates.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {multiDates.map((d) => (
                      <span
                        key={d}
                        className="chip bg-primary-100 text-primary-800"
                      >
                        {formatDate(d)}
                        <button
                          type="button"
                          onClick={() => removeMultiDate(d)}
                          className="ml-1 rounded p-0.5 hover:bg-primary-200"
                          aria-label={`Remove ${d}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-secondary-500">
                    No dates added yet. Pick dates above to build your list.
                  </p>
                )}
              </div>
            )}

            <Divider />

            <SectionTitle icon={ClockIcon} title="Hours per Day" hint="Applies to all selected dates" />
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="number"
                min="0.5"
                max="24"
                step="0.5"
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="input w-32"
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

            <SectionTitle icon={UserCheck} title="Approver" />
            <select
              className="select"
              value={approver}
              onChange={(e) => setApprover(e.target.value)}
              aria-label="Approver"
            >
              {APPROVERS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — {a.title}
                </option>
              ))}
            </select>

            <Divider />

            <SectionTitle icon={MessageSquare} title="Comment" />
            <textarea
              className="input min-h-[96px] resize-y"
              placeholder="Optional context the approver and employees will see…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </form>

          {/* RIGHT: Employee selection + summary */}
          <div className="flex min-h-0 flex-col gap-3">
            <div className="card min-h-0 flex-1 overflow-hidden p-3 sm:p-4">
              <EmployeeSelector
                selectedIds={selectedIds}
                onChange={setSelectedIds}
              />
            </div>

            {/* Summary footer */}
            <div className="card flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
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
                <div className="flex items-center gap-2 rounded-md bg-danger-50 px-3 py-1.5 text-xs font-medium text-danger-700">
                  <Info className="h-4 w-4" />
                  {error}
                </div>
              )}
              <div className="flex shrink-0 items-center gap-2">
                <button type="button" onClick={handleClose} className="btn-secondary">
                  Cancel
                </button>
                <button type="button" onClick={handleSubmit} className="btn-primary">
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SectionTitle({ icon: Icon, title, hint }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary-600" />
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
      <div className="w-full max-w-lg rounded-xl border border-success-200 bg-white p-8 text-center shadow-lg animate-slideUp">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-100 text-success-700">
          <CheckCircle2 className="h-7 w-7" />
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
        <button type="button" onClick={onClose} className="btn-primary mt-6 w-full">
          Back to Time Off Requests
        </button>
      </div>
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
