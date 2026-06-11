import { Menu, Bell, HelpCircle, Grid3x3, ChevronDown } from 'lucide-react'

function TraqsperaLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-600 text-white text-sm font-bold">
        T
      </div>
      <span className="text-base font-semibold text-secondary-900">Traqspera</span>
    </div>
  )
}

export default function Navbar() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-secondary-200 bg-white px-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="rounded p-1.5 hover:bg-secondary-100 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-secondary-700" />
        </button>
        <TraqsperaLogo />
        <button
          type="button"
          className="ml-2 hidden items-center gap-2 rounded-md border border-secondary-300 bg-white px-3 py-1.5 text-sm text-secondary-700 hover:bg-secondary-50 sm:inline-flex"
        >
          <span className="font-medium">Enterprise</span>
          <ChevronDown className="h-4 w-4 text-secondary-500" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="hidden items-center gap-2 rounded-md border border-secondary-300 bg-white px-3 py-1.5 text-sm text-secondary-700 hover:bg-secondary-50 sm:inline-flex"
        >
          <span className="font-medium">Viewing as Admin</span>
          <ChevronDown className="h-4 w-4 text-secondary-500" />
        </button>
        <button
          type="button"
          className="rounded p-2 text-secondary-600 hover:bg-secondary-100"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="rounded p-2 text-secondary-600 hover:bg-secondary-100"
          aria-label="Help"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="rounded p-2 text-secondary-600 hover:bg-secondary-100"
          aria-label="App switcher"
        >
          <Grid3x3 className="h-5 w-5" />
        </button>
        <div
          className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-secondary-700 text-xs font-semibold text-white"
          aria-label="Account"
        >
          JD
        </div>
      </div>
    </header>
  )
}
