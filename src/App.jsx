import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import TimeOffPage from './components/TimeOffPage'

export default function App() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-secondary-50">
      <Navbar />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <TimeOffPage />
      </div>
    </div>
  )
}
