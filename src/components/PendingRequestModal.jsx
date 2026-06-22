import { useEffect, useState } from 'react'
import {
  ModusWcButton,
  ModusWcIcon,
  ModusWcTextarea,
} from '@trimble-oss/moduswebcomponents-react'

const STATUS_BADGE = {
  pending: 'bg-warning-400 text-secondary-900',
  approved: 'bg-success-600 text-white',
  declined: 'bg-danger-500 text-white',
}

function parseLocalDate(value) {
  if (!value) return null
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/
  if (dateOnly.test(value)) {
    const [y, m, day] = value.split('-').map(Number)
    return new Date(y, m - 1, day)
  }
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function formatDate(value) {
  const d = parseLocalDate(value)
  if (!d) return value ?? '—'
  return d.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatShortDate(value) {
  const d = parseLocalDate(value)
  if (!d) return value ?? '—'
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(value) {
  const d = parseLocalDate(value)
  if (!d) return value ?? '—'
  const date = d.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const time = d
    .toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    .toLowerCase()
  return `${date} at ${time}`
}

function PanelSection({ children }) {
  return (
    <section className="rounded-md bg-secondary-100 px-4 py-3 text-sm text-secondary-800">
      {children}
    </section>
  )
}

export default function PendingRequestModal({ request, open, onClose, onAction }) {
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

  if (!open || !request) return null

  return (
    <RequestModalBody
      key={request.id}
      request={request}
      onClose={onClose}
      onAction={onAction}
    />
  )
}

function RequestModalBody({ request, onClose, onAction }) {
  const [comment, setComment] = useState('')
  const [historyOpen, setHistoryOpen] = useState(false)

  const statusLabel =
    request.status.charAt(0).toUpperCase() + request.status.slice(1)
  const statusClass =
    STATUS_BADGE[request.status] ?? 'bg-secondary-300 text-secondary-800'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-modal-title"
      className="fixed inset-0 z-40 flex items-center justify-center bg-secondary-900/50 px-4 py-6 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className="flex max-h-full w-full max-w-xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl animate-scaleIn">
        <header className="flex shrink-0 items-center justify-between px-5 pt-4 pb-3">
          <h2
            id="request-modal-title"
            className="text-lg font-semibold text-secondary-900"
          >
            Add Request
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900"
          >
            <ModusWcIcon name="close" size="md" decorative />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 pb-2">
          <div className="flex items-start justify-between gap-3 pb-4">
            <div className="flex items-start gap-3">
              <div
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-700 text-sm font-semibold text-white"
              >
                {request.employee.initials}
              </div>
              <div className="text-sm text-secondary-800">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-medium">
                    {request.requestNumber} - {request.employee.name}
                  </span>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-primary-600 underline hover:text-primary-700"
                  >
                    (View profile)
                  </a>
                </div>
                <div className="text-xs text-secondary-500">
                  Requested on {formatDateTime(request.requestedOn)}
                </div>
              </div>
            </div>
            <span
              className={`inline-flex shrink-0 items-center rounded px-2 py-1 text-xs font-semibold ${statusClass}`}
            >
              {statusLabel}
            </span>
          </div>

          {request.warning && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-3 rounded-md border-l-4 border-warning-400 bg-warning-50 px-3 py-3"
            >
              <ModusWcIcon
                name="warning"
                size="md"
                decorative
                customClass="mt-0.5 text-secondary-900"
              />
              <div className="text-sm text-secondary-800">
                <div className="font-semibold text-secondary-900">
                  {request.warning.title}
                </div>
                <p className="mt-1 leading-snug">{request.warning.message}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <PanelSection>
              <div>
                <span className="font-semibold">Type:</span> {request.type}
              </div>
              <div className="mt-1">
                <span className="font-semibold">Date Range:</span>{' '}
                {formatDate(request.dateRange.start)} -{' '}
                {formatDate(request.dateRange.end)}
              </div>
              {request.requesterComment && (
                <div className="mt-1">
                  <span className="font-semibold">Comment:</span>{' '}
                  {request.requesterComment}
                </div>
              )}
            </PanelSection>

            <PanelSection>
              <div className="font-semibold">
                Total Hours: {request.totalHours.toFixed(2)} hrs
              </div>
              <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto pr-2">
                {request.days.map((d) => (
                  <li
                    key={d.date}
                    className={`flex items-center gap-2 ${
                      d.conflict ? 'text-warning-700' : 'text-secondary-800'
                    }`}
                  >
                    <span className="font-medium">
                      {formatShortDate(d.date)}:
                    </span>
                    <span>{d.hours.toFixed(2)} hrs</span>
                    {d.conflict && (
                      <ModusWcIcon
                        name="warning"
                        size="sm"
                        decorative
                        customClass="text-warning-500"
                      />
                    )}
                  </li>
                ))}
              </ul>
            </PanelSection>

            <PanelSection>
              <div className="font-semibold">Balance</div>
              <div className="mt-1">
                <span className="font-semibold">Estimated Vacation:</span>{' '}
                {request.balance.vacation.toFixed(2)} hrs
              </div>
              <div>
                <span className="font-semibold">Estimated Sick:</span>{' '}
                {request.balance.sick.toFixed(2)} hrs
              </div>
            </PanelSection>

            <button
              type="button"
              onClick={() => setHistoryOpen((v) => !v)}
              aria-expanded={historyOpen}
              className="flex w-full items-center justify-between rounded-md border border-secondary-200 bg-white px-4 py-3 text-left text-sm font-semibold text-secondary-900 hover:bg-secondary-50"
            >
              <span>History</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary-200 text-secondary-700">
                <ModusWcIcon
                  name={historyOpen ? 'expand_less' : 'expand_more'}
                  size="sm"
                  decorative
                />
              </span>
            </button>
            {historyOpen && (
              <ul className="space-y-1 rounded-md border border-secondary-200 bg-white px-4 py-3 text-sm text-secondary-700">
                {request.history.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ModusWcIcon
                      name="history"
                      size="sm"
                      decorative
                      customClass="mt-0.5 text-secondary-500"
                    />
                    <span>
                      <span className="font-medium text-secondary-900">
                        {h.actor}
                      </span>{' '}
                      {h.action} ·{' '}
                      <span className="text-secondary-500">
                        {formatDateTime(h.at)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div>
              <label
                htmlFor="approver-comment"
                className="mb-1 block text-sm font-medium text-secondary-800"
              >
                Comment
              </label>
              <ModusWcTextarea
                id="approver-comment"
                value={comment}
                placeholder="Placeholder"
                onInputChange={(e) =>
                  setComment(e.detail?.target?.value ?? '')
                }
              />
            </div>
          </div>
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-secondary-200 bg-white px-5 py-3">
          <ModusWcButton
            variant="outlined"
            color="tertiary"
            onButtonClick={() => onAction?.('delete', { request, comment })}
          >
            <ModusWcIcon name="delete" size="sm" decorative />
            Delete
          </ModusWcButton>
          <ModusWcButton
            color="danger"
            onButtonClick={() => onAction?.('decline', { request, comment })}
          >
            <ModusWcIcon name="thumbs_down" size="sm" decorative />
            Decline
          </ModusWcButton>
          <button
            type="button"
            onClick={() => onAction?.('approve', { request, comment })}
            className="inline-flex items-center gap-2 rounded-md bg-success-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-success-500 focus:ring-offset-2"
          >
            <ModusWcIcon name="thumbs_up" size="sm" decorative />
            Approve
          </button>
          <ModusWcButton
            color="primary"
            onButtonClick={() => onAction?.('edit', { request, comment })}
          >
            <ModusWcIcon name="edit_combination" size="sm" decorative />
            Edit
          </ModusWcButton>
        </footer>
      </div>
    </div>
  )
}
