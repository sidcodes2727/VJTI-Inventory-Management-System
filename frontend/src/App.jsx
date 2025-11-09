import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import ToastProvider from './components/ToastProvider.jsx'

import Login from './pages/Login.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import LabList from './pages/LabList.jsx'
import InventoryOverview from './pages/InventoryOverview.jsx'
import StockDistribution from './pages/StockDistribution.jsx'
import RequestManagement from './pages/RequestManagement.jsx'
import LabDashboard from './pages/LabDashboard.jsx'
import Users from './pages/Users.jsx'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/admin"
            element={<ProtectedRoute roles={["admin"]} />}
          >
            <Route index element={<AdminDashboard />} />
            <Route path="labs" element={<LabList />} />
            <Route path="inventory" element={<InventoryOverview />} />
            <Route path="distribute" element={<StockDistribution />} />
            <Route path="requests" element={<RequestManagement />} />
            <Route path="users" element={<Users />} />
          </Route>

          <Route
            path="/lab"
            element={<ProtectedRoute roles={["lab"]} />}
          >
            <Route index element={<LabDashboard />} />
            <Route path="inventory" element={<InventoryOverview />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
