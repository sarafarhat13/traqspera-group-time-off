import { useState } from 'react'
import { Calendar as CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react'

export default function FilterPanel() {
  const [open, setOpen] = useState(true)
  return (
    <div className="card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-t-lg border-b border-secondary-200 px-4 py-2.5 text-left text-sm font-semibold text-secondary-800 hover:bg-secondary-50"
      >
        <span>Filter</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-secondary-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-secondary-500" />
        )}
      </button>
      {open && (
        <div className="space-y-4 px-4 py-4">
          <div>
            <label className="label">Date Range</label>
            <div className="relative">
              <input
                type="text"
                className="input pr-9"
                defaultValue="07/03/2026"
                aria-label="Date range"
              />
              <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-400" />
            </div>
          </div>
          <div>
            <label className="label">Employee</label>
            <select className="select" defaultValue="">
              <option value="">All employees</option>
              <option>Sara Farhat</option>
              <option>John Smith</option>
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="select" defaultValue="">
              <option value="">Any status</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Declined</option>
            </select>
          </div>
          <div>
            <label className="label">Type</label>
            <select className="select" defaultValue="">
              <option value="">All types</option>
              <option>Paid Time Off</option>
              <option>Sick Day</option>
              <option>Vacation</option>
              <option>Holiday</option>
            </select>
          </div>
          <div>
            <label className="label">Requested Approver</label>
            <select className="select" defaultValue="">
              <option value="">Anyone</option>
              <option>Alex Morgan</option>
              <option>Priya Patel</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
