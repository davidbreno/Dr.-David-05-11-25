import React, { useState } from 'react'

export default function ProdutoForm({ initial = {}, onSubmit, submitLabel='Salvar' }) {
  const [form, setForm] = useState({
    nome: initial.nome || '',
    sku: initial.sku || '',
    quantidade: initial.quantidade || 0,
    custo: initial.custo || 0,
    preco: initial.preco || 0,
    unidade: initial.unidade || 'un',
  })
  async function handle(e){ e.preventDefault(); await onSubmit(form) }
  return (
    <form onSubmit={handle} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="mb-1 block text-sm">Nome</label>
          <input className="input" value={form.nome} onChange={(e)=>setForm(s=>({...s, nome:e.target.value}))} /></div>
        <div><label className="mb-1 block text-sm">SKU</label>
          <input className="input" value={form.sku} onChange={(e)=>setForm(s=>({...s, sku:e.target.value}))} /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div><label className="mb-1 block text-sm">Quantidade</label>
          <input className="input" type="number" value={form.quantidade} onChange={(e)=>setForm(s=>({...s, quantidade:e.target.valueAsNumber}))} /></div>
        <div><label className="mb-1 block text-sm">Custo</label>
          <input className="input" type="number" step="0.01" value={form.custo} onChange={(e)=>setForm(s=>({...s, custo:e.target.value}))} /></div>
        <div><label className="mb-1 block text-sm">Preço</label>
          <input className="input" type="number" step="0.01" value={form.preco} onChange={(e)=>setForm(s=>({...s, preco:e.target.value}))} /></div>
      </div>
      <div><label className="mb-1 block text-sm">Unidade</label>
        <input className="input" value={form.unidade} onChange={(e)=>setForm(s=>({...s, unidade:e.target.value}))} /></div>
      <button className="btn btn-primary">{submitLabel}</button>
    </form>
  )
}
