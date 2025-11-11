import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import { useState } from 'react'

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900">
      <Topbar onMenu={() => setMobileOpen(true)} />
      <div className="flex">
        <div className="hidden md:block"><Sidebar /></div>
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-[1400px] mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)}></div>
          <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
            <Sidebar />
          </div>
        </div>
      ) : null}
    </div>
  )
}
