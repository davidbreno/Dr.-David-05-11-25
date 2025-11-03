import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api/client.js'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('access_token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  async function login(username, password) {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/token/', { username, password })
      localStorage.setItem('access_token', data.access)
      setToken(data.access)
      // Optional: decode or fetch /admin/me later
      setUser({ username })
      return true
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('access_token')
    setToken(null)
    setUser(null)
  }

  const value = { token, user, login, logout, loading, isAuthenticated: !!token }
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  return useContext(AuthCtx)
}
