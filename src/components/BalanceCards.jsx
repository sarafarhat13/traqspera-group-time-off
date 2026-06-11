import { CalendarDays, Thermometer } from 'lucide-react'
import { BALANCES } from '../data/mockData'

function iconFor(name) {
  if (name === 'thermometer') return Thermometer
  return CalendarDays
}

export default function BalanceCards() {
  return (
    <section aria-label="My Balances">
      <h2 className="mb-2 text-sm font-semibold text-secondary-700">My Balances</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {BALANCES.map((b) => {
          const Icon = iconFor(b.icon)
          const negative = b.hours < 0
          return (
            <article
              key={b.id}
              className="overflow-hidden rounded-lg border border-secondary-200 bg-white shadow-xs"
            >
              <header className="flex items-center gap-2 bg-traqspera-navy px-4 py-2 text-white">
                <Icon className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {b.label}
                </span>
              </header>
              <div className="px-4 py-3">
                <div
                  className={`text-2xl font-bold tabular-nums ${
                    negative ? 'text-danger-600' : 'text-secondary-900'
                  }`}
                >
                  {b.hours.toFixed(2)}
                </div>
                <div className="mt-0.5 text-xs text-secondary-500">Estimated Hours</div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
