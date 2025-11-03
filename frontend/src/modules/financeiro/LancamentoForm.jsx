import React, { useState } from 'react'

export default function LancamentoForm({ initial = {}, onSubmit, submitLabel='Salvar' }) {
  const [form, setForm] = useState({
    tipo: initial.tipo || 'receita',
    categoria: initial.categoria || '',
    paciente: initial.paciente || '',
    valor: initial.valor || '',
    data: initial.data || '',
    status: initial.status || 'pendente',
    descricao: initial.descricao || ''
  })
  const [err, setErr] = useState('')
  async function handle(e){ e.preventDefault(); setErr(''); await onSubmit(form) }
  return (
    <form onSubmit={handle} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="mb-1 block text-sm">Tipo</label>
          <select className="input" value={form.tipo} onChange={(e)=>setForm(s=>({...s, tipo:e.target.value}))}>
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </select></div>
        <div><label className="mb-1 block text-sm">Status</label>
          <select className="input" value={form.status} onChange={(e)=>setForm(s=>({...s, status:e.target.value}))}>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
          </select></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="mb-1 block text-sm">Categoria</label>
          <input className="input" value={form.categoria} onChange={(e)=>setForm(s=>({...s, categoria:e.target.value}))} /></div>
        <div><label className="mb-1 block text-sm">Paciente (ID opcional)</label>
          <input className="input" value={form.paciente} onChange={(e)=>setForm(s=>({...s, paciente:e.target.value}))} /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="mb-1 block text-sm">Valor</label>
          <input className="input" type="number" step="0.01" value={form.valor} onChange={(e)=>setForm(s=>({...s, valor:e.target.value}))} /></div>
        <div><label className="mb-1 block text-sm">Data</label>
          <input className="input" type="date" value={form.data} onChange={(e)=>setForm(s=>({...s, data:e.target.value}))} /></div>
      </div>
      <div><label className="mb-1 block text-sm">Descrição</label>
        <textarea className="input" rows="3" value={form.descricao} onChange={(e)=>setForm(s=>({...s, descricao:e.target.value}))} /></div>
      {err && <div className="text-sm text-red-600">{err}</div>}
      <button className="btn btn-primary">{submitLabel}</button>
    </form>
  )
}
