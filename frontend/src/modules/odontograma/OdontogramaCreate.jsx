import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import OdontogramaForm from './OdontogramaForm.jsx'

export default function OdontogramaCreate(){
  const nav = useNavigate()
  async function onSubmit(form){ await api.post('/odontogramas/', form); nav('/odontogramas') }
  return (<div className="mx-auto max-w-2xl"><div className="card"><h1 className="mb-4 text-2xl font-semibold">Novo Odontograma</h1><OdontogramaForm onSubmit={onSubmit} submitLabel="Criar" /></div></div>)
}
