import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import TimeOffPage from './components/TimeOffPage'

export default function App() {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-secondary-50">
      <Navbar
        mainMenuOpen={navOpen}
        onMainMenuOpenChange={(open) => setNavOpen(open)}
      />
      <div className="relative flex min-h-0 flex-1">
        <Sidebar
          expanded={navOpen}
          onExpandedChange={(open) => setNavOpen(open)}
        />
        <div className="flex min-h-0 flex-1 pl-14">
          <TimeOffPage />
        </div>
      </div>
    </div>
  )
}
