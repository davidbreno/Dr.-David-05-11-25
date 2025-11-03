import React, { useState } from 'react'

export default function PacienteForm({ initial = {}, onSubmit, submitLabel='Salvar' }) {
  const [form, setForm] = useState({
    nome: initial.nome || '',
    cpf: initial.cpf || '',
    email: initial.email || '',
    telefone: initial.telefone || '',
    endereco: initial.endereco || '',
    observacoes: initial.observacoes || '',
  })
  const [err, setErr] = useState('')

  async function handle(e){
    e.preventDefault()
    setErr('')
    if(!form.nome || !form.cpf){ setErr('Nome e CPF são obrigatórios'); return }
    await onSubmit(form)
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      <div><label className="mb-1 block text-sm">Nome</label>
        <input className="input" value={form.nome} onChange={(e)=>setForm(f=>({...f, nome:e.target.value}))}/></div>
      <div><label className="mb-1 block text-sm">CPF</label>
        <input className="input" value={form.cpf} onChange={(e)=>setForm(f=>({...f, cpf:e.target.value}))}/></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="mb-1 block text-sm">E-mail</label>
          <input className="input" value={form.email} onChange={(e)=>setForm(f=>({...f, email:e.target.value}))}/></div>
        <div><label className="mb-1 block text-sm">Telefone</label>
          <input className="input" value={form.telefone} onChange={(e)=>setForm(f=>({...f, telefone:e.target.value}))}/></div>
      </div>
      <div><label className="mb-1 block text-sm">Endereço</label>
        <textarea className="input" rows="2" value={form.endereco} onChange={(e)=>setForm(f=>({...f, endereco:e.target.value}))}/></div>
      <div><label className="mb-1 block text-sm">Observações</label>
        <textarea className="input" rows="3" value={form.observacoes} onChange={(e)=>setForm(f=>({...f, observacoes:e.target.value}))}/></div>
      {err && <div className="text-sm text-red-600">{err}</div>}
      <button className="btn btn-primary">{submitLabel}</button>
    </form>
  )
}
