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
import GroupRequestDetailPage from './GroupRequestDetailPage'
import { REQUESTS, GROUP_REQUESTS } from '../data/mockData'

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
  const [activeGroupRequest, setActiveGroupRequest] = useState(null)

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
    if (!id) return
    if (event.kind === 'group') {
      const group = GROUP_REQUESTS[id]
      if (group) setActiveGroupRequest(group)
      return
    }
    const request = REQUESTS[id]
    if (request) setActiveRequest(request)
  }

  function handleRequestAction(action, { request }) {
    setActiveRequest(null)
    setToast(`Request #${request.requestNumber} ${ACTION_LABEL[action] ?? action}.`)
    setTimeout(() => setToast(null), 2200)
  }

  function handleGroupAction(action, { request, step }) {
    setActiveGroupRequest(null)
    const stepLabel = step ? ` for the ${step.role} step` : ''
    const finalNote =
      request.status === 'approved'
        ? ' — workflow complete.'
        : request.status === 'declined'
          ? ' — workflow stopped.'
          : '.'
    setToast(
      `Group request #${request.requestNumber} ${ACTION_LABEL[action] ?? action}${stepLabel}${finalNote}`,
    )
    setTimeout(() => setToast(null), 2800)
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
          <CalendarView onEventClick={handleEventClick} />
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

      <PendingRequestModal
        open={Boolean(activeRequest)}
        request={activeRequest}
        onClose={() => setActiveRequest(null)}
        onAction={handleRequestAction}
      />

      <GroupRequestDetailPage
        open={Boolean(activeGroupRequest)}
        request={activeGroupRequest}
        onClose={() => setActiveGroupRequest(null)}
        onAction={handleGroupAction}
      />
    </main>
  )
}
