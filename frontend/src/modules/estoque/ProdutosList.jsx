import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'

export default function ProdutosList(){
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  async function load(){
    setLoading(true)
    const url = q ? `/produtos/?search=${encodeURIComponent(q)}` : '/produtos/'
    const { data } = await api.get(url)
    setItems(data.results ?? data); setLoading(false)
  }
  async function del(id){ if(!confirm('Excluir?')) return; await api.delete(`/produtos/${id}/`); await load() }
  useEffect(()=>{ load() }, [])

  const getEstoqueColor = (quantidade) => {
    if (quantidade === 0) return 'text-red-400'
    if (quantidade < 10) return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="page-title">📦 Estoque</h1>
        <Link to="/produtos/new" className="btn btn-primary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Produto
        </Link>
      </div>
      
      <div className="card">
        <div className="flex items-center gap-3">
          <input 
            className="input flex-1" 
            placeholder="🔍 Buscar produtos..." 
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
                <div className="text-xl font-bold text-white mb-2">{it.nome}</div>
                <div className="text-xs text-gray-500 font-mono">{it.sku}</div>
              </div>
              <div className="bg-purple-600/20 text-purple-400 rounded-full w-12 h-12 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className={`text-lg font-bold ${getEstoqueColor(it.quantidade)} flex items-center gap-2`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {it.quantidade} {it.quantidade === 1 ? 'unidade' : 'unidades'}
              </div>
              <div className="text-lg text-blue-400 font-semibold">
                R$ {it.preco}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link to={`/produtos/${it.id}/edit`} className="btn btn-primary flex-1 text-sm py-2">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-lg">Nenhum produto no estoque</p>
            <p className="text-sm mt-2">Adicione produtos para gerenciar seu estoque</p>
          </div>
        )}
      </div>
    </div>
  )
}
