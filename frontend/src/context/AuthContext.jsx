import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('vjti_user')
    return raw ? JSON.parse(raw) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('vjti_token'))

  useEffect(() => {
    if (user) localStorage.setItem('vjti_user', JSON.stringify(user))
    else localStorage.removeItem('vjti_user')
  }, [user])

  useEffect(() => {
    if (token) localStorage.setItem('vjti_token', token)
    else localStorage.removeItem('vjti_token')
  }, [token])

  const login = (nextUser, nextToken) => {
    setUser(nextUser)
    setToken(nextToken)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
  }

  const value = useMemo(() => ({ user, token, login, logout }), [user, token])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
