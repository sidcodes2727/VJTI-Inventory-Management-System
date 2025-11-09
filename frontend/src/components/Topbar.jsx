import { useAuth } from '../context/AuthContext.jsx'
import { Icon } from './Icons.jsx'
import logo from '../assets/logo.webp'
import titleImg from '../assets/image.png'
import adminAvatar from '../assets/admin.png'
import labAvatar from '../assets/lab.png'

export default function Topbar() {
  const { user, logout } = useAuth()
  return (
    <header className="h-14 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40 flex items-center justify-between px-4 shadow-sm">
      <div className="flex items-center gap-3">
        <img src={logo} alt="Logo" className="h-10 w-auto" />
        <div className="font-medium text-vjtiBlue flex items-center gap-2">
          {/* <img src={titleImg} alt="VJTI mark" className="h-5 w-5 object-contain" /> */}
          <span>VJTI Inventory Management System</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-600 flex items-center gap-2">
          {user?.role ? (
            <img
              src={user.role === 'admin' ? adminAvatar : labAvatar}
              alt={user.role}
              className="h-6 w-6 object-contain"
            />
          ) : null}
          <span>{user?.name} ({user?.role})</span>
        </div>
        <button onClick={logout} className="text-sm px-3 py-1.5 bg-vjtiBlue text-white rounded shadow-sm hover:shadow transition-all inline-flex items-center gap-1">
          <Icon.Logout />
          <span>Logout</span>
        </button>
      </div>
    </header>
  )
}
