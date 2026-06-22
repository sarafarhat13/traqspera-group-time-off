import { ModusWcNavbar } from '@trimble-oss/moduswebcomponents-react'

const visibility = {
  ai: false,
  apps: true,
  help: true,
  logo: false,
  mainMenu: true,
  notifications: true,
  search: false,
  searchInput: false,
  user: true,
}

const userCard = {
  name: 'Jane Doe',
  email: 'jane.doe@traqspera.com',
  avatarAlt: 'Jane Doe',
}

function TraqsperaLogo() {
  return (
    <div className="flex items-center gap-3 pl-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-600 text-sm font-bold text-white">
        T
      </div>
      <span className="text-base font-semibold text-secondary-900">Traqspera</span>
      <button
        type="button"
        className="ml-2 hidden items-center gap-2 rounded-md border border-secondary-300 bg-white px-3 py-1 text-sm text-secondary-700 hover:bg-secondary-50 sm:inline-flex"
      >
        <span className="font-medium">Enterprise</span>
        <span aria-hidden className="text-secondary-500">▾</span>
      </button>
    </div>
  )
}

function ViewingAs() {
  return (
    <div className="flex items-center gap-2 pr-3">
      <button
        type="button"
        className="hidden items-center gap-2 rounded-md border border-secondary-300 bg-white px-3 py-1 text-sm text-secondary-700 hover:bg-secondary-50 sm:inline-flex"
      >
        <span className="font-medium">Viewing as Admin</span>
        <span aria-hidden className="text-secondary-500">▾</span>
      </button>
    </div>
  )
}

export default function Navbar({ mainMenuOpen = false, onMainMenuOpenChange }) {
  return (
    <ModusWcNavbar
      visibility={visibility}
      userCard={userCard}
      mainMenuOpen={mainMenuOpen}
      onMainMenuOpenChange={(e) => onMainMenuOpenChange?.(e.detail)}
      customClass="traqspera-navbar"
    >
      <div slot="start">
        <TraqsperaLogo />
      </div>
      <div slot="end">
        <ViewingAs />
      </div>
      <div slot="main-menu" className="p-4 text-sm text-secondary-700">
        {/* Sidebar provides the actual navigation; this slot is intentionally empty. */}
      </div>
      <div slot="notifications" className="p-4 text-sm text-secondary-700">
        No new notifications.
      </div>
      <div slot="apps" className="p-4 text-sm text-secondary-700">
        Traqspera workspaces will appear here.
      </div>
    </ModusWcNavbar>
  )
}
