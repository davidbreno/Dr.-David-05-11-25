import React, { useEffect, useRef, useState } from 'react'
import { api } from '../../api/client.js'

export default function DocumentosTab({ pacienteId, pacienteNome }){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [msg, setMsg] = useState('')
  const [gerando, setGerando] = useState(false)
  const fileRef = useRef(null)

  async function load(){
    setLoading(true); setErro('')
    try{
      const { data } = await api.get(`/pacientes/documentos/?paciente=${pacienteId}`)
      setItems(data.results ?? data)
    }catch(e){ setErro('Não foi possível carregar os documentos.') }
    finally{ setLoading(false) }
  }

  useEffect(()=>{ load() }, [pacienteId])

  async function handleUpload(e){
    const f = e.target.files?.[0]
    if(!f) return
    setErro(''); setMsg('')
    try{
      const fd = new FormData()
      fd.append('paciente', pacienteId)
      fd.append('arquivo', f)
      // Não defina manualmente 'Content-Type' para permitir que o browser injete o boundary corretamente
      await api.post(`/pacientes/documentos/`, fd)
      setMsg('Arquivo enviado com sucesso.')
      load()
      if(fileRef.current) fileRef.current.value = ''
    }catch(err){
      const detail = err?.response?.data || err?.message || ''
      setErro(`Falha ao enviar arquivo. ${formatErr(detail)}`)
    }
  }

  async function handleDelete(id){
    if(!confirm('Remover este documento?')) return
    setErro(''); setMsg('')
    try{
      await api.delete(`/pacientes/documentos/${id}/`)
      setMsg('Documento removido.')
      setItems(list => list.filter(x=>x.id!==id))
    }catch(err){ setErro('Falha ao remover.') }
  }

  async function handleDownload(doc){
    setErro(''); setMsg('')
    try{
      const url = doc.url || doc.arquivo
      if(!url) throw new Error('URL do arquivo não encontrada.')
      const res = await fetch(url)
      if(!res.ok) throw new Error(`Erro ao baixar (${res.status})`)
      const blob = await res.blob()
      const dl = document.createElement('a')
      const objectUrl = URL.createObjectURL(blob)
      dl.href = objectUrl
      const fallback = (url.split('/')?.pop()) || `documento_${doc.id||''}.pdf`
      const name = (doc.nome && /\.[a-z0-9]+$/i.test(doc.nome) ? doc.nome : (doc.nome ? `${doc.nome}.pdf` : fallback))
      dl.download = name
      document.body.appendChild(dl)
      dl.click()
      dl.remove()
      URL.revokeObjectURL(objectUrl)
    }catch(err){
      setErro(`Falha ao baixar. ${err?.message||''}`)
    }
  }

  async function gerarModelo(tipo){
    setErro(''); setMsg(''); setGerando(true)
    try{
      await api.post(`/pacientes/documentos/gerar/`, { paciente: pacienteId, tipo })
      setMsg('Documento gerado e salvo com sucesso.')
      load()
    }catch(err){
      const detail = err?.response?.data || err?.message || ''
      setErro(`Falha ao gerar documento. ${formatErr(detail)}`)
    }finally{ setGerando(false) }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Modelos prontos</h3>
            <p className="text-gray-400 text-sm">Gere rapidamente documentos padronizados em PDF.</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          <button type="button" className="btn btn-secondary" disabled={gerando} onClick={()=>gerarModelo('receita-basica')}>
            {gerando ? 'Gerando…' : 'Receita (básica)'}
          </button>
          <button type="button" className="btn btn-secondary" disabled={gerando} onClick={()=>gerarModelo('pos-operatorio')}>
            {gerando ? 'Gerando…' : 'Pós-operatório'}
          </button>
          <button type="button" className="btn btn-secondary" disabled={gerando} onClick={()=>gerarModelo('termo-clareamento')}>
            {gerando ? 'Gerando…' : 'Termo Clareamento'}
          </button>
          <button type="button" className="btn btn-secondary" disabled={gerando} onClick={()=>gerarModelo('termo-implante')}>
            {gerando ? 'Gerando…' : 'Termo Implante'}
          </button>
          <button type="button" className="btn btn-secondary" disabled={gerando} onClick={()=>gerarModelo('termo-exodontia')}>
            {gerando ? 'Gerando…' : 'Termo Exodontia'}
          </button>
          <button type="button" className="btn btn-secondary" disabled={gerando} onClick={()=>gerarModelo('termo-hipertensao')}>
            {gerando ? 'Gerando…' : 'Termo p/ Hipertensão'}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Documentos de {pacienteNome}</h2>
            <p className="text-gray-400 text-sm">PDFs, imagens e outros arquivos vinculados ao paciente.</p>
          </div>
          <label className="btn btn-primary cursor-pointer">
            Selecionar arquivo
            <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={handleUpload} />
          </label>
        </div>
        {(msg || erro) && (
          <div className="mt-3 text-sm">
            {msg && <span className="text-green-400 mr-4">{msg}</span>}
            {erro && <span className="text-red-400">{erro}</span>}
          </div>
        )}
      </div>

      <div className="card">
        {loading ? (
          <div className="text-gray-400">Carregando…</div>
        ) : items.length === 0 ? (
          <div className="text-gray-400">Nenhum documento enviado ainda.</div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-left text-gray-200">
              <thead className="text-sm text-gray-400 border-b border-gray-700/60">
                <tr>
                  <th className="py-2 pr-4">Nome</th>
                  <th className="py-2 pr-4">Tipo</th>
                  <th className="py-2 pr-4">Tamanho</th>
                  <th className="py-2 pr-4">Enviado em</th>
                  <th className="py-2 pr-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/70">
                {items.map(doc => (
                  <tr key={doc.id}>
                    <td className="py-2 pr-4">
                      <a className="text-blue-400 hover:underline" href={doc.url || doc.arquivo} target="_blank" rel="noreferrer">
                        {doc.nome || (doc.arquivo?.split('/').pop()) || `arquivo_${doc.id}`}
                      </a>
                    </td>
                    <td className="py-2 pr-4 text-sm text-gray-400">{doc.content_type || '—'}</td>
                    <td className="py-2 pr-4 text-sm text-gray-400">{formatSize(doc.tamanho)}</td>
                    <td className="py-2 pr-4 text-sm text-gray-400">{formatDate(doc.criado_em)}</td>
                    <td className="py-2 pr-2 text-right flex gap-2 justify-end">
                      <button type="button" className="btn btn-secondary" onClick={()=>handleDownload(doc)}>Baixar</button>
                      <button type="button" className="btn btn-secondary" onClick={()=>handleDelete(doc.id)}>Excluir</button>
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

function formatSize(b){
  if(!b) return '—'
  const u = ['B','KB','MB','GB']
  let i = 0, v = b
  while(v >= 1024 && i < u.length-1){ v/=1024; i++ }
  return `${v.toFixed(1)} ${u[i]}`
}

function formatDate(iso){
  if(!iso) return '—'
  try { const d = new Date(iso); return d.toLocaleString() } catch { return iso }
}

function formatErr(data){
  if(!data) return ''
  if(typeof data === 'string') return data
  try{
    if(Array.isArray(data)) return data.join(', ')
    const parts = []
    for(const k in data){
      const v = data[k]
      parts.push(typeof v === 'string' ? `${k}: ${v}` : `${k}: ${JSON.stringify(v)}`)
    }
    return parts.join(' | ')
  }catch{ return '' }
}
