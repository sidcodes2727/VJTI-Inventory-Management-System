import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../utils/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { toast } from 'sonner'

export default function Login() {
  const [email, setEmail] = useState('admin@vjti.ac.in')
  const [password, setPassword] = useState('admin123')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const nav = useNavigate()
  const location = useLocation()

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!role) {
      toast.error('Please select a role')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      if (data?.user?.role !== role) {
        toast.error('Selected role does not match your account permissions')
        return
      }
      login(data.user, data.token)
      toast.success('Logged in')
      const redirect = role === 'admin' ? '/admin' : '/lab'
      const from = location.state?.from?.pathname
      nav(from || redirect, { replace: true })
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white p-6 rounded shadow">
        <h1 className="text-xl font-semibold mb-4 text-vjtiBlue">Sign in</h1>
        <label className="block text-sm mb-1">Role</label>
        <select className="w-full border rounded px-3 py-2 mb-3" value={role} onChange={e=>setRole(e.target.value)}>
          <option value="" disabled>Select your role</option>
          <option value="admin">Admin</option>
          <option value="lab">Lab</option>
        </select>
        <label className="block text-sm mb-1">Email</label>
        <input className="w-full border rounded px-3 py-2 mb-3" value={email} onChange={e=>setEmail(e.target.value)} />
        <label className="block text-sm mb-1">Password</label>
        <input type="password" className="w-full border rounded px-3 py-2 mb-4" value={password} onChange={e=>setPassword(e.target.value)} />
        <button disabled={loading} className="w-full bg-vjtiBlue text-white rounded py-2 disabled:opacity-60">{loading? 'Signing in...' : 'Sign in'}</button>
        <p className="text-xs text-gray-500 mt-3">Sample: admin@vjti.ac.in / admin123</p>
      </form>
    </div>
  )
}
