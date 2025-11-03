import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'

export default function RequireAuth() {
  const { isAuthenticated } = useAuth()
  const loc = useLocation()
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: loc }} />
  return <Outlet />
}
