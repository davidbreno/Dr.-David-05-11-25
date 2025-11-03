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

  return (<div className="space-y-4">
    <div className="flex items-center justify-between"><h1 className="text-xl font-semibold">Financeiro</h1><Link to="/lancamentos/new" className="btn btn-primary">Novo</Link></div>
    <div className="flex items-center gap-2"><input className="input" value={q} onChange={(e)=>setQ(e.target.value)} /><button className="btn btn-primary" onClick={load}>Buscar</button></div>
    {loading && <div>Carregando...</div>}
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(it=>(<div key={it.id} className="card">
        <div className="mb-2 text-lg font-semibold">{it.tipo} • R$ {it.valor}</div>
        <div className="text-sm text-gray-600">{it.categoria} • {it.data} • {it.status}</div>
        <div className="mt-3 flex gap-2"><Link to={`/lancamentos/${it.id}/edit`} className="btn btn-primary">Editar</Link><button className="btn" onClick={()=>del(it.id)}>Excluir</button></div>
      </div>))}
    </div>
  </div>)
}
