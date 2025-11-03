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
    <div className="space-y-6">
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
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {error && (
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it)=>(
          <div key={it.id} className="card group hover:scale-105">
            <div className="flex items-start justify-between mb-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                #{it.id}
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-gray-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Paciente ID: <strong>{it.paciente}</strong></span>
              </div>
            </div>
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <Link to={`/odontogramas/${it.id}/edit`} className="btn btn-primary flex-1 text-sm">
                Editar
              </Link>
              <button onClick={()=>handleDelete(it.id)} className="btn btn-danger flex-1 text-sm">
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && items.length===0 && (
        <div className="card text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 text-lg mb-2">Nenhum odontograma encontrado</p>
          <p className="text-gray-400 text-sm mb-4">Comece criando seu primeiro odontograma</p>
          <Link to="/odontogramas/new" className="btn btn-primary inline-flex">
            Criar Novo Odontograma
          </Link>
        </div>
      )}
    </div>
  )
}
