import { useCallback, useEffect, useRef, useState } from 'react'
import { ModusWcIcon } from '@trimble-oss/moduswebcomponents-react'

const DEFAULT_MIN = 200
const DEFAULT_MAX = 520

export default function ResizableSplit({
  left,
  right,
  defaultLeftWidth = 260,
  minLeftWidth = DEFAULT_MIN,
  maxLeftWidth = DEFAULT_MAX,
  collapsedWidth = 0,
  storageKey,
  className = '',
}) {
  const containerRef = useRef(null)
  const [leftWidth, setLeftWidth] = useState(() => {
    if (typeof window === 'undefined') return defaultLeftWidth
    if (storageKey) {
      const saved = window.localStorage.getItem(storageKey)
      const parsed = saved ? Number(saved) : NaN
      if (Number.isFinite(parsed)) {
        if (parsed === collapsedWidth) return collapsedWidth
        return Math.min(Math.max(parsed, minLeftWidth), maxLeftWidth)
      }
    }
    return defaultLeftWidth
  })
  const [dragging, setDragging] = useState(false)
  const [lastExpanded, setLastExpanded] = useState(defaultLeftWidth)

  const collapsed = leftWidth === collapsedWidth

  useEffect(() => {
    if (!storageKey) return
    window.localStorage.setItem(storageKey, String(Math.round(leftWidth)))
  }, [leftWidth, storageKey])

  const startDrag = useCallback(
    (e) => {
      if (collapsed) return
      e.preventDefault()
      setDragging(true)
    },
    [collapsed],
  )

  useEffect(() => {
    if (!dragging) return

    function onMove(clientX) {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const next = clientX - rect.left
      const clamped = Math.min(Math.max(next, minLeftWidth), maxLeftWidth)
      setLeftWidth(clamped)
    }

    function onMouseMove(e) {
      onMove(e.clientX)
    }
    function onTouchMove(e) {
      if (e.touches?.[0]) onMove(e.touches[0].clientX)
    }
    function onUp() {
      setDragging(false)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', onUp)
    const previousCursor = document.body.style.cursor
    const previousSelect = document.body.style.userSelect
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onUp)
      document.body.style.cursor = previousCursor
      document.body.style.userSelect = previousSelect
    }
  }, [dragging, minLeftWidth, maxLeftWidth])

  function handleKeyDown(e) {
    if (collapsed) return
    const step = e.shiftKey ? 32 : 16
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setLeftWidth((w) => Math.max(w - step, minLeftWidth))
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      setLeftWidth((w) => Math.min(w + step, maxLeftWidth))
    } else if (e.key === 'Home') {
      e.preventDefault()
      setLeftWidth(minLeftWidth)
    } else if (e.key === 'End') {
      e.preventDefault()
      setLeftWidth(maxLeftWidth)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setLeftWidth(defaultLeftWidth)
    }
  }

  function toggleCollapsed(e) {
    e.stopPropagation()
    if (collapsed) {
      setLeftWidth(lastExpanded || defaultLeftWidth)
    } else {
      setLastExpanded(leftWidth)
      setLeftWidth(collapsedWidth)
    }
  }

  return (
    <div ref={containerRef} className={`flex min-h-0 ${className}`}>
      <div
        style={{ width: leftWidth, flex: `0 0 ${leftWidth}px` }}
        className={`min-w-0 transition-[width,flex-basis] duration-150 ease-out ${
          collapsed ? 'overflow-hidden' : ''
        }`}
        aria-hidden={collapsed ? 'true' : undefined}
      >
        {collapsed ? null : left}
      </div>
      <div className="relative flex shrink-0 items-stretch px-3">
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={`Resize filters panel. Current width ${Math.round(leftWidth)} pixels.`}
          aria-valuemin={minLeftWidth}
          aria-valuemax={maxLeftWidth}
          aria-valuenow={Math.round(leftWidth)}
          tabIndex={0}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          onKeyDown={handleKeyDown}
          onDoubleClick={() => setLeftWidth(defaultLeftWidth)}
          className={`group relative flex shrink-0 select-none items-center justify-center transition-colors focus:outline-none ${
            collapsed ? 'cursor-default' : 'cursor-col-resize'
          }`}
          title={
            collapsed ? 'Filters collapsed' : 'Drag to resize · double-click to reset'
          }
        >
          <span
            className={`pointer-events-none absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 transition-colors ${
              dragging
                ? 'bg-primary-500'
                : collapsed
                  ? 'bg-secondary-200'
                  : 'bg-secondary-300 group-hover:bg-primary-400'
            }`}
          />
          {dragging && (
            <span
              className="pointer-events-none absolute top-1/2 left-full ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-secondary-900 px-2 py-1 text-xs font-medium text-white shadow-lg"
              role="status"
            >
              {Math.round(leftWidth)}px
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Show filters panel' : 'Hide filters panel'}
          aria-expanded={!collapsed}
          title={collapsed ? 'Show filters panel' : 'Hide filters panel'}
          className="absolute top-1/2 left-1/2 z-10 flex h-12 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-secondary-300 bg-white text-secondary-600 shadow-md transition-all hover:border-primary-500 hover:bg-primary-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <ModusWcIcon
            name={collapsed ? 'chevron_right' : 'chevron_left'}
            size="sm"
            decorative
          />
        </button>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">{right}</div>
    </div>
  )
}
