import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import PacienteForm from './PacienteForm.jsx'

export default function PacienteCreate(){
  const nav = useNavigate()
  async function onSubmit(form){
    await api.post('/pacientes/', form)
    nav('/pacientes')
  }
  return (
    <div className="mx-auto max-w-2xl animate-fadeIn">
      <div className="mb-6">
        <button onClick={() => nav('/pacientes')} className="text-gray-400 hover:text-white flex items-center gap-2 mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar
        </button>
        <h1 className="page-title">➕ Novo Paciente</h1>
      </div>
      <div className="card">
        <PacienteForm onSubmit={onSubmit} submitLabel="Criar Paciente"/>
      </div>
    </div>
  )
}
