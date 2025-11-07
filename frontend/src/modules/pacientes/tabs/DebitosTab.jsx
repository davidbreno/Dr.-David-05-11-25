import React, { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../../api/client.js'

const PLANOS = ['Particular', 'Convênio', 'Plano empresarial', 'Plano familiar']
const STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'parcial', label: 'Parcial' },
  { value: 'pago', label: 'Pago' },
]
const TEETH_OPTIONS = [
  '11','12','13','14','15','16','17','18',
  '21','22','23','24','25','26','27','28',
  '31','32','33','34','35','36','37','38',
  '41','42','43','44','45','46','47','48',
  'Arco superior','Arco inferior','Boca toda'
]
const currencyFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export default function DebitosTab({ pacienteId, pacienteNome }) {
  const [innerTab, setInnerTab] = useState('novo')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [msg, setMsg] = useState('')
  const [debitos, setDebitos] = useState([])
  const [statusFilter, setStatusFilter] = useState('')

  const [form, setForm] = useState({
    plano: PLANOS[0],
    data_vencimento: '',
    dentista: '',
    status: 'pendente',
    observacao: '',
  })
  const [itemDraft, setItemDraft] = useState({ procedimento: '', dente: '', valor: '' })
  const [itens, setItens] = useState([])

  const [docTargetId, setDocTargetId] = useState(null)
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const fileInputRef = useRef(null)

  const total = useMemo(() => itens.reduce((acc, it) => acc + (Number(String(it.valor).replace(',', '.')) || 0), 0), [itens])

  useEffect(() => {
    loadDebitos()
  }, [pacienteId, statusFilter])

  async function loadDebitos() {
    if (!pacienteId) return
    setLoading(true)
    setErro('')
    try {
      const params = { paciente: pacienteId, ordering: '-data_vencimento' }
      if (statusFilter) params.status = statusFilter
      const { data } = await api.get('/financeiro/debitos/', { params })
      setDebitos(Array.isArray(data.results) ? data.results : data)
    } catch (e) {
      setErro('Não foi possível carregar os débitos deste paciente.')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({ plano: PLANOS[0], data_vencimento: '', dentista: '', status: 'pendente', observacao: '' })
    setItemDraft({ procedimento: '', dente: '', valor: '' })
    setItens([])
  }

  function addItem() {
    if (!itemDraft.procedimento.trim()) {
      setErro('Informe o procedimento antes de adicionar.')
      return
    }
    if (!itemDraft.valor) {
      setErro('Informe o valor do procedimento.')
      return
    }
    const val = Number(String(itemDraft.valor).replace(',', '.'))
    if (Number.isNaN(val)) {
      setErro('Valor inválido para o procedimento.')
      return
    }
    setItens(prev => [...prev, { procedimento: itemDraft.procedimento.trim(), dentes_regiao: itemDraft.dente || '', valor: val }])
    setItemDraft({ procedimento: '', dente: '', valor: '' })
    setErro('')
  }

  function removeItem(idx) {
    setItens(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!pacienteId) return
    if (!form.data_vencimento) {
      setErro('Informe a data de vencimento do débito.')
      return
    }
    if (!form.dentista.trim()) {
      setErro('Informe o dentista responsável pelo atendimento.')
      return
    }
    if (itens.length === 0) {
      setErro('Adicione pelo menos um procedimento ao débito.')
      return
    }
    setSaving(true)
    setErro('')
    setMsg('')
    try {
      const payload = {
        paciente: pacienteId,
        plano: form.plano,
        data_vencimento: form.data_vencimento,
        dentista: form.dentista,
        status: form.status,
        observacao: form.observacao,
        itens: itens.map(it => ({ procedimento: it.procedimento, dentes_regiao: it.dentes_regiao, valor: Number(it.valor) || 0 })),
      }
      await api.post('/financeiro/debitos/', payload)
      setMsg('Débito cadastrado com sucesso.')
      resetForm()
      loadDebitos()
    } catch (err) {
      const detail = err?.response?.data ? JSON.stringify(err.response.data) : err?.message || ''
      setErro(`Não foi possível salvar o débito. ${detail}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteDebito(id) {
    if (!confirm('Deseja remover este débito?')) return
    try {
      await api.delete(`/financeiro/debitos/${id}/`)
      setDebitos(prev => prev.filter(d => d.id !== id))
      if (docTargetId === id) setDocTargetId(null)
    } catch {
      setErro('Falha ao remover o débito selecionado.')
    }
  }

  async function handleUpdateStatus(id, nextStatus) {
    try {
      const { data } = await api.patch(`/financeiro/debitos/${id}/`, { status: nextStatus })
      setDebitos(prev => prev.map(d => d.id === id ? { ...d, ...data } : d))
    } catch {
      setErro('Não foi possível atualizar o status do débito.')
    }
  }

  async function handleUploadDocumento(e) {
    const file = e.target.files?.[0]
    if (!file || !docTargetId) return
    setUploadingDoc(true)
    setErro('')
    try {
      const fd = new FormData()
      fd.append('arquivo', file)
      await api.post(`/financeiro/debitos/${docTargetId}/documentos/`, fd)
      setMsg('Comprovante anexado com sucesso.')
      loadDebitos()
    } catch (err) {
      const detail = err?.response?.data ? JSON.stringify(err.response.data) : err?.message || ''
      setErro(`Falha ao anexar comprovante. ${detail}`)
    } finally {
      setUploadingDoc(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleRemoveDocumento(debitoId, docId) {
    if (!confirm('Remover este documento?')) return
    try {
      await api.delete(`/financeiro/debitos/${debitoId}/documentos/${docId}/`)
      setMsg('Documento removido.')
      loadDebitos()
    } catch {
      setErro('Não foi possível remover o documento selecionado.')
    }
  }

  const selectedDebito = docTargetId ? debitos.find(d => d.id === docTargetId) : null

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex gap-4 border-b border-gray-800/80 mb-4">
          <button
            type="button"
            className={`px-4 py-2 text-sm ${innerTab==='novo' ? 'border-b-2 border-[#7DEDDE] text-white font-semibold' : 'text-gray-400'}`}
            onClick={() => setInnerTab('novo')}
          >
            Novo débito
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm ${innerTab==='documentos' ? 'border-b-2 border-[#7DEDDE] text-white font-semibold' : 'text-gray-400'}`}
            onClick={() => setInnerTab('documentos')}
          >
            Documentos
          </button>
        </div>

        {innerTab === 'novo' ? (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Paciente*</label>
                <input className="input" value={pacienteNome || ''} disabled />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Data de vencimento*</label>
                <input
                  className="input"
                  type="date"
                  value={form.data_vencimento}
                  onChange={e => setForm(f => ({ ...f, data_vencimento: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-1">
                <label className="block text-sm text-gray-400 mb-2">Plano*</label>
                <select
                  className="input"
                  value={form.plano}
                  onChange={e => setForm(f => ({ ...f, plano: e.target.value }))}
                >
                  {PLANOS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Procedimento*</label>
                <input
                  className={`input ${itemDraft.procedimento ? '' : 'border-red-500/50'}`}
                  placeholder="Ex.: Clareamento a laser"
                  value={itemDraft.procedimento}
                  onChange={e => setItemDraft(d => ({ ...d, procedimento: e.target.value }))}
                />
                {!itemDraft.procedimento && <p className="text-xs text-red-400 mt-1">Este campo é obrigatório</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Dentes/Região</label>
                <select
                  className="input"
                  value={itemDraft.dente}
                  onChange={e => setItemDraft(d => ({ ...d, dente: e.target.value }))}
                >
                  <option value="">Selecione…</option>
                  {TEETH_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Valor*</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={itemDraft.valor}
                  onChange={e => setItemDraft(d => ({ ...d, valor: e.target.value }))}
                  placeholder="R$ 0,00"
                />
              </div>
            </div>

            <div>
              <button type="button" className="text-[#7DEDDE] text-sm font-semibold" onClick={addItem}>
                ADICIONAR OUTRO PROCEDIMENTO
              </button>
            </div>

            {itens.length > 0 && (
              <div className="rounded-md border border-gray-800/80 divide-y divide-gray-800/80">
                {itens.map((it, idx) => (
                  <div key={idx} className="grid md:grid-cols-6 gap-3 px-3 py-3 bg-[#11121C]">
                    <div className="md:col-span-3">
                      <div className="text-xs text-gray-400">Procedimento</div>
                      <div className="text-sm text-white">{it.procedimento}</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-xs text-gray-400">Dentes/Região</div>
                      <div className="text-sm text-white">{it.dentes_regiao || '—'}</div>
                    </div>
                    <div className="flex items-center justify-between md:col-span-1">
                      <div>
                        <div className="text-xs text-gray-400">Valor</div>
                        <div className="text-sm text-white">{currencyFmt.format(Number(it.valor) || 0)}</div>
                      </div>
                      <button type="button" className="btn btn-danger btn-xs" onClick={() => removeItem(idx)}>Excluir</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Dentista*</label>
                <input
                  className="input"
                  placeholder="Informe o responsável"
                  value={form.dentista}
                  onChange={e => setForm(f => ({ ...f, dentista: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Status</label>
                <select
                  className="input"
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                >
                  {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Observação</label>
              <textarea
                className="input"
                rows="4"
                maxLength={500}
                value={form.observacao}
                onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))}
              />
              <div className="text-right text-xs text-gray-500">{form.observacao.length} / 500</div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-gray-400">Valor total <span className="text-white font-semibold">{currencyFmt.format(total)}</span></div>
              <div className="flex gap-2">
                <button type="button" className="btn" onClick={resetForm}>Fechar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {debitos.length === 0 ? (
              <div className="text-gray-400 text-sm">Esse paciente não possui débitos</div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Selecionar débito</label>
                    <select
                      className="input"
                      value={docTargetId || ''}
                      onChange={e => setDocTargetId(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">Escolha…</option>
                      {debitos.map(d => (
                        <option key={d.id} value={d.id}>
                          #{d.id} • {new Date(d.data_vencimento).toLocaleDateString('pt-BR')} • {currencyFmt.format(Number(d.valor_total || 0))}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className={`btn btn-primary ${!docTargetId ? 'opacity-60 cursor-not-allowed' : ''}`}>
                    Anexar comprovante
                    <input
                      ref={fileInputRef}
                      className="hidden"
                      type="file"
                      accept="application/pdf,image/*"
                      disabled={!docTargetId || uploadingDoc}
                      onChange={handleUploadDocumento}
                    />
                  </label>
                  {uploadingDoc && <span className="text-xs text-gray-400">Enviando…</span>}
                </div>

                {selectedDebito ? (
                  selectedDebito.documentos && selectedDebito.documentos.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDebito.documentos.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between bg-[#11121C] border border-gray-800/70 rounded px-3 py-2">
                          <div>
                            <div className="text-sm text-white">{doc.nome || doc.arquivo?.split('/').pop()}</div>
                            <div className="text-xs text-gray-500">{new Date(doc.criado_em).toLocaleString('pt-BR')}</div>
                          </div>
                          <div className="flex gap-2">
                            <a className="btn btn-secondary btn-xs" href={doc.arquivo} target="_blank" rel="noreferrer">Abrir</a>
                            <button type="button" className="btn btn-danger btn-xs" onClick={() => handleRemoveDocumento(selectedDebito.id, doc.id)}>Excluir</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">Nenhum comprovante anexado para este débito.</div>
                  )
                ) : (
                  <div className="text-sm text-gray-400">Escolha um débito para visualizar anexos.</div>
                )}
              </>
            )}
          </div>
        )}

        {(erro || msg) && (
          <div className="mt-4 text-sm">
            {erro && <span className="text-red-400 mr-4">{erro}</span>}
            {msg && <span className="text-green-400">{msg}</span>}
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Débitos do paciente</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Status</span>
            <select className="input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">Todos</option>
              {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>
        {loading ? (
          <div className="text-gray-400">Carregando…</div>
        ) : debitos.length === 0 ? (
          <div className="text-gray-500">Nenhum débito cadastrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300">
              <thead className="text-gray-400">
                <tr>
                  <th className="text-left py-2 pr-4">#</th>
                  <th className="text-left py-2 pr-4">Vencimento</th>
                  <th className="text-left py-2 pr-4">Procedimentos</th>
                  <th className="text-left py-2 pr-4">Valor</th>
                  <th className="text-left py-2 pr-4">Status</th>
                  <th className="text-left py-2 pr-4">Dentista</th>
                  <th className="text-left py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/70">
                {debitos.map(debito => (
                  <tr key={debito.id}>
                    <td className="py-2 pr-4 text-white font-semibold">{debito.id}</td>
                    <td className="py-2 pr-4">{new Date(debito.data_vencimento).toLocaleDateString('pt-BR')}</td>
                    <td className="py-2 pr-4">
                      {debito.itens && debito.itens.length > 0 ? (
                        <div className="space-y-1">
                          {debito.itens.slice(0,3).map((it, idx) => (
                            <div key={idx} className="text-xs text-gray-300">
                              {it.procedimento} {it.dentes_regiao ? `(${it.dentes_regiao})` : ''}
                            </div>
                          ))}
                          {debito.itens.length > 3 && <div className="text-xs text-gray-500">+ {debito.itens.length - 3} procedimento(s)</div>}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="py-2 pr-4 text-white">{currencyFmt.format(Number(debito.valor_total || 0))}</td>
                    <td className="py-2 pr-4 capitalize">{STATUS_OPTIONS.find(s => s.value === debito.status)?.label || debito.status}</td>
                    <td className="py-2 pr-4">{debito.dentista || '—'}</td>
                    <td className="py-2 pr-4 text-right">
                      <div className="flex gap-2 justify-end flex-wrap">
                        {debito.status !== 'pago' && (
                          <button type="button" className="btn btn-secondary btn-xs" onClick={() => handleUpdateStatus(debito.id, 'pago')}>
                            Marcar como pago
                          </button>
                        )}
                        {debito.status === 'pendente' && (
                          <button type="button" className="btn btn-secondary btn-xs" onClick={() => handleUpdateStatus(debito.id, 'parcial')}>
                            Marcar parcial
                          </button>
                        )}
                        <button type="button" className="btn btn-secondary btn-xs" onClick={() => { setDocTargetId(debito.id); setInnerTab('documentos') }}>
                          Ver documentos
                        </button>
                        <button type="button" className="btn btn-danger btn-xs" onClick={() => handleDeleteDebito(debito.id)}>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
