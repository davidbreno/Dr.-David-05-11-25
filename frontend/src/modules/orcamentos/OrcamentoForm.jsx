import React, { useState, useMemo } from 'react'
import { proceduresCatalog, filterProcedures } from './proceduresCatalog.js'

export default function OrcamentoForm({ initial = {}, onSubmit, submitLabel='Salvar' }){
  const [form, setForm] = useState({
    paciente: initial.paciente || '',
    descricao: initial.descricao || '',
    valor_total: initial.valor_total || '',
    status: initial.status || 'rascunho',
  })
  const [items, setItems] = useState(initial.itens || [])
  const [search, setSearch] = useState('')

  // Recalcula total automaticamente a partir dos itens
  const computedTotal = useMemo(()=>{
    if(!items.length) return form.valor_total || 0
    return items.reduce((acc, it)=> acc + (parseFloat(it.valor)||0), 0).toFixed(2)
  }, [items, form.valor_total])

  function addProcedure(p){
    // Evita duplicar exatamente o mesmo procedimento sem editar valor
    setItems(list=> [...list, { procedimento: p.name, dente: '', valor: p.defaultValue }])
  }
  function findItemIndexByName(name){
    return items.findIndex(it => it.procedimento === name)
  }
  function toggleProcedure(p){
    const idx = findItemIndexByName(p.name)
    if (idx >= 0) {
      // desmarca: remove primeira ocorrência
      removeItem(idx)
    } else {
      addProcedure(p)
    }
  }
  function isSelected(name){
    return items.some(it => it.procedimento === name)
  }
  function updateItem(idx, patch){
    setItems(list => list.map((it,i)=> i===idx ? {...it, ...patch} : it))
  }
  function removeItem(idx){ setItems(list => list.filter((_,i)=> i!==idx)) }

  async function handle(e){
    e.preventDefault()
    // Sanitiza dente: '' -> null, string numerica -> int
    const itensSan = items.map(it => ({
      ...it,
      dente: (it.dente === '' || it.dente === undefined || it.dente === null)
        ? null
        : parseInt(it.dente, 10),
    }))
    const payload = { ...form, itens: itensSan, valor_total: computedTotal }
    await onSubmit(payload)
  }

  const filtered = filterProcedures(search)
  return (
    <form onSubmit={handle} className="space-y-6">
      <div><label className="mb-1 block text-sm">Paciente (ID)</label>
        <input className="input" value={form.paciente} onChange={(e)=>setForm(s=>({...s, paciente:e.target.value}))} /></div>
      <div><label className="mb-1 block text-sm">Descrição</label>
        <input className="input" value={form.descricao} onChange={(e)=>setForm(s=>({...s, descricao:e.target.value}))} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="mb-1 block text-sm">Valor total</label>
          <input className="input" type="number" step="0.01" value={form.valor_total} onChange={(e)=>setForm(s=>({...s, valor_total:e.target.value}))} />
          {items.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">Total calculado pelos itens: <span className="text-green-400 font-semibold">R$ {computedTotal}</span></p>
          )}
        </div>
        <div><label className="mb-1 block text-sm">Status</label>
          <select className="input" value={form.status} onChange={(e)=>setForm(s=>({...s, status:e.target.value}))}>
            <option value="rascunho">Rascunho</option>
            <option value="aprovado">Aprovado</option>
            <option value="reprovado">Reprovado</option>
          </select></div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold">Procedimentos</label>
        <div className="flex gap-2 items-center">
          <input
            className="input flex-1"
            placeholder="Buscar procedimento..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
          />
          <button type="button" className="btn" onClick={()=>setSearch('')}>Limpar</button>
        </div>
        {/* Barrinha de seleção com chips/checkboxes */}
        <div className="max-h-56 overflow-auto rounded border border-gray-700/50 p-2 flex flex-wrap gap-2 bg-gray-900/40">
          {filtered.map(p => (
            <label
              key={p.id}
              className="px-3 py-1.5 rounded-full bg-gray-800/60 hover:bg-gray-700/60 text-xs sm:text-sm flex items-center gap-2 cursor-pointer border border-gray-700/50"
            >
              <input
                type="checkbox"
                className="accent-green-500"
                checked={isSelected(p.name)}
                onChange={()=>toggleProcedure(p)}
              />
              <span className="truncate max-w-[16rem]">{p.name}</span>
              <span className="text-[10px] text-gray-400">R$ {p.defaultValue}</span>
            </label>
          ))}
          {filtered.length === 0 && (
            <div className="text-xs text-gray-400">Nenhum procedimento encontrado.</div>
          )}
        </div>
        {/* Linha de ações rápidas */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>
            Selecionados: <span className="text-white font-semibold">{items.length}</span>
          </span>
          <div className="flex gap-2">
            <button type="button" className="btn btn-secondary !py-1 !text-xs" onClick={()=>setItems([])}>Limpar seleção</button>
          </div>
        </div>
      </div>

      {items.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Itens selecionados</h3>
            <span className="text-xs text-gray-400">{items.length} procedimento(s)</span>
          </div>
          <div className="overflow-auto rounded border border-gray-700/50">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-800/60 text-gray-300">
                <tr>
                  <th className="px-3 py-2 text-left">Procedimento</th>
                  <th className="px-3 py-2 text-left">Dente</th>
                  <th className="px-3 py-2 text-left">Valor (R$)</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {items.map((it, idx)=>(
                  <tr key={idx}>
                    <td className="px-3 py-1">
                      <input
                        className="input !p-1 text-xs"
                        value={it.procedimento}
                        onChange={(e)=>updateItem(idx,{procedimento:e.target.value})}
                      />
                    </td>
                    <td className="px-3 py-1 w-28">
                      <input
                        className="input !p-1 text-xs"
                        value={it.dente ?? ''}
                        placeholder="Ex: 18"
                        onChange={(e)=>updateItem(idx,{dente:e.target.value})}
                      />
                    </td>
                    <td className="px-3 py-1 w-28">
                      <input
                        type="number"
                        step="0.01"
                        className="input !p-1 text-xs"
                        value={it.valor}
                        onChange={(e)=>updateItem(idx,{valor:e.target.value})}
                      />
                    </td>
                    <td className="px-3 py-1 text-right">
                      <button type="button" className="btn btn-secondary !text-xs" onClick={()=>removeItem(idx)}>Remover</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400">Total calculado: <span className="text-green-400 font-semibold">R$ {computedTotal}</span></p>
        </div>
      )}
      <button className="btn btn-primary">{submitLabel}</button>
    </form>
  )
}
