import React, { useState } from 'react'

export default function OrcamentoForm({ initial = {}, onSubmit, submitLabel='Salvar' }){
  const [form, setForm] = useState({
    paciente: initial.paciente || '',
    descricao: initial.descricao || '',
    valor_total: initial.valor_total || '',
    status: initial.status || 'rascunho',
  })
  async function handle(e){ e.preventDefault(); await onSubmit(form) }
  return (
    <form onSubmit={handle} className="space-y-4">
      <div><label className="mb-1 block text-sm">Paciente (ID)</label>
        <input className="input" value={form.paciente} onChange={(e)=>setForm(s=>({...s, paciente:e.target.value}))} /></div>
      <div><label className="mb-1 block text-sm">Descrição</label>
        <input className="input" value={form.descricao} onChange={(e)=>setForm(s=>({...s, descricao:e.target.value}))} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="mb-1 block text-sm">Valor total</label>
          <input className="input" type="number" step="0.01" value={form.valor_total} onChange={(e)=>setForm(s=>({...s, valor_total:e.target.value}))} /></div>
        <div><label className="mb-1 block text-sm">Status</label>
          <select className="input" value={form.status} onChange={(e)=>setForm(s=>({...s, status:e.target.value}))}>
            <option value="rascunho">Rascunho</option>
            <option value="aprovado">Aprovado</option>
            <option value="reprovado">Reprovado</option>
          </select></div>
      </div>
      <button className="btn btn-primary">{submitLabel}</button>
    </form>
  )
}
