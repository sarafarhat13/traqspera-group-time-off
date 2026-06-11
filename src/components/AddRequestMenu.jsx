import { useEffect, useRef, useState } from 'react'
import { Plus, User, Users } from 'lucide-react'

export default function AddRequestMenu({ onSelect }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    function onEsc(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  function choose(kind) {
    setOpen(false)
    onSelect?.(kind)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-primary"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Plus className="h-4 w-4" />
        Add Request
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-56 origin-top-right animate-scaleIn rounded-lg border border-secondary-200 bg-white shadow-lg ring-1 ring-black/5"
        >
          <button
            role="menuitem"
            onClick={() => choose('individual')}
            className="flex w-full items-center gap-3 rounded-t-lg px-3 py-2.5 text-left text-sm text-secondary-800 hover:bg-secondary-50"
          >
            <User className="h-4 w-4 text-secondary-500" />
            Individual Request
          </button>
          <div className="border-t border-secondary-100" />
          <button
            role="menuitem"
            onClick={() => choose('group')}
            className="flex w-full items-center gap-3 rounded-b-lg px-3 py-2.5 text-left text-sm text-secondary-800 hover:bg-secondary-50"
          >
            <Users className="h-4 w-4 text-secondary-500" />
            Group Request
          </button>
        </div>
      )}
    </div>
  )
}
