import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './modules/auth/AuthProvider.jsx'
import RequireAuth from './modules/auth/RequireAuth.jsx'
import Login from './modules/auth/Login.jsx'
import NavBar from './modules/layout/NavBar.jsx'

import PacientesList from './modules/pacientes/PacientesList.jsx'
import PacienteCreate from './modules/pacientes/PacienteCreate.jsx'
import PacienteEdit from './modules/pacientes/PacienteEdit.jsx'

import OrcamentosList from './modules/orcamentos/OrcamentosList.jsx'
import OrcamentoCreate from './modules/orcamentos/OrcamentoCreate.jsx'
import OrcamentoEdit from './modules/orcamentos/OrcamentoEdit.jsx'

import OdontogramasList from './modules/odontograma/OdontogramasList.jsx'
import OdontogramaCreate from './modules/odontograma/OdontogramaCreate.jsx'
import OdontogramaEdit from './modules/odontograma/OdontogramaEdit.jsx'

import LancamentosList from './modules/financeiro/LancamentosList.jsx'
import LancamentoCreate from './modules/financeiro/LancamentoCreate.jsx'
import LancamentoEdit from './modules/financeiro/LancamentoEdit.jsx'

import ProdutosList from './modules/estoque/ProdutosList.jsx'
import ProdutoCreate from './modules/estoque/ProdutoCreate.jsx'
import ProdutoEdit from './modules/estoque/ProdutoEdit.jsx'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen">
          <NavBar />
          <div className="container mx-auto px-4 py-6">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/pacientes" replace />} />
              <Route element={<RequireAuth />}>
                <Route path="/pacientes" element={<PacientesList />} />
                <Route path="/pacientes/new" element={<PacienteCreate />} />
                <Route path="/pacientes/:id/edit" element={<PacienteEdit />} />

                <Route path="/orcamentos" element={<OrcamentosList />} />
                <Route path="/orcamentos/new" element={<OrcamentoCreate />} />
                <Route path="/orcamentos/:id/edit" element={<OrcamentoEdit />} />

                <Route path="/odontogramas" element={<OdontogramasList />} />
                <Route path="/odontogramas/new" element={<OdontogramaCreate />} />
                <Route path="/odontogramas/:id/edit" element={<OdontogramaEdit />} />

                <Route path="/lancamentos" element={<LancamentosList />} />
                <Route path="/lancamentos/new" element={<LancamentoCreate />} />
                <Route path="/lancamentos/:id/edit" element={<LancamentoEdit />} />

                <Route path="/produtos" element={<ProdutosList />} />
                <Route path="/produtos/new" element={<ProdutoCreate />} />
                <Route path="/produtos/:id/edit" element={<ProdutoEdit />} />
              </Route>
              <Route path="*" element={<div>404</div>} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

const root = createRoot(document.getElementById('root'))
root.render(<App />)
