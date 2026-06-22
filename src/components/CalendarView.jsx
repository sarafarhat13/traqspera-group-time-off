import { useMemo } from 'react'
import {
  ModusWcCard,
  ModusWcButtonGroup,
  ModusWcButton,
  ModusWcIcon,
} from '@trimble-oss/moduswebcomponents-react'
import { CALENDAR_EVENTS, BLOCK_EVENTS } from '../data/mockData'

const STATUS_STYLES = {
  pending: 'bg-warning-400 text-secondary-900',
  approved: 'bg-success-500 text-white',
  declined: 'bg-danger-200 text-danger-800',
  holiday: 'bg-primary-100 text-primary-800 border border-primary-300',
  blackout: 'bg-secondary-900 text-white',
}

const LEGEND = [
  { id: 'pending', label: 'Pending', dot: 'bg-warning-400' },
  { id: 'approved', label: 'Approved', dot: 'bg-success-500' },
  { id: 'declined', label: 'Declined', dot: 'bg-danger-500' },
  { id: 'holiday', label: 'Holiday', dot: 'bg-primary-400' },
  { id: 'blackout', label: 'Blackout', dot: 'bg-secondary-900' },
  { id: 'selected', label: 'Selected', dot: 'bg-secondary-500' },
]

function pad(n) { return String(n).padStart(2, '0') }
function fmt(year, month, day) { return `${year}-${pad(month + 1)}-${pad(day)}` }

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1)
  const startWeekday = first.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevMonthDays = new Date(year, month, 0).getDate()
  const cells = []
  for (let i = 0; i < 42; i++) {
    const offset = i - startWeekday
    if (offset < 0) {
      const day = prevMonthDays + offset + 1
      cells.push({ key: `p-${day}`, day, currentMonth: false, year, month: month - 1 })
    } else if (offset >= daysInMonth) {
      const day = offset - daysInMonth + 1
      cells.push({ key: `n-${day}`, day, currentMonth: false, year, month: month + 1 })
    } else {
      cells.push({
        key: fmt(year, month, offset + 1),
        day: offset + 1,
        currentMonth: true,
        year,
        month,
        iso: fmt(year, month, offset + 1),
      })
    }
  }
  return cells
}

export default function CalendarView() {
  const year = 2026
  const month = 3

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month])

  const eventsByDate = useMemo(() => {
    const map = {}
    for (const e of [...CALENDAR_EVENTS, ...BLOCK_EVENTS]) {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push(e)
    }
    return map
  }, [])

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  return (
    <ModusWcCard bordered customClass="calendar-card">
      <div className="-m-3 flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-secondary-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <ModusWcButton variant="outlined" color="primary" size="sm">
              Today
            </ModusWcButton>
            <ModusWcButton variant="outlined" color="primary" size="sm" aria-label="Previous month">
              Back
            </ModusWcButton>
            <ModusWcButton variant="outlined" color="primary" size="sm" aria-label="Next month">
              Next
            </ModusWcButton>
          </div>
          <div className="text-lg font-semibold text-secondary-800">April 2026</div>
          <ModusWcButtonGroup variant="outlined" color="primary" selectionType="single">
            <ModusWcButton pressed>Month</ModusWcButton>
            <ModusWcButton>Week</ModusWcButton>
            <ModusWcButton>Day</ModusWcButton>
          </ModusWcButtonGroup>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-secondary-200 px-4 py-2 text-xs">
          <span className="italic text-secondary-500">
            Click and drag to select days for a new request
          </span>
          <div className="flex flex-wrap items-center gap-3">
            {LEGEND.map((l) => (
              <span key={l.id} className="inline-flex items-center gap-1.5 text-secondary-600">
                <span className={`h-2.5 w-2.5 rounded-full ${l.dot}`} />
                {l.label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-secondary-200 bg-secondary-50 text-center text-xs font-semibold uppercase tracking-wide text-secondary-600">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="py-2">{d}</div>
          ))}
        </div>

        <div className="grid flex-1 grid-cols-7 grid-rows-6">
          {weeks.flatMap((week, wi) =>
            week.map((cell, di) => {
              const events = cell.iso ? eventsByDate[cell.iso] ?? [] : []
              return (
                <div
                  key={cell.key}
                  className={`flex min-h-[100px] flex-col gap-1 border-b border-r border-secondary-200 p-1.5 ${
                    cell.currentMonth ? 'bg-white' : 'bg-secondary-50/60'
                  } ${di === 6 ? 'border-r-0' : ''} ${wi === 5 ? 'border-b-0' : ''}`}
                >
                  <div
                    className={`text-xs font-semibold ${
                      cell.currentMonth ? 'text-secondary-700' : 'text-secondary-400'
                    }`}
                  >
                    {String(cell.day).padStart(2, '0')}
                  </div>
                  <div className="flex flex-col gap-1">
                    {events.map((e, i) => (
                      <div
                        key={`${cell.key}-${i}`}
                        className={`flex items-center gap-1 truncate rounded px-1.5 py-0.5 text-[10px] font-medium leading-tight ${
                          STATUS_STYLES[e.status] ?? 'bg-secondary-200 text-secondary-800'
                        }`}
                        title={e.label}
                      >
                        {e.status === 'declined' && (
                          <ModusWcIcon name="warning" size="sm" decorative customClass="text-[10px]" />
                        )}
                        {e.status === 'holiday' && (
                          <ModusWcIcon name="calendar" size="sm" decorative customClass="text-[10px]" />
                        )}
                        {e.status === 'blackout' && (
                          <span className="flex h-2.5 w-2.5 flex-shrink-0 items-center justify-center rounded-full border border-white" />
                        )}
                        <span className="truncate">{e.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </ModusWcCard>
  )
}
