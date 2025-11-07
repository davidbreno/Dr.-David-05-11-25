import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import OrcamentosTab from './tabs/OrcamentosTab.jsx'
import AnamneseTab from './tabs/AnamneseTab.jsx'
import DocumentosTab from './tabs/DocumentosTab.jsx'
import DebitosTab from './tabs/DebitosTab.jsx'
import PrescricaoTab from './tabs/PrescricaoTab.jsx'

export default function PacienteDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [paciente, setPaciente] = useState(null)
  const [tab, setTab] = useState('sobre') // sobre | consultas | mensagens | orcamentos | anamnese | documentos | debitos | prescricao
  const [anamnese, setAnamnese] = useState(null)
  const [anamLoading, setAnamLoading] = useState(false)
  const [anamRefreshTick, setAnamRefreshTick] = useState(0)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setErro('')
      try {
        const { data } = await api.get(`/pacientes/${id}/`)
        setPaciente(data)
      } catch (e) {
        setErro('Não foi possível carregar o paciente.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  // Carrega anamnese (resumo) quando entra no detalhe e quando a aba 'sobre' voltar a ficar ativa
  useEffect(() => {
    async function loadAnamnese() {
      setAnamLoading(true)
      try {
        const { data } = await api.get(`/pacientes/anamneses/?paciente=${id}`)
        const item = data.results ? data.results[0] : data[0]
        setAnamnese(item || null)
      } catch {
        setAnamnese(null)
      } finally {
        setAnamLoading(false)
      }
    }
    if (tab === 'sobre') loadAnamnese()
  }, [id, tab, anamRefreshTick])

  // Atualiza resumo ao receber evento de salvamento na aba de anamnese
  useEffect(() => {
    function onSaved(e){
      if (String(e.detail?.pacienteId) === String(id)) {
        // força recarregar o resumo mesmo se a aba já for 'sobre'
        setAnamRefreshTick((t) => t + 1)
      }
    }
    window.addEventListener('anamnese:saved', onSaved)
    return () => window.removeEventListener('anamnese:saved', onSaved)
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="spinner"></div>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="card bg-red-900/20 border-red-500/50 text-red-300">{erro}</div>
    )
  }

  if (!paciente) return null

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600/20 text-blue-400 rounded-full w-14 h-14 flex items-center justify-center text-2xl font-bold">
              {paciente.nome?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{paciente.nome}</h1>
              <div className="text-sm text-gray-400 flex gap-3 mt-1">
                {paciente.telefone && (<span>📞 {paciente.telefone}</span>)}
                {paciente.cpf && (<span>🆔 {paciente.cpf}</span>)}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn" onClick={() => nav('/pacientes')}>Voltar</button>
            <button type="button" className="btn btn-primary" onClick={() => nav(`/pacientes/${id}/edit`)}>
              Editar
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="mt-6 flex gap-2 flex-wrap">
          <button className={`tab-pill${tab==='sobre' ? ' active' : ''}`} onClick={() => setTab('sobre')}>Dados pessoais</button>
          <button className={`tab-pill${tab==='consultas' ? ' active' : ''}`} onClick={() => setTab('consultas')}>Consultas</button>
          <button className={`tab-pill${tab==='mensagens' ? ' active' : ''}`} onClick={() => setTab('mensagens')}>Mensagens</button>
          <button className={`tab-pill${tab==='orcamentos' ? ' active' : ''}`} onClick={() => setTab('orcamentos')}>Orçamentos</button>
          <button className={`tab-pill${tab==='anamnese' ? ' active' : ''}`} onClick={() => setTab('anamnese')}>Anamnese</button>
          <button className={`tab-pill${tab==='documentos' ? ' active' : ''}`} onClick={() => setTab('documentos')}>Documentos</button>
          <button className={`tab-pill${tab==='debitos' ? ' active' : ''}`} onClick={() => setTab('debitos')}>Débitos</button>
          <button className={`tab-pill${tab==='prescricao' ? ' active' : ''}`} onClick={() => setTab('prescricao')}>Prescrição</button>
        </div>
      </div>

      {/* Conteúdo da tab */}
      {tab === 'sobre' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-4">Dados pessoais</h2>
            <div className="space-y-3 text-gray-300">
              <Item label="Nome" value={paciente.nome} />
              <Item label="CPF" value={paciente.cpf} />
              <Item label="E-mail" value={paciente.email || '—'} />
              <Item label="Telefone" value={paciente.telefone || '—'} />
              <Item label="Endereço" value={paciente.endereco || '—'} />
            </div>
          </div>
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-bold text-white mb-4">Observações</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{paciente.observacoes || 'Sem observações.'}</p>
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-white">Anamnese (resumo)</h2>
                <button type="button" className="btn btn-primary" onClick={() => setTab('anamnese')}>Editar anamnese</button>
              </div>
              {anamLoading ? (
                <div className="text-gray-400">Carregando…</div>
              ) : anamnese ? (
                <div className="text-gray-300 space-y-3">
                  {anamnese.queixa_principal && <Item label="Queixa principal" value={anamnese.queixa_principal} />}
                  {anamnese.antecedentes_medicos && <Item label="Antecedentes" value={anamnese.antecedentes_medicos} />}
                  <div>
                    <div className="text-sm text-gray-400">Condições</div>
                    <div className="flex flex-wrap gap-2 mt-1 text-sm">
                      {renderCond('Diabetes', anamnese.possui_diabetes)}
                      {renderCond('Hipertensão', anamnese.possui_hipertensao)}
                      {renderCond('Cardiopatia', anamnese.cardiopatia)}
                      {renderCond('Asma', anamnese.asma)}
                      {renderCond('Hemorragias', anamnese.hemorragias)}
                      {renderCond('Reação à anestesia', anamnese.anestesia_reacao)}
                      {renderCond('Fuma', anamnese.fuma)}
                      {renderCond('Grávida', anamnese.gravida)}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Item label="PA Sistólica" value={anamnese.pressao_sistolica ?? '—'} />
                    <Item label="PA Diastólica" value={anamnese.pressao_diastolica ?? '—'} />
                    <Item label="Batimentos" value={anamnese.batimentos ?? '—'} />
                  </div>
                  {anamnese.outros && <Item label="Outros" value={anamnese.outros} />}
                </div>
              ) : (
                <div className="text-gray-400">Sem anamnese cadastrada.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'consultas' && (
        <div className="card text-gray-300">
          <h2 className="text-xl font-bold text-white mb-4">Consultas</h2>
          <p>Em breve conectaremos com a agenda. Por enquanto, esta é uma área de placeholder.</p>
        </div>
      )}

      {tab === 'mensagens' && (
        <div className="card text-gray-300">
          <h2 className="text-xl font-bold text-white mb-4">Mensagens</h2>
          <p>Área para histórico e envio de mensagens. Placeholder inicial.</p>
        </div>
      )}

      {tab === 'orcamentos' && (
        <OrcamentosTab pacienteId={paciente.id} pacienteNome={paciente.nome} />
      )}

      {tab === 'anamnese' && (
        <AnamneseTab pacienteId={paciente.id} pacienteNome={paciente.nome} />
      )}

      {tab === 'documentos' && (
        <DocumentosTab pacienteId={paciente.id} pacienteNome={paciente.nome} />
      )}

      {tab === 'debitos' && (
        <DebitosTab pacienteId={paciente.id} pacienteNome={paciente.nome} />
      )}

      {tab === 'prescricao' && (
        <PrescricaoTab pacienteId={paciente.id} pacienteNome={paciente.nome} pacienteDados={paciente} />
      )}
    </div>
  )
}

function Item({ label, value }){
  return (
    <div>
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-white">{value}</div>
    </div>
  )
}

function renderCond(label, val){
  const cls = val
    ? 'px-2 py-1 rounded bg-green-600/20 text-green-300'
    : 'px-2 py-1 rounded bg-gray-700/50 text-gray-400'
  return <span className={cls}>{label}</span>
}
