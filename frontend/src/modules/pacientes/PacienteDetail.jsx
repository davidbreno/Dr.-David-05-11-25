import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import OrcamentosTab from './tabs/OrcamentosTab.jsx'

export default function PacienteDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [paciente, setPaciente] = useState(null)
  const [tab, setTab] = useState('sobre') // sobre | consultas | mensagens | orcamentos

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
            <button className="btn" onClick={() => nav('/pacientes')}>Voltar</button>
            <button className="btn btn-primary" onClick={() => nav(`/pacientes/${id}/edit`)}>
              Editar
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="mt-6 flex gap-2 flex-wrap">
          <button className={`px-4 py-2 rounded-lg ${tab==='sobre' ? 'bg-[#7DEDDE] text-[#1a1b26] font-semibold' : 'text-gray-300 hover:bg-[#21222D]'}`} onClick={() => setTab('sobre')}>Dados pessoais</button>
          <button className={`px-4 py-2 rounded-lg ${tab==='consultas' ? 'bg-[#7DEDDE] text-[#1a1b26] font-semibold' : 'text-gray-300 hover:bg-[#21222D]'}`} onClick={() => setTab('consultas')}>Consultas</button>
          <button className={`px-4 py-2 rounded-lg ${tab==='mensagens' ? 'bg-[#7DEDDE] text-[#1a1b26] font-semibold' : 'text-gray-300 hover:bg-[#21222D]'}`} onClick={() => setTab('mensagens')}>Mensagens</button>
          <button className={`px-4 py-2 rounded-lg ${tab==='orcamentos' ? 'bg-[#7DEDDE] text-[#1a1b26] font-semibold' : 'text-gray-300 hover:bg-[#21222D]'}`} onClick={() => setTab('orcamentos')}>Orçamentos</button>
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
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-4">Observações</h2>
            <p className="text-gray-300 whitespace-pre-wrap">{paciente.observacoes || 'Sem observações.'}</p>
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
