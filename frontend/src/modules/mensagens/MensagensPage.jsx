import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client.js'

const statusStyles = {
  novo: 'bg-blue-900/30 text-blue-200',
  enviado: 'bg-emerald-900/40 text-emerald-200',
  falha: 'bg-red-900/40 text-red-200',
}

function Badge({ status, children }) {
  const base = statusStyles[status] || 'bg-slate-800 text-slate-200'
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${base}`}>{children}</span>
}

export default function MensagensPage() {
  const [contacts, setContacts] = useState([])
  const [loadingContacts, setLoadingContacts] = useState(false)
  const [contactError, setContactError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ count: 0, pageSize: 10 })
  const [selected, setSelected] = useState(() => new Set())

  const [uploading, setUploading] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadOrigin, setUploadOrigin] = useState('Importação CSV')
  const [uploadResult, setUploadResult] = useState(null)

  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [sendFeedback, setSendFeedback] = useState(null)

  const selectedCount = useMemo(() => selected.size, [selected])

  const pageCount = useMemo(() => {
    const size = pagination.pageSize || 1
    const total = pagination.count || 0
    return Math.max(1, Math.ceil(total / size))
  }, [pagination])

  async function loadContacts(requestedPage = 1) {
    setLoadingContacts(true)
    setContactError('')
    try {
      const params = { page: requestedPage }
      if (statusFilter) params.status = statusFilter
      if (searchTerm.trim()) params.search = searchTerm.trim()
  const { data } = await api.get('/pacientes/convites/', { params })
      const results = data.results ?? data
      if (requestedPage > 1 && (!results || results.length === 0) && (data.count ?? 0) > 0) {
        await loadContacts(1)
        return
      }
      setContacts(results)
      setPage(requestedPage)
      setPagination({
        count: data.count ?? results.length ?? 0,
        pageSize: data.results ? Math.max(data.results.length, 1) : Math.max(results.length, 1),
      })
    } catch (error) {
      console.error(error)
      setContactError('Não foi possível carregar os contatos importados.')
    } finally {
      setLoadingContacts(false)
    }
  }

  async function loadHistory() {
    setLoadingHistory(true)
    try {
  const { data } = await api.get('/pacientes/convites/importacoes/?page=1')
      setHistory(data.results ?? data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    loadContacts(1)
    loadHistory()
  }, [])

  useEffect(() => {
    if (page === 1) {
      loadContacts(1)
    } else {
      loadContacts(page)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectPage() {
    setSelected((prev) => {
      const next = new Set(prev)
      const allSelected = contacts.every((contact) => next.has(contact.id))
      if (allSelected) {
        contacts.forEach((contact) => next.delete(contact.id))
      } else {
        contacts.forEach((contact) => next.add(contact.id))
      }
      return next
    })
  }

  function clearSelection() {
    setSelected(() => new Set())
  }

  async function handleUpload(event) {
    event.preventDefault()
    if (!uploadFile) return
    setUploading(true)
    setUploadResult(null)
    setSendFeedback(null)
    try {
      const formData = new FormData()
      formData.append('arquivo', uploadFile)
      if (uploadOrigin) formData.append('origem', uploadOrigin)
  const { data } = await api.post('/pacientes/convites/importacoes/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setUploadResult(data)
      await loadContacts(1)
      await loadHistory()
      setUploadFile(null)
    } catch (error) {
      console.error(error)
      const detail = error?.response?.data?.detail || 'Falha durante a importação do CSV.'
      setUploadResult({ detail, resumo: null })
    } finally {
      setUploading(false)
    }
  }

  async function handleSend() {
    if (!selectedCount) {
      setSendFeedback({ type: 'error', message: 'Selecione ao menos um contato para enviar.' })
      return
    }
    if (!messageText.trim()) {
      setSendFeedback({ type: 'error', message: 'Escreva a mensagem que será enviada.' })
      return
    }
    setSending(true)
    setSendFeedback(null)
    try {
      const payload = {
        contatos: Array.from(selected),
        mensagem: messageText.trim(),
      }
  const { data } = await api.post('/pacientes/convites/enviar/', payload)
      setSendFeedback({ type: 'success', message: `${data.enviados} mensagem(ns) registradas.` })
      setMessageText('')
      clearSelection()
      await loadContacts(page)
    } catch (error) {
      console.error(error)
      const detail = error?.response?.data?.detail || 'Falha ao registrar as mensagens.'
      setSendFeedback({ type: 'error', message: detail })
    } finally {
      setSending(false)
    }
  }

  function renderResumo(resumo) {
    if (!resumo) return null
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
        <div className="card bg-slate-900/40 border border-slate-700/60">
          <p className="text-slate-400">Registros lidos</p>
          <p className="text-lg font-semibold text-white">{resumo.total ?? 0}</p>
        </div>
        <div className="card bg-emerald-900/30 border border-emerald-700/50">
          <p className="text-emerald-200">Importados</p>
          <p className="text-lg font-semibold text-emerald-100">{resumo.importados ?? 0}</p>
        </div>
        <div className="card bg-blue-900/30 border border-blue-700/50">
          <p className="text-blue-200">Atualizados</p>
          <p className="text-lg font-semibold text-blue-100">{resumo.atualizados ?? 0}</p>
        </div>
        <div className="card bg-amber-900/30 border border-amber-700/50">
          <p className="text-amber-200">Ignorados / Erros</p>
          <p className="text-lg font-semibold text-amber-100">{(resumo.ignorados ?? 0) + (resumo.erros ?? 0)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="page-title">💌 Central de Mensagens</h1>
        <div className="text-sm text-slate-300 max-w-2xl sm:text-right">
          Importe listas externas de pacientes e envie convites personalizados sem misturar com a base oficial.
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4">Nova importação de contatos</h2>
          <form className="space-y-4" onSubmit={handleUpload}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col text-sm text-slate-300">
                Arquivo CSV
                <input
                  type="file"
                  accept=".csv"
                  className="input mt-2"
                  onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                  disabled={uploading}
                  required
                />
              </label>
              <label className="flex flex-col text-sm text-slate-300">
                Origem (opcional)
                <input
                  type="text"
                  className="input mt-2"
                  placeholder="Ex.: Campanha Outubro"
                  value={uploadOrigin}
                  onChange={(e) => setUploadOrigin(e.target.value)}
                  disabled={uploading}
                />
              </label>
            </div>
            <p className="text-xs text-slate-400">
              Estrutura esperada do CSV: nome, cpf, telefone, data_nascimento, idade. O CPF e a idade são opcionais,
              porém telefone e nome são obrigatórios. Aceitamos datas nos formatos AAAA-MM-DD ou DD/MM/AAAA.
            </p>
            <div className="flex items-center gap-3">
              <button type="submit" className="btn btn-primary" disabled={uploading || !uploadFile}>
                {uploading ? 'Importando...' : 'Importar CSV'}
              </button>
              {uploadFile && !uploading && (
                <button type="button" className="btn btn-secondary" onClick={() => setUploadFile(null)}>
                  Limpar arquivo
                </button>
              )}
            </div>
          </form>
          {uploadResult && (
            <div className={`mt-4 card ${uploadResult?.resumo ? 'border-emerald-500/60 bg-emerald-900/20' : 'border-red-500/60 bg-red-900/20'}`}>
              <p className="font-semibold text-white">{uploadResult.detail}</p>
              {uploadResult.colunas_desconhecidas?.length > 0 && (
                <p className="text-xs text-amber-200 mt-2">
                  Colunas adicionais ignoradas: {uploadResult.colunas_desconhecidas.join(', ')}
                </p>
              )}
              {renderResumo(uploadResult.resumo)}
            </div>
          )}
        </div>

        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-white">Enviar mensagens</h2>
          <p className="text-sm text-slate-300">
            Construa a mensagem abaixo. Ela será registrada para todos os contatos selecionados na lista.
          </p>
          <textarea
            className="input h-32 resize-none"
            placeholder="Convite para retornar à clínica, mensagem de campanha, etc."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            disabled={sending}
          />
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
            <Badge status="novo">Selecionados: {selectedCount}</Badge>
            <button type="button" className="btn btn-secondary" onClick={toggleSelectPage} disabled={!contacts.length}>
              Selecionar página
            </button>
            <button type="button" className="btn btn-secondary" onClick={clearSelection} disabled={!selectedCount}>
              Limpar seleção
            </button>
          </div>
          <button type="button" className="btn btn-primary w-full" onClick={handleSend} disabled={sending}>
            {sending ? 'Enviando...' : `Enviar mensagem (${selectedCount})`}
          </button>
          {sendFeedback && (
            <div
              className={`card text-sm ${
                sendFeedback.type === 'success'
                  ? 'bg-emerald-900/20 border border-emerald-600/60 text-emerald-100'
                  : 'bg-red-900/20 border border-red-600/60 text-red-200'
              }`}
            >
              {sendFeedback.message}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="card lg:col-span-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col md:flex-row md:items-center md:gap-3">
              <div className="flex items-center gap-2">
                <input
                  className="input"
                  placeholder="Buscar por nome, telefone ou CPF"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadContacts(1)}
                />
                <button className="btn btn-secondary" onClick={() => loadContacts(1)}>
                  Buscar
                </button>
              </div>
              <select
                className="input md:w-48"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Todos os status</option>
                <option value="novo">Nunca contatado</option>
                <option value="enviado">Convite enviado</option>
                <option value="falha">Falha no envio</option>
              </select>
            </div>
            <div className="text-sm text-slate-400">Total: {pagination.count}</div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700/60">
                  <th className="py-3 pr-3">Selecionar</th>
                  <th className="py-3 pr-3">Nome</th>
                  <th className="py-3 pr-3">Telefone</th>
                  <th className="py-3 pr-3">CPF</th>
                  <th className="py-3 pr-3">Status</th>
                  <th className="py-3 pr-3">Última mensagem</th>
                </tr>
              </thead>
              <tbody>
                {loadingContacts && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      <div className="flex justify-center">
                        <div className="spinner"></div>
                      </div>
                    </td>
                  </tr>
                )}
                {!loadingContacts && contacts.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      Nenhum contato importado até o momento.
                    </td>
                  </tr>
                )}
                {!loadingContacts &&
                  contacts.map((contact) => {
                    const checked = selected.has(contact.id)
                    return (
                      <tr key={contact.id} className="border-b border-slate-800/60 last:border-none hover:bg-slate-800/30">
                        <td className="py-4 pr-3 align-middle">
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={checked}
                            onChange={() => toggleSelect(contact.id)}
                          />
                        </td>
                        <td className="py-4 pr-3 align-middle text-white">
                          <div className="font-semibold">{contact.nome}</div>
                          {contact.origem && <div className="text-xs text-slate-400">{contact.origem}</div>}
                        </td>
                        <td className="py-4 pr-3 align-middle text-slate-200">{contact.telefone || '—'}</td>
                        <td className="py-4 pr-3 align-middle text-slate-200">{contact.cpf || '—'}</td>
                        <td className="py-4 pr-3 align-middle">
                          <Badge status={contact.status}>{contact.status_label}</Badge>
                        </td>
                        <td className="py-4 pr-3 align-middle text-slate-300">
                          {contact.ultima_mensagem_em
                            ? new Date(contact.ultima_mensagem_em).toLocaleString('pt-BR')
                            : '—'}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>

          {contactError && (
            <div className="card bg-red-900/20 border border-red-600/50 text-red-200 mt-4">{contactError}</div>
          )}

          <div className="flex items-center justify-between mt-4 text-sm text-slate-300">
            <div>
              Página {page} de {pageCount}
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-secondary"
                onClick={() => loadContacts(Math.max(page - 1, 1))}
                disabled={page <= 1 || loadingContacts}
              >
                Anterior
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => loadContacts(Math.min(page + 1, pageCount))}
                disabled={page >= pageCount || loadingContacts}
              >
                Próxima
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Histórico de importações</h2>
            {loadingHistory && (
              <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} aria-label="Carregando" />
            )}
          </div>
          <ul className="space-y-3 text-sm text-slate-200">
            {history.length === 0 && !loadingHistory && (
              <li className="text-slate-400 text-sm">Nenhuma importação registrada ainda.</li>
            )}
            {history.map((item) => (
              <li key={item.id} className="border border-slate-800/70 rounded-lg p-3 bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{item.arquivo_nome}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(item.criado_em).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(item.criado_em).toLocaleTimeString('pt-BR')}
                  </span>
                </div>
                {item.origem && <div className="text-xs text-slate-400 mt-1">Origem: {item.origem}</div>}
                <div className="flex gap-3 text-xs mt-2 text-slate-300">
                  <span>Importados: {item.importados}</span>
                  <span>Atualizados: {item.atualizados}</span>
                  <span>Erros: {item.erros}</span>
                </div>
                {item.log && (
                  <details className="mt-2 text-xs text-amber-200">
                    <summary className="cursor-pointer text-amber-300">Ver anotações</summary>
                    <pre className="mt-1 whitespace-pre-wrap text-amber-200/80">{item.log}</pre>
                  </details>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
