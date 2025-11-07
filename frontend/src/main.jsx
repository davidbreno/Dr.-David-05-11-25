import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './modules/auth/AuthProvider.jsx'
import RequireAuth from './modules/auth/RequireAuth.jsx'
import Login from './modules/auth/Login.jsx'
import Sidebar from './modules/layout/Sidebar.jsx'
import { useAuth } from './modules/auth/AuthProvider.jsx'
import { SettingsProvider, useSettings } from './modules/settings/SettingsProvider.jsx'
import SettingsPage from './modules/settings/SettingsPage.jsx'

import Dashboard from './modules/dashboard/Dashboard.jsx'
import PacientesList from './modules/pacientes/PacientesList.jsx'
import PacienteCreate from './modules/pacientes/PacienteCreate.jsx'
import PacienteEdit from './modules/pacientes/PacienteEdit.jsx'
import PacienteDetail from './modules/pacientes/PacienteDetail.jsx'

function AppContent() {
  const { isAuthenticated } = useAuth()
  const { preferences } = useSettings()

  const layoutClasses = `min-h-screen ${preferences.showTexture ? 'texture-grid' : ''}`
  const containerSpacing = preferences.compactSpacing ? 'px-5 py-5' : 'px-8 py-6'

  return (
    <div className={layoutClasses}>
      {isAuthenticated && <Sidebar />}
      {/* Ajuste: margem esquerda igual à largura da sidebar (w-56) */}
      <div className={isAuthenticated ? 'ml-56 min-h-screen' : 'min-h-screen'}>
        <div className={`container mx-auto ${containerSpacing}`}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<RequireAuth />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pacientes" element={<PacientesList />} />
              <Route path="/pacientes/new" element={<PacienteCreate />} />
              <Route path="/pacientes/:id" element={<PacienteDetail />} />
              <Route path="/pacientes/:id/edit" element={<PacienteEdit />} />
              <Route path="/profile" element={<div style={{ color: 'var(--text-color)' }}>Profile (Em construção)</div>} />
              <Route path="/sales-report" element={<div style={{ color: 'var(--text-color)' }}>Sales Report (Em construção)</div>} />
              <Route path="/message" element={<div style={{ color: 'var(--text-color)' }}>Message (Em construção)</div>} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<div style={{ color: 'var(--text-color)' }}>404 - Página não encontrada</div>} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </SettingsProvider>
  )
}

const root = createRoot(document.getElementById('root'))
root.render(<App />)
