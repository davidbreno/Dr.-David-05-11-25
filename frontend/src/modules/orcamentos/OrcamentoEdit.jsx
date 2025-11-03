import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import OrcamentoForm from './OrcamentoForm.jsx'

export default function OrcamentoEdit(){
  const nav = useNavigate(); const { id } = useParams()
  const [loading, setLoading] = useState(true); const [data, setData] = useState(null)
  useEffect(()=>{(async()=>{ const { data } = await api.get('/orcamentos/'+id+'/'); setData(data); setLoading(false) })()}, [id])
  async function onSubmit(form){ await api.patch('/orcamentos/'+id+'/', form); nav('/orcamentos') }
  if(loading) return <div>Carregando...</div>
  return (<div className="mx-auto max-w-2xl"><div className="card"><h1 className="mb-4 text-2xl font-semibold">Editar Orçamento</h1><OrcamentoForm initial={data} onSubmit={onSubmit} submitLabel="Salvar" /></div></div>)
}
