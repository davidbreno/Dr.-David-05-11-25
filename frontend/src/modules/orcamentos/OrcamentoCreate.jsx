import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import OrcamentoForm from './OrcamentoForm.jsx'

export default function OrcamentoCreate(){
  const nav = useNavigate()
  async function onSubmit(form){ await api.post('/orcamentos/', form); nav('/orcamentos') }
  return (<div className="mx-auto max-w-2xl"><div className="card"><h1 className="mb-4 text-2xl font-semibold">Novo Orçamento</h1><OrcamentoForm onSubmit={onSubmit} submitLabel="Criar" /></div></div>)
}
