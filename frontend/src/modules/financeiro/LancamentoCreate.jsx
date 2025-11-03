import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import LancamentoForm from './LancamentoForm.jsx'

export default function LancamentoCreate(){
  const nav = useNavigate()
  async function onSubmit(form){ await api.post('/lancamentos/', form); nav('/lancamentos') }
  return (<div className="mx-auto max-w-2xl"><div className="card"><h1 className="mb-4 text-2xl font-semibold">Novo Lançamento</h1><LancamentoForm onSubmit={onSubmit} submitLabel="Criar" /></div></div>)
}
