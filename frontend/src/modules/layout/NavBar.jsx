import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'

export default function NavBar() {
  const { isAuthenticated, logout } = useAuth()
  const loc = useLocation()
  const active = (path) => loc.pathname.startsWith(path) 
    ? 'text-blue-400 font-semibold border-b-2 border-blue-400' 
    : 'text-gray-300 hover:text-white'

  return (
    <header className="shadow-sm border-b border-gray-700" style={{background: 'rgba(23, 24, 33, 0.8)', backdropFilter: 'blur(10px)'}}>
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Clínica Digital
          </span>
        </Link>
        {isAuthenticated ? (
          <nav className="flex items-center gap-6">
            <Link to="/dashboard" className={`${active('/dashboard')} pb-1 transition-all`}>Dashboard</Link>
            <Link to="/pacientes" className={`${active('/pacientes')} pb-1 transition-all`}>Pacientes</Link>
            <button onClick={logout} className="btn btn-primary ml-4">Sair</button>
          </nav>
        ) : (
          <nav>
            <Link to="/login" className="btn btn-primary">Entrar</Link>
          </nav>
        )}
      </div>
    </header>
  )
}
