import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'

export default function OrcamentosList(){
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const nav = useNavigate()

  async function load(){
    setLoading(true); setError('')
    try{
      const url = q ? `/orcamentos/?search=${encodeURIComponent(q)}` : '/orcamentos/'
      const { data } = await api.get(url)
      setItems(data.results ?? data)
    }catch{ setError('Falha ao carregar') }finally{ setLoading(false) }
  }
  async function handleDelete(id){ if(!confirm('Excluir?')) return; await api.delete(`/orcamentos/${id}/`); await load() }

  async function handleApprove(id){
    await api.post(`/orcamentos/${id}/aprovar/`)
    await load()
  }
  async function handleReject(id){
    await api.post(`/orcamentos/${id}/reprovar/`)
    await load()
  }
  function handlePdf(id){
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'
    const url = `${API_BASE}/api/orcamentos/${id}/pdf/raw/`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  useEffect(()=>{ load() }, [])

  const getStatusColor = (status) => {
    const colors = {
      'pendente': 'bg-yellow-900/30 text-yellow-300 border-yellow-500/50',
      'aprovado': 'bg-green-900/30 text-green-300 border-green-500/50',
      'rejeitado': 'bg-red-900/30 text-red-300 border-red-500/50',
      'concluido': 'bg-blue-900/30 text-blue-300 border-blue-500/50'
    }
    return colors[status?.toLowerCase()] || 'bg-gray-900/30 text-gray-300 border-gray-500/50'
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="page-title">💼 Orçamentos</h1>
        <Link to="/orcamentos/new" className="btn btn-primary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Orçamento
        </Link>
      </div>
      
      <div className="card">
        <div className="flex items-center gap-3">
          <input 
            className="input flex-1" 
            placeholder="🔍 Buscar orçamentos..." 
            value={q} 
            onChange={(e)=>setQ(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && load()}
          />
          <button className="btn btn-primary" onClick={load}>Buscar</button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="spinner"></div>
        </div>
      )}
      
      {error && (
        <div className="card bg-red-900/20 border-red-500/50 text-red-300">
          ⚠️ {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it)=>(
          <div key={it.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="text-2xl font-bold text-blue-400 mb-2">#{it.id}</div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(it.status)}`}>
                  {it.status?.toUpperCase() || 'INDEFINIDO'}
                </span>
              </div>
              <svg className="w-10 h-10 text-blue-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Paciente ID: <span className="text-white font-semibold">{it.paciente}</span>
              </div>
              <div className="text-lg text-green-400 font-bold flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                R$ {it.valor_total}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Link to={`/orcamentos/${it.id}/edit`} className="btn btn-primary flex-1 text-sm py-2">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </Link>
              <button onClick={()=>handleApprove(it.id)} className="btn btn-success text-sm py-2">
                ✅ Aprovar
              </button>
              <button onClick={()=>handleReject(it.id)} className="btn btn-warning text-sm py-2">
                🚫 Reprovar
              </button>
              <button onClick={()=>handlePdf(it.id)} className="btn btn-secondary text-sm py-2">
                📄 PDF
              </button>
              <button onClick={()=>handleDelete(it.id)} className="btn btn-danger text-sm py-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
        {!loading && items.length===0 && (
          <div className="col-span-full card text-center py-12 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg">Nenhum orçamento encontrado</p>
            <p className="text-sm mt-2">Crie um novo orçamento para começar</p>
          </div>
        )}
      </div>
    </div>
  )
}
