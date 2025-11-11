import { useAuth } from '../context/AuthContext.jsx'
import { Icon } from './Icons.jsx'
import logo from '../assets/logo.webp'
import titleImg from '../assets/image.png'
import adminAvatar from '../assets/admin.png'
import labAvatar from '../assets/lab.png'
import { useState } from 'react'
import Modal from './Modal.jsx'

export default function Topbar({ onMenu }) {
  const { user, logout } = useAuth()
  const [confirmOpen, setConfirmOpen] = useState(false)
  return (
    <>
    <header className="h-16 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <button type="button" onClick={onMenu} className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition" aria-label="Open menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-700">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <img src={logo} alt="Logo" className="h-10 w-auto flex-shrink-0" />
        <div className="font-medium text-vjtiBlue flex items-center gap-2 min-w-0">
          {/* <img src={titleImg} alt="VJTI mark" className="h-5 w-5 object-contain" /> */}
          <span className="hidden sm:inline truncate max-w-[50vw] md:max-w-none">VJTI Inventory Management System</span>
        </div>
      </div>
      <div className="flex items-center gap-3 whitespace-nowrap">
        <div className="text-sm text-gray-700 flex items-center gap-2">
          {user?.role ? (
            <img
              src={user.role === 'admin' ? adminAvatar : labAvatar}
              alt={user.role}
              className="h-7 w-7 object-contain rounded-full bg-gray-100 p-0.5"
            />
          ) : null}
          <span>{user?.name} ({user?.role})</span>
        </div>
        <button onClick={() => setConfirmOpen(true)} className="text-sm px-3 py-1.5 bg-vjtiBlue text-white rounded shadow-sm hover:shadow-md hover:bg-vjtiBlue/90 active:scale-[0.98] transition inline-flex items-center gap-1 flex-shrink-0">
          <Icon.Logout />
          <span>Logout</span>
        </button>
      </div>
    </header>
    <Modal
      open={confirmOpen}
      onClose={() => setConfirmOpen(false)}
      title="Confirm Logout"
      footer={
        <>
          <button onClick={() => setConfirmOpen(false)} className="px-3 py-1.5 rounded border">Cancel</button>
          <button onClick={logout} className="px-3 py-1.5 rounded bg-vjtiBlue text-white">Logout</button>
        </>
      }
    >
      <p className="text-sm text-gray-700">Are you sure you want to log out?</p>
    </Modal>
    </>
  )
}
