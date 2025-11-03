import React, { useState } from 'react'

export default function OdontogramaForm({ initial = {}, onSubmit, submitLabel='Salvar' }) {
  const [form, setForm] = useState({
    paciente: initial.paciente || '',
    anotacoes: initial.anotacoes || '',
    mapa: initial.mapa ? JSON.stringify(initial.mapa, null, 2) : '{}',
  })
  const [err, setErr] = useState('')

  async function handle(e){
    e.preventDefault(); setErr('')
    let payload = { ...form }
    try { payload.mapa = JSON.parse(form.mapa) } catch { setErr('JSON inválido em "mapa"'); return }
    await onSubmit(payload)
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      <div><label className="mb-1 block text-sm">Paciente (ID)</label>
        <input className="input" value={form.paciente} onChange={(e)=>setForm(s=>({...s, paciente:e.target.value}))}/></div>
      <div><label className="mb-1 block text-sm">Anotações</label>
        <textarea className="input" rows="3" value={form.anotacoes} onChange={(e)=>setForm(s=>({...s, anotacoes:e.target.value}))}/></div>
      <div><label className="mb-1 block text-sm">Mapa (JSON)</label>
        <textarea className="input font-mono text-xs" rows="8" value={form.mapa} onChange={(e)=>setForm(s=>({...s, mapa:e.target.value}))}/></div>
      {err && <div className="text-sm text-red-600">{err}</div>}
      <button className="btn btn-primary">{submitLabel}</button>
    </form>
  )
}
