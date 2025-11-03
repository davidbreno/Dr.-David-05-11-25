import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'

export default function NavBar() {
  const { isAuthenticated, logout } = useAuth()
  const loc = useLocation()
  const active = (path) => loc.pathname.startsWith(path) 
    ? 'text-blue-600 font-semibold border-b-2 border-blue-600' 
    : 'text-gray-600 hover:text-gray-900'

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
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
            <Link to="/pacientes" className={`${active('/pacientes')} pb-1 transition-all`}>Pacientes</Link>
            <Link to="/orcamentos" className={`${active('/orcamentos')} pb-1 transition-all`}>Orçamentos</Link>
            <Link to="/odontogramas" className={`${active('/odontogramas')} pb-1 transition-all`}>Odontograma</Link>
            <Link to="/lancamentos" className={`${active('/lancamentos')} pb-1 transition-all`}>Financeiro</Link>
            <Link to="/produtos" className={`${active('/produtos')} pb-1 transition-all`}>Estoque</Link>
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
