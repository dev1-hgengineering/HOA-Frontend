import { createContext, useContext, useState, useEffect } from 'react'
import api from '@/lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [org, setOrg] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/auth/me')
      .then((res) => {
        setUser(res.data.user)
        setOrg(res.data.org || null)
      })
      .catch(() => {
        setUser(null)
        setOrg(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    setUser(res.data.user)
    setOrg(res.data.org || null)
    return res.data
  }

  const signup = async (payload) => {
    const res = await api.post('/auth/signup', payload)
    setUser(res.data.user)
    setOrg(res.data.org || null)
    return res.data
  }

  const acceptInvite = async (token, first_name, last_name, password) => {
    const res = await api.post('/auth/accept-invite', { token, first_name, last_name, password })
    setUser(res.data.user)
    setOrg(null)
    return res.data
  }

  const acceptResident = async (token, first_name, last_name, password) => {
    const res = await api.post('/auth/accept-resident', { token, first_name, last_name, password })
    setUser(res.data.user)
    setOrg(null)
    return res.data
  }

  const updateOrg = (updates) => {
    setOrg((prev) => prev ? { ...prev, ...updates } : prev)
  }

  const logout = async () => {
    await api.post('/auth/logout')
    setUser(null)
    setOrg(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, org, loading, login, signup, acceptInvite, acceptResident, updateOrg, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
