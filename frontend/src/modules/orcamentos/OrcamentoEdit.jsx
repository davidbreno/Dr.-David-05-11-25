import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import OrcamentoForm from './OrcamentoForm.jsx'

export default function OrcamentoEdit(){
  const nav = useNavigate(); const { id } = useParams()
  const [loading, setLoading] = useState(true); const [data, setData] = useState(null)

  useEffect(()=>{
    (async()=>{
      const { data } = await api.get('/orcamentos/'+id+'/');
      setData(data); setLoading(false)
    })()
  }, [id])

  async function onSubmit(form){
    const payload = { ...form }
    await api.patch('/orcamentos/'+id+'/', payload)
    nav('/orcamentos')
  }

  function openPdf(){
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'
    window.open(`${API_BASE}/api/orcamentos/${id}/pdf/raw/`, '_blank', 'noopener,noreferrer')
  }

  if(loading) return <div className="card"><div className="p-6 text-gray-300">Carregando...</div></div>

  return (
    <div className="mx-auto max-w-3xl">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Editar Orçamento #{id}</h1>
          <div className="flex gap-2">
            <button onClick={()=>nav('/orcamentos')} className="btn">Voltar</button>
            <button onClick={openPdf} className="btn btn-secondary">📄 PDF</button>
          </div>
        </div>
        <OrcamentoForm initial={data} onSubmit={onSubmit} submitLabel="Salvar" />
      </div>
    </div>
  )
}
