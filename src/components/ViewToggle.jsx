import { CalendarDays, List as ListIcon } from 'lucide-react'

export default function ViewToggle({ value = 'calendar', onChange }) {
  return (
    <div className="card">
      <div className="border-b border-secondary-200 bg-traqspera-navy rounded-t-lg px-4 py-2 text-sm font-semibold text-white">
        View
      </div>
      <div className="p-2">
        <div className="grid grid-cols-2 gap-1 rounded-md bg-secondary-100 p-1">
          <button
            type="button"
            onClick={() => onChange?.('calendar')}
            className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              value === 'calendar'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'text-secondary-700 hover:bg-white'
            }`}
            aria-pressed={value === 'calendar'}
          >
            <CalendarDays className="h-4 w-4" />
            Calendar
          </button>
          <button
            type="button"
            onClick={() => onChange?.('list')}
            className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              value === 'list'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'text-secondary-700 hover:bg-white'
            }`}
            aria-pressed={value === 'list'}
          >
            <ListIcon className="h-4 w-4" />
            List
          </button>
        </div>
      </div>
    </div>
  )
}
