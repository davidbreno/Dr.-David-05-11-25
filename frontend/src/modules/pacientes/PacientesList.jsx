import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'

export default function PacientesList() {
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const nav = useNavigate()
  async function handleDelete(id){ if(!confirm('Excluir paciente?')) return; await api.delete(`/pacientes/${id}/`); await load() }

  async function load() {
    setLoading(true)
    setError('')
    try {
      const url = q ? `/pacientes/?search=${encodeURIComponent(q)}` : '/pacientes/'
      const { data } = await api.get(url)
      setItems(data.results ?? data)
    } catch (e) {
      setError('Falha ao carregar pacientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="page-title">👥 Pacientes</h1>
        <Link to="/pacientes/new" className="btn btn-primary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Paciente
        </Link>
      </div>
      
      <div className="card">
        <div className="flex items-center gap-3">
          <input 
            className="input flex-1" 
            placeholder="🔍 Buscar por nome, CPF, e-mail..." 
            value={q} 
            onChange={(e)=>setQ(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && load()} 
          />
          <button className="btn btn-primary" onClick={load}>
            Buscar
          </button>
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
        {items.map((p) => (
          <div key={p.id ?? p.cpf} className="card group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <Link to={`/pacientes/${p.id}`} className="text-xl font-bold text-white mb-1 hover:underline">
                  {p.nome}
                </Link>
                <div className="text-sm text-gray-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  {p.email || 'Sem e-mail'}
                </div>
                <div className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {p.telefone || 'Sem telefone'}
                </div>
              </div>
              <div className="bg-blue-600/20 text-blue-400 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold">
                {p.nome.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link to={`/pacientes/${p.id}/edit`} className="btn btn-primary flex-1 text-sm py-2">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </Link>
              <button onClick={()=>handleDelete(p.id)} className="btn btn-danger text-sm py-2">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-lg">Nenhum paciente encontrado</p>
            <p className="text-sm mt-2">Adicione um novo paciente para começar</p>
          </div>
        )}
      </div>
    </div>
  )
}
