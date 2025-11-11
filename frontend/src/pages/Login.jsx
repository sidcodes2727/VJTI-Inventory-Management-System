import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../utils/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { toast } from 'sonner'
import logo from '../assets/logo.webp'

export default function Login() {
  const [email, setEmail] = useState('admin@vjti.ac.in')
  const [password, setPassword] = useState('admin123')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="min-h-screen bg-gradient-to-br from-vjtiBlue/10 via-vjtiGold/10 to-white">
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl ring-1 ring-black/5 p-8 animate-scale-in">
          <div className="mb-6 text-center">
            <img src={logo} alt="VJTI" className="h-12 w-auto mx-auto mb-3" />
            <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
            <p className="text-sm text-gray-600 mt-1">Access your VJTI Inventory dashboard</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none focus:border-vjtiGold focus:ring-2 focus:ring-vjtiGold/60"
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                <option value="" disabled>Select your role</option>
                <option value="admin">Admin</option>
                <option value="lab">Lab</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-vjtiGold focus:ring-2 focus:ring-vjtiGold/60"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@vjti.ac.in"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-20 text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-vjtiGold focus:ring-2 focus:ring-vjtiGold/60"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-1 my-1 inline-flex items-center rounded-md px-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-vjtiGold/60"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.86 19.86 0 0 1 5.06-6.94" />
                      <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a19.86 19.86 0 0 1-3.22 4.47" />
                      <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24" />
                      <path d="M1 1l22 22" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                  <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full rounded-lg bg-vjtiBlue px-4 py-2.5 text-white font-medium shadow hover:bg-vjtiBlue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vjtiGold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-4 text-center">Sample: admin@vjti.ac.in / admin123</p>
        </div>
      </div>
    </div>
  )
}
