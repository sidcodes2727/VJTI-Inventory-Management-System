import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Icon } from './Icons.jsx'
import sidebarImage from '../assets/image.png'

const NavLink = ({ to, label, icon: IconEl }) => {
  const { pathname } = useLocation()
  const active = pathname === to
  return (
    <Link to={to} className={`group flex items-center gap-2 px-4 py-2 rounded transition-colors ${active ? 'bg-gray-100 text-vjtiBlue font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
      {IconEl ? <IconEl className={`transition-transform group-hover:scale-110 ${active ? 'text-vjtiBlue' : 'text-gray-500'}`} /> : null}
      <span>{label}</span>
    </Link>
  )
}

export default function Sidebar() {
  const { user } = useAuth()
  return (
    <aside className="w-64 border-r bg-white h-screen sticky top-0 p-4 space-y-2">
      <div className="flex items-center gap-2 text-vjtiBlue">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          {/* <img src={sidebarImage} alt="VJTI mark" className="h-6 w-6 object-contain" /> */}
          {/* <span>VJTI Inventory</span> */}
        </h1>
      </div>
      <nav className="mt-4 space-y-1">
        {user?.role === 'admin' ? (
          <>
            <NavLink to="/admin" label="Dashboard" icon={Icon.Dashboard} />
            <NavLink to="/admin/labs" label="Labs" icon={Icon.Labs} />
            <NavLink to="/admin/inventory" label="Inventory" icon={Icon.Inventory} />
            <NavLink to="/admin/distribute" label="Distribute Stock" icon={Icon.Transfer} />
            <NavLink to="/admin/requests" label="Requests" icon={Icon.Requests} />
            <NavLink to="/admin/users" label="Users" icon={Icon.Users} />
          </>
        ) : (
          <>
            <NavLink to="/lab" label="Dashboard" icon={Icon.Dashboard} />
            <NavLink to="/lab/inventory" label="My Inventory" icon={Icon.Inventory} />
          </>
        )}
      </nav>
    </aside>
  )
}
