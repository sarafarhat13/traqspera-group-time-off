import {
  User,
  Clock,
  Users,
  Briefcase,
  HardHat,
  FileText,
  Wrench,
  Settings,
  UserCog,
  ChevronRight,
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'profile', icon: User, label: 'My Profile' },
  { id: 'time', icon: Clock, label: 'Time' },
  { id: 'team', icon: Users, label: 'Team' },
  { id: 'projects', icon: Briefcase, label: 'Projects' },
  { id: 'crews', icon: HardHat, label: 'Crews' },
  { id: 'reports', icon: FileText, label: 'Reports' },
  { id: 'docs', icon: FileText, label: 'Documents' },
  { id: 'tools', icon: Wrench, label: 'Tools' },
  { id: 'settings', icon: Settings, label: 'Settings', active: true },
  { id: 'admin', icon: UserCog, label: 'Admin' },
]

export default function Sidebar() {
  return (
    <aside
      aria-label="Primary"
      className="hidden md:flex w-12 shrink-0 flex-col items-center bg-traqspera-navy text-secondary-200 pt-3 pb-4 gap-1.5"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const active = item.active
        return (
          <button
            key={item.id}
            type="button"
            aria-label={item.label}
            className={`group relative flex h-9 w-9 items-center justify-center rounded-md transition-colors
              ${active ? 'bg-traqspera-navyDark text-white' : 'hover:bg-traqspera-navyMid text-secondary-300'}`}
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
            <ChevronRight className="h-3 w-3 absolute right-0.5 opacity-60" strokeWidth={2.5} />
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded bg-secondary-900 px-2 py-1 text-xs text-white opacity-0 shadow-md transition group-hover:opacity-100 z-30">
              {item.label}
            </span>
          </button>
        )
      })}
    </aside>
  )
}
