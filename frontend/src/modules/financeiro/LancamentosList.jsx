import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'

export default function LancamentosList(){
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  async function load(){
    setLoading(true)
    const url = q ? `/lancamentos/?search=${encodeURIComponent(q)}` : '/lancamentos/'
    const { data } = await api.get(url)
    setItems(data.results ?? data); setLoading(false)
  }
  async function del(id){ if(!confirm('Excluir?')) return; await api.delete(`/lancamentos/${id}/`); await load() }
  useEffect(()=>{ load() }, [])

  const getTipoColor = (tipo) => {
    return tipo?.toLowerCase() === 'receita' 
      ? 'text-green-400' 
      : 'text-red-400'
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="page-title">💰 Financeiro</h1>
        <Link to="/lancamentos/new" className="btn btn-primary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Lançamento
        </Link>
      </div>
      
      <div className="card">
        <div className="flex items-center gap-3">
          <input 
            className="input flex-1" 
            placeholder="🔍 Buscar lançamentos..." 
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(it => (
          <div key={it.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <span className="text-xs text-gray-500 uppercase font-semibold">{it.tipo}</span>
                <div className={`text-2xl font-bold ${getTipoColor(it.tipo)} mb-2`}>
                  R$ {it.valor}
                </div>
                <div className="text-sm text-gray-400">{it.categoria}</div>
              </div>
              <svg className="w-10 h-10 text-blue-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <div className="space-y-1 mb-4 text-sm">
              <div className="text-gray-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {it.data}
              </div>
              <div className={`font-semibold ${it.status === 'pago' ? 'text-green-400' : 'text-yellow-400'}`}>
                {it.status === 'pago' ? '✓ Pago' : '⏳ Pendente'}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link to={`/lancamentos/${it.id}/edit`} className="btn btn-primary flex-1 text-sm py-2">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </Link>
              <button className="btn btn-danger text-sm py-2" onClick={() => del(it.id)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && (
          <div className="col-span-full card text-center py-12 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg">Nenhum lançamento encontrado</p>
            <p className="text-sm mt-2">Adicione um novo lançamento para começar</p>
          </div>
        )}
      </div>
    </div>
  )
}
