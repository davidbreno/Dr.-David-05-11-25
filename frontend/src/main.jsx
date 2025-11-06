import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './modules/auth/AuthProvider.jsx'
import RequireAuth from './modules/auth/RequireAuth.jsx'
import Login from './modules/auth/Login.jsx'
import Sidebar from './modules/layout/Sidebar.jsx'
import { useAuth } from './modules/auth/AuthProvider.jsx'

import Dashboard from './modules/dashboard/Dashboard.jsx'
import PacientesList from './modules/pacientes/PacientesList.jsx'
import PacienteCreate from './modules/pacientes/PacienteCreate.jsx'
import PacienteEdit from './modules/pacientes/PacienteEdit.jsx'
import PacienteDetail from './modules/pacientes/PacienteDetail.jsx'

function AppContent() {
  const { isAuthenticated } = useAuth()
  
  return (
    <div className="min-h-screen">
      {isAuthenticated && <Sidebar />}
      <div className={isAuthenticated ? "ml-64 min-h-screen" : "min-h-screen"}>
        <div className="container mx-auto px-8 py-6">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<RequireAuth />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pacientes" element={<PacientesList />} />
              <Route path="/pacientes/new" element={<PacienteCreate />} />
              <Route path="/pacientes/:id" element={<PacienteDetail />} />
              <Route path="/pacientes/:id/edit" element={<PacienteEdit />} />
              <Route path="/profile" element={<div className="text-white">Profile (Em construção)</div>} />
              <Route path="/leaderboard" element={<div className="text-white">Leaderboard (Em construção)</div>} />
              <Route path="/order" element={<div className="text-white">Order (Em construção)</div>} />
              <Route path="/sales-report" element={<div className="text-white">Sales Report (Em construção)</div>} />
              <Route path="/message" element={<div className="text-white">Message (Em construção)</div>} />
              <Route path="/settings" element={<div className="text-white">Settings (Em construção)</div>} />
              <Route path="/favourite" element={<div className="text-white">Favourite (Em construção)</div>} />
              <Route path="/history" element={<div className="text-white">History (Em construção)</div>} />
            </Route>
            <Route path="*" element={<div className="text-white">404 - Página não encontrada</div>} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  )
}

const root = createRoot(document.getElementById('root'))
root.render(<App />)
