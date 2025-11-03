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

  useEffect(()=>{ load() }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Orçamentos</h1>
        <Link to="/orcamentos/new" className="btn btn-primary">Novo</Link>
      </div>
      <div className="flex items-center gap-2">
        <input className="input" placeholder="Buscar" value={q} onChange={(e)=>setQ(e.target.value)} />
        <button className="btn btn-primary" onClick={load}>Buscar</button>
      </div>
      {loading && <div>Carregando...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it)=>(
          <div key={it.id} className="card">
            <div className="mb-2 text-lg font-semibold">#{it.id} • {it.status}</div>
            <div className="text-sm text-gray-600">Paciente ID: {it.paciente}</div>
            <div className="text-sm text-gray-600">Valor: R$ {it.valor_total}</div>
            <div className="mt-3 flex gap-2">
              <Link to={`/orcamentos/${it.id}/edit`} className="btn btn-primary">Editar</Link>
              <button onClick={()=>handleDelete(it.id)} className="btn">Excluir</button>
            </div>
          </div>
        ))}
        {!loading && items.length===0 && <div>Nenhum registro.</div>}
      </div>
    </div>
  )
}
