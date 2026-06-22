import { ModusWcCard, ModusWcIcon } from '@trimble-oss/moduswebcomponents-react'
import { BALANCES } from '../data/mockData'

function iconFor(name) {
  if (name === 'thermometer') return 'thermometer_hot'
  return 'calendar'
}

export default function BalanceCards() {
  return (
    <section aria-label="My Balances">
      <h2 className="mb-2 text-sm font-semibold text-secondary-700">My Balances</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {BALANCES.map((b) => {
          const negative = b.hours < 0
          return (
            <ModusWcCard key={b.id} bordered padding="compact" customClass="balance-card">
              <div className="-m-3 mb-3 flex items-center gap-2 rounded-t-md bg-primary-700 px-4 py-2 text-white">
                <ModusWcIcon name={iconFor(b.icon)} size="sm" decorative />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {b.label}
                </span>
              </div>
              <div>
                <div
                  className={`text-2xl font-bold tabular-nums ${
                    negative ? 'text-danger-600' : 'text-secondary-900'
                  }`}
                >
                  {b.hours.toFixed(2)}
                </div>
                <div className="mt-0.5 text-xs text-secondary-500">Estimated Hours</div>
              </div>
            </ModusWcCard>
          )
        })}
      </div>
    </section>
  )
}
