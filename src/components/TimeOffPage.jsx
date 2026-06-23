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
import PendingRequestModal from './PendingRequestModal'
import ResizableSplit from './ResizableSplit'
import useMediaQuery from '../hooks/useMediaQuery'
import { REQUESTS } from '../data/mockData'

const ACTION_LABEL = {
  approve: 'approved',
  decline: 'declined',
  edit: 'opened for edit',
  delete: 'deleted',
}

export default function TimeOffPage() {
  const [view, setView] = useState('calendar')
  const [groupOpen, setGroupOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [activeRequest, setActiveRequest] = useState(null)
  const isLargeScreen = useMediaQuery('(min-width: 1024px)')

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

  function handleEventClick(event) {
    const id = event?.requestId
    const request = id ? REQUESTS[id] : null
    if (request) setActiveRequest(request)
  }

  function handleRequestAction(action, { request }) {
    setActiveRequest(null)
    setToast(`Request #${request.requestNumber} ${ACTION_LABEL[action] ?? action}.`)
    setTimeout(() => setToast(null), 2200)
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

      <div className="flex flex-1 flex-col px-4 pb-6 sm:px-6">
        {isLargeScreen ? (
          <ResizableSplit
            className="flex-1"
            storageKey="traqspera.timeoff.leftWidth"
            defaultLeftWidth={260}
            minLeftWidth={220}
            maxLeftWidth={520}
            left={
              <div className="space-y-4 pr-2">
                <ViewToggle value={view} onChange={setView} />
                <FilterPanel />
              </div>
            }
            right={
              <div className="flex flex-1 flex-col gap-4 pl-2">
                <BalanceCards />
                <CalendarView onEventClick={handleEventClick} />
              </div>
            }
          />
        ) : (
          <div className="flex flex-1 flex-col gap-4">
            <div className="space-y-4">
              <ViewToggle value={view} onChange={setView} />
              <FilterPanel />
            </div>
            <div className="flex flex-1 flex-col gap-4">
              <BalanceCards />
              <CalendarView onEventClick={handleEventClick} />
            </div>
          </div>
        )}
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

      <PendingRequestModal
        open={Boolean(activeRequest)}
        request={activeRequest}
        onClose={() => setActiveRequest(null)}
        onAction={handleRequestAction}
      />
    </main>
  )
}
