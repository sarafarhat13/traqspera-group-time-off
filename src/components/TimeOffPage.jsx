import { useState } from 'react'
import {
  ModusWcButton,
  ModusWcIcon,
  ModusWcToast,
  ModusWcAlert,
} from '@trimble-oss/moduswebcomponents-react'
import BalanceCards from './BalanceCards'
import FilterPanel from './FilterPanel'
import ViewToggle from './ViewToggle'
import CalendarView from './CalendarView'
import AddRequestMenu from './AddRequestMenu'
import GroupRequestModal from './GroupRequestModal'

export default function TimeOffPage() {
  const [view, setView] = useState('calendar')
  const [groupOpen, setGroupOpen] = useState(false)
  const [toast, setToast] = useState(null)

  function handleAdd(kind) {
    if (kind === 'group') {
      setGroupOpen(true)
    } else {
      setToast('Opening individual request form…')
      setTimeout(() => setToast(null), 2200)
    }
  }

  function handleSubmit(payload) {
    console.info('Group time off request submitted', payload)
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-secondary-50">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <h1 className="text-xl font-semibold text-secondary-900">Time Off Requests</h1>
        <div className="flex flex-wrap items-center gap-2">
          <ModusWcButton variant="outlined" color="primary" size="md">
            <ModusWcIcon name="settings" size="sm" decorative />
            Time Off Settings
          </ModusWcButton>
          <ModusWcButton variant="outlined" color="primary" size="md">
            <ModusWcIcon name="download" size="sm" decorative />
            Export CSV
          </ModusWcButton>
          <AddRequestMenu onSelect={handleAdd} />
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 px-4 pb-6 sm:px-6 lg:grid-cols-[260px_1fr]">
        <div className="space-y-4">
          <ViewToggle value={view} onChange={setView} />
          <FilterPanel />
        </div>
        <div className="flex flex-1 flex-col gap-4">
          <BalanceCards />
          <CalendarView />
        </div>
      </div>

      {toast && (
        <ModusWcToast position="bottom-end" customClass="z-30">
          <ModusWcAlert alertTitle={toast} variant="info" />
        </ModusWcToast>
      )}

      <GroupRequestModal
        open={groupOpen}
        onClose={() => setGroupOpen(false)}
        onSubmit={handleSubmit}
      />
    </main>
  )
}
