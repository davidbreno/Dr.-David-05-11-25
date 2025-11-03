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
    <div className="mx-auto max-w-2xl">
      <div className="card">
        <h1 className="mb-4 text-2xl font-semibold">Novo Paciente</h1>
        <PacienteForm onSubmit={onSubmit} submitLabel="Criar"/>
      </div>
    </div>
  )
}
