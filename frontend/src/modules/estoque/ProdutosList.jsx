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

  return (<div className="space-y-4">
    <div className="flex items-center justify-between"><h1 className="text-xl font-semibold">Estoque</h1><Link to="/produtos/new" className="btn btn-primary">Novo</Link></div>
    <div className="flex items-center gap-2"><input className="input" value={q} onChange={(e)=>setQ(e.target.value)} /><button className="btn btn-primary" onClick={load}>Buscar</button></div>
    {loading && <div>Carregando...</div>}
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(it=>(<div key={it.id} className="card"><div className="mb-2 text-lg font-semibold">{it.nome}</div><div className="text-sm text-gray-600">{it.sku} • {it.quantidade} un • R$ {it.preco}</div><div className="mt-3 flex gap-2"><Link to={`/produtos/${it.id}/edit`} className="btn btn-primary">Editar</Link><button className="btn" onClick={()=>del(it.id)}>Excluir</button></div></div>))}
    </div>
  </div>)
}
