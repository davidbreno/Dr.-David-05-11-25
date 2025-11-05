import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'

export default function OdontogramasList(){
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const nav = useNavigate()

  async function load(){
    setLoading(true); setError('')
    try{
      const url = q ? `/odontogramas/?search=${encodeURIComponent(q)}` : '/odontogramas/'
      const { data } = await api.get(url)
      setItems(data.results ?? data)
    }catch{ setError('Falha ao carregar') }finally{ setLoading(false) }
  }
  async function handleDelete(id){ if(!confirm('Excluir?')) return; await api.delete(`/odontogramas/${id}/`); await load() }

  useEffect(()=>{ load() }, [])

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="page-title">🦷 Odontogramas</h1>
        <Link to="/odontogramas/new" className="btn btn-primary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Odontograma
        </Link>
      </div>
      
      <div className="card">
        <div className="flex items-center gap-3">
          <input 
            className="input flex-1" 
            placeholder="🔍 Buscar por paciente ou anotações..." 
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
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">⚠️ {error}</span>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it)=>(
          <div key={it.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                #{it.id}
              </div>
              <svg className="w-10 h-10 text-blue-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-gray-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm">Paciente ID: <strong className="text-white">{it.paciente}</strong></span>
              </div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-gray-700">
              <Link to={`/odontogramas/${it.id}/edit`} className="btn btn-primary flex-1 text-sm py-2">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </Link>
              <button onClick={()=>handleDelete(it.id)} className="btn btn-danger text-sm py-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && items.length===0 && (
        <div className="col-span-full card text-center py-12 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg mb-2">Nenhum odontograma encontrado</p>
          <p className="text-sm mb-4">Comece criando seu primeiro odontograma</p>
          <Link to="/odontogramas/new" className="btn btn-primary inline-flex">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Criar Novo Odontograma
          </Link>
        </div>
      )}
    </div>
  )
}
