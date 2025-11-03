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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pacientes</h1>
        <Link to="/pacientes/new" className="btn btn-primary">Novo</Link>
      </div>
      <div className="flex items-center gap-2">
        <input className="input" placeholder="Buscar por nome, CPF, e-mail..." value={q} onChange={(e)=>setQ(e.target.value)} />
        <button className="btn btn-primary" onClick={load}>Buscar</button>
      </div>

      {loading && <div>Carregando...</div>}
      {error && <div className="text-red-600">{error}</div>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <div key={p.id ?? p.cpf} className="card">
            <div className="mb-2 text-lg font-semibold">{p.nome}</div>
            <div className="text-sm text-gray-600">{p.email || 'sem e-mail'}</div>
            <div className="text-sm text-gray-600">{p.telefone || 'sem telefone'}</div>
            <div className="mt-3 flex gap-2">
              <Link to={`/pacientes/${p.id}/edit`} className="btn btn-primary">Editar</Link>
              <button onClick={()=>handleDelete(p.id)} className="btn">Excluir</button>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && <div>Nenhum paciente encontrado.</div>}
      </div>
    </div>
  )
}
