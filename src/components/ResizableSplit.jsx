import { useCallback, useEffect, useRef, useState } from 'react'

const DEFAULT_MIN = 200
const DEFAULT_MAX = 520

export default function ResizableSplit({
  left,
  right,
  defaultLeftWidth = 260,
  minLeftWidth = DEFAULT_MIN,
  maxLeftWidth = DEFAULT_MAX,
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
        return Math.min(Math.max(parsed, minLeftWidth), maxLeftWidth)
      }
    }
    return defaultLeftWidth
  })
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    if (!storageKey) return
    window.localStorage.setItem(storageKey, String(Math.round(leftWidth)))
  }, [leftWidth, storageKey])

  const startDrag = useCallback((e) => {
    e.preventDefault()
    setDragging(true)
  }, [])

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

  return (
    <div
      ref={containerRef}
      className={`flex min-h-0 ${className}`}
    >
      <div
        style={{ width: leftWidth, flex: `0 0 ${leftWidth}px` }}
        className="min-w-0"
      >
        {left}
      </div>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panels"
        aria-valuemin={minLeftWidth}
        aria-valuemax={maxLeftWidth}
        aria-valuenow={Math.round(leftWidth)}
        tabIndex={0}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        onKeyDown={handleKeyDown}
        onDoubleClick={() => setLeftWidth(defaultLeftWidth)}
        className={`group relative mx-1 w-1 shrink-0 cursor-col-resize select-none rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
          dragging ? 'bg-primary-500' : 'bg-secondary-200 hover:bg-primary-400'
        }`}
      >
        <span className="pointer-events-none absolute inset-y-0 left-1/2 w-3 -translate-x-1/2" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">{right}</div>
    </div>
  )
}
