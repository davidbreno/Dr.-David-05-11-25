import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../../api/client.js'

const MED_CATEGORIES = [
  {
    id: 'antibiotico',
    label: 'Antibiótico',
    descricao: 'Controle de infecções bacterianas orais e perioperatórias.',
    medicamentos: [
      {
        id: 'amoxicilina',
        nome: 'Amoxicilina 500 mg',
        dose: '1 cápsula',
        frequencia: 'a cada 8 horas',
        duracao: '7 dias',
        orientacoes: 'Tomar após as refeições. Manter o tratamento por 48h após remissão dos sintomas.',
      },
      {
        id: 'azitromicina',
        nome: 'Azitromicina 500 mg',
        dose: '1 comprimido',
        frequencia: '1x ao dia',
        duracao: '3 dias',
        orientacoes: 'Tomar preferencialmente 1 hora antes ou 2 horas após as refeições.',
      },
      {
        id: 'clindamicina',
        nome: 'Clindamicina 300 mg',
        dose: '1 cápsula',
        frequencia: 'a cada 8 horas',
        duracao: '7 dias',
        orientacoes: 'Indicada para pacientes alérgicos à penicilina. Tomar com um copo de água.',
      },
    ],
  },
  {
    id: 'analgesico',
    label: 'Analgésico',
    descricao: 'Controle da dor odontológica aguda ou pós-operatória.',
    medicamentos: [
      {
        id: 'dipirona',
        nome: 'Dipirona Sódica 500 mg',
        dose: '1 comprimido',
        frequencia: 'a cada 6 horas se necessário',
        duracao: 'até 5 dias',
        orientacoes: 'Suspender ao melhorar. Não exceder 4 g por dia.',
      },
      {
        id: 'paracetamol',
        nome: 'Paracetamol 750 mg',
        dose: '1 comprimido',
        frequencia: 'a cada 6 horas se necessário',
        duracao: 'até 5 dias',
        orientacoes: 'Não associar com outros medicamentos que contenham paracetamol.',
      },
      {
        id: 'ibuprofeno',
        nome: 'Ibuprofeno 400 mg',
        dose: '1 comprimido',
        frequencia: 'a cada 8 horas',
        duracao: '5 dias',
        orientacoes: 'Tomar após alimentação. Evitar uso em pacientes com gastrite.',
      },
    ],
  },
  {
    id: 'antiinflamatorio',
    label: 'Antiinflamatório',
    descricao: 'Redução de edema e processo inflamatório em procedimentos odontológicos.',
    medicamentos: [
      {
        id: 'nimesulida',
        nome: 'Nimesulida 100 mg',
        dose: '1 comprimido',
        frequencia: 'a cada 12 horas',
        duracao: '5 dias',
        orientacoes: 'Tomar após as refeições. Evitar uso prolongado.',
      },
      {
        id: 'cetoprofeno',
        nome: 'Cetoprofeno 100 mg',
        dose: '1 cápsula',
        frequencia: 'a cada 12 horas',
        duracao: '5 dias',
        orientacoes: 'Tomar com água e preferencialmente após alimentação.',
      },
      {
        id: 'dexametasona',
        nome: 'Dexametasona 4 mg',
        dose: '1 comprimido',
        frequencia: 'a cada 12 horas',
        duracao: '3 dias',
        orientacoes: 'Administrar pela manhã e tarde. Suspender gradativamente se uso prolongado.',
      },
    ],
  },
  {
    id: 'antiseptico',
    label: 'Antisséptico bucal',
    descricao: 'Controle químico de placa e antissepsia pré e pós-operatória.',
    medicamentos: [
      {
        id: 'clorexidina',
        nome: 'Clorexidina 0,12% (bochecho)',
        dose: '15 mL',
        frequencia: '2x ao dia',
        duracao: '10 dias',
        orientacoes: 'Bochechar por 30 segundos sem diluir. Evitar ingestão nos 30 minutos seguintes.',
      },
      {
        id: 'peroxido',
        nome: 'Peróxido de Hidrogênio 10v (diluído)',
        dose: 'Bochechar solução 1:1',
        frequencia: '2x ao dia',
        duracao: '7 dias',
        orientacoes: 'Misturar partes iguais de peróxido e água antes do uso.',
      },
    ],
  },
  {
    id: 'antifungico',
    label: 'Antifúngico',
    descricao: 'Tratamento de candidíase oral ou lesões fúngicas.',
    medicamentos: [
      {
        id: 'nistatina',
        nome: 'Nistatina suspensão oral 100.000 UI/mL',
        dose: '4 mL',
        frequencia: 'a cada 6 horas',
        duracao: '14 dias',
        orientacoes: 'Manter em contato com a mucosa por alguns minutos antes de engolir.',
      },
      {
        id: 'miconazol',
        nome: 'Miconazol gel oral 20 mg/g',
        dose: 'Aplicar camada fina',
        frequencia: '4x ao dia',
        duracao: '14 dias',
        orientacoes: 'Aplicar após higiene oral e evitar ingestão imediata de alimentos.',
      },
    ],
  },
  {
    id: 'ansiolitico',
    label: 'Ansiolítico / Sedação leve',
    descricao: 'Controle de ansiedade leve antes de procedimentos.',
    medicamentos: [
      {
        id: 'diazepam',
        nome: 'Diazepam 5 mg',
        dose: '1 comprimido',
        frequencia: '1 hora antes do procedimento',
        duracao: 'Dose única',
        orientacoes: 'Administrar com supervisão. Paciente não deve dirigir após o uso.',
      },
      {
        id: 'lorazepam',
        nome: 'Lorazepam 1 mg',
        dose: '1 comprimido',
        frequencia: '30 minutos antes do procedimento',
        duracao: 'Dose única',
        orientacoes: 'Avaliar histórico clínico antes da prescrição. Pode causar sonolência.',
      },
    ],
  },
]

function createUid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
}

function buildItem(classId, med) {
  return {
    uid: `${classId}-${med.id}-${createUid()}`,
    classeId: classId,
    classeNome: MED_CATEGORIES.find((c) => c.id === classId)?.label ?? '',
    nome: med.nome,
    dose: med.dose,
    frequencia: med.frequencia,
    duracao: med.duracao,
    orientacoes: med.orientacoes ?? '',
  }
}

export default function PrescricaoTab({ pacienteId, pacienteNome, pacienteDados = {} }) {
  const [selectedClass, setSelectedClass] = useState(null)
  const [showClassPicker, setShowClassPicker] = useState(false)
  const [showMedicationPicker, setShowMedicationPicker] = useState(false)
  const [items, setItems] = useState([])
  const [notes, setNotes] = useState('')
  const [responsavel, setResponsavel] = useState('')
  const [cro, setCro] = useState('')
  const [historico, setHistorico] = useState([])
  const [loadingHistorico, setLoadingHistorico] = useState(false)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [erro, setErro] = useState('')
  const [msg, setMsg] = useState('')
  const [historyExportingId, setHistoryExportingId] = useState(null)

  const today = useMemo(() => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date()), [])
  const idade = useMemo(() => {
    if (!pacienteDados?.data_nascimento) return ''
    const nasc = new Date(pacienteDados.data_nascimento)
    if (Number.isNaN(nasc.getTime())) return ''
    const diff = Date.now() - nasc.getTime()
    const ageDate = new Date(diff)
    return Math.abs(ageDate.getUTCFullYear() - 1970)
  }, [pacienteDados])

  useEffect(() => {
    if (!pacienteId) return
    loadHistorico()
  }, [pacienteId])

  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(''), 4000)
    return () => clearTimeout(t)
  }, [msg])

  function handleSelectClass(clazz) {
    setSelectedClass(clazz)
    setShowClassPicker(false)
    setShowMedicationPicker(true)
  }

  function handleAddMedication(med) {
    if (!selectedClass) {
      setErro('Selecione primeiro uma classe terapêutica.')
      return
    }
    setItems((prev) => [...prev, buildItem(selectedClass.id, med)])
    setShowMedicationPicker(false)
    setErro('')
  }

  function handleItemChange(uid, key, value) {
    setItems((prev) => prev.map((item) => (item.uid === uid ? { ...item, [key]: value } : item)))
  }

  function handleRemove(uid) {
    setItems((prev) => prev.filter((item) => item.uid !== uid))
  }

  function clearAll() {
    setItems([])
    setNotes('')
    setResponsavel('')
    setCro('')
    setEditingId(null)
    setSelectedClass(null)
    setShowClassPicker(false)
    setShowMedicationPicker(false)
    setErro('')
    setMsg('')
  }

  async function loadHistorico() {
    if (!pacienteId) return
    setLoadingHistorico(true)
    setErro('')
    try {
      const { data } = await api.get('/pacientes/prescricoes/', {
        params: { paciente: pacienteId, ordering: '-criado_em' },
      })
      const results = Array.isArray(data.results) ? data.results : data
      setHistorico(results)
    } catch (err) {
      setErro('Não foi possível carregar as prescrições anteriores.')
    } finally {
      setLoadingHistorico(false)
    }
  }

  function hydrateFromServer(prescricao) {
    setEditingId(prescricao.id)
    setResponsavel(prescricao.profissional || '')
    setCro(prescricao.cro || '')
    setNotes(prescricao.observacoes || '')
    setItems((prescricao.itens || []).map((item) => ({
      uid: createUid(),
      classeId: null,
      classeNome: item.classe_nome || item.classeNome || '',
      nome: item.nome || '',
      dose: item.dose || '',
      frequencia: item.frequencia || '',
      duracao: item.duracao || '',
      orientacoes: item.orientacoes || '',
    })))
  }

  function currentPayload() {
    return {
      paciente: pacienteId,
      profissional: responsavel,
      cro,
      observacoes: notes,
      itens: items.map((item) => ({
        classe_nome: item.classeNome || item.classe_nome || '',
        nome: item.nome,
        dose: item.dose,
        frequencia: item.frequencia,
        duracao: item.duracao,
        orientacoes: item.orientacoes,
      })),
    }
  }

  async function savePrescription({ silent = false } = {}) {
    if (!pacienteId) {
      setErro('Identificador do paciente não encontrado.')
      return null
    }
    if (!items.length) {
      if (!silent) setErro('Adicione pelo menos um medicamento na prescrição antes de salvar.')
      return null
    }
    setSaving(true)
    if (!silent) {
      setErro('')
      setMsg('')
    }
    try {
      const payload = currentPayload()
      const { data } = editingId
        ? await api.put(`/pacientes/prescricoes/${editingId}/`, payload)
        : await api.post('/pacientes/prescricoes/', payload)
      hydrateFromServer(data)
      await loadHistorico()
      if (!silent) {
        setMsg(editingId ? 'Prescrição atualizada com sucesso.' : 'Prescrição salva com sucesso.')
      }
      return data
    } catch (err) {
      const detail = err?.response?.data
        ? JSON.stringify(err.response.data)
        : err?.message || 'Erro inesperado.'
      setErro(`Não foi possível salvar a prescrição. ${detail}`)
      return null
    } finally {
      setSaving(false)
    }
  }

  async function exportToPdf() {
    const data = await savePrescription({ silent: true })
    if (!data && !editingId) {
      setErro('Salve a prescrição antes de exportar para PDF.')
      return
    }
    const idToExport = editingId || data?.id
    if (!idToExport) return
    setExporting(true)
    setErro('')
    try {
      const { data: resp } = await api.post(`/pacientes/prescricoes/${idToExport}/exportar/`)
      if (resp.download_url) {
        window.open(resp.download_url, '_blank', 'noopener')
      }
      setMsg('PDF gerado e salvo nos documentos do paciente.')
      await loadHistorico()
    } catch (err) {
      const detail = err?.response?.data ? JSON.stringify(err.response.data) : err?.message || 'Erro inesperado.'
      setErro(`Não foi possível gerar o PDF. ${detail}`)
    } finally {
      setExporting(false)
    }
  }

  function handleLoadFromHistory(prescricao) {
    hydrateFromServer(prescricao)
    setSelectedClass(null)
    setShowClassPicker(false)
    setShowMedicationPicker(false)
    setMsg('Prescrição carregada. Faça ajustes se necessário e salve novamente.')
  }

  async function handleExportFromHistory(id) {
    setHistoryExportingId(id)
    setErro('')
    try {
      const { data } = await api.post(`/pacientes/prescricoes/${id}/exportar/`)
      if (data.download_url) {
        window.open(data.download_url, '_blank', 'noopener')
      }
      setMsg('PDF gerado a partir da prescrição selecionada.')
      await loadHistorico()
    } catch (err) {
      const detail = err?.response?.data ? JSON.stringify(err.response.data) : err?.message || 'Erro inesperado.'
      setErro(`Não foi possível exportar a prescrição selecionada. ${detail}`)
    } finally {
      setHistoryExportingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">Prescrição inteligente</h2>
            <p className="text-gray-300 text-sm">Monte receitas personalizadas em poucos cliques. As sugestões seguem protocolos odontológicos usuais, podendo ser ajustadas antes de exportar.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="inner-tab" onClick={() => setShowClassPicker((v) => !v)}>
              Selecionar classe terapêutica
            </button>
            <button
              type="button"
              className="inner-tab"
              onClick={() => setShowMedicationPicker((v) => !v)}
              disabled={!selectedClass}
            >
              {selectedClass ? `Ver medicamentos de ${selectedClass.label}` : 'Escolher medicamento'}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => savePrescription()}
              disabled={!items.length || saving}
            >
              {saving ? 'Salvando…' : editingId ? 'Atualizar prescrição' : 'Salvar prescrição'}
            </button>
            {items.length > 0 && (
              <button type="button" className="btn" onClick={clearAll}>
                Limpar tudo
              </button>
            )}
            <button
              type="button"
              className="btn"
              onClick={exportToPdf}
              disabled={exporting || (!items.length && !editingId)}
            >
              {exporting ? 'Gerando PDF…' : 'Exportar em PDF'}
            </button>
          </div>
          {selectedClass && (
            <div className="text-sm text-gray-400">
              Classe selecionada: <span className="accent-text font-semibold">{selectedClass.label}</span>
            </div>
          )}
          {erro && (
            <div className="text-sm text-red-300 bg-red-600/10 border border-red-500/40 rounded-lg px-3 py-2">
              {erro}
            </div>
          )}
          {msg && (
            <div className="text-sm text-green-300 bg-green-600/10 border border-green-500/40 rounded-lg px-3 py-2">
              {msg}
            </div>
          )}
        </div>
      </div>

      {showClassPicker && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Escolha uma classe terapêutica</h3>
              <p className="text-gray-400 text-sm">Selecione a categoria desejada para visualizar medicamentos sugeridos automaticamente.</p>
            </div>
            <button type="button" className="btn" onClick={() => setShowClassPicker(false)}>Fechar</button>
          </div>
          <div className="grid gap-3 mt-4 md:grid-cols-2">
            {MED_CATEGORIES.map((clazz) => (
              <button
                key={clazz.id}
                type="button"
                className={`prescription-option${selectedClass?.id === clazz.id ? ' active' : ''}`}
                onClick={() => handleSelectClass(clazz)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-semibold text-white">{clazz.label}</h4>
                    <p className="text-gray-400 text-sm mt-1">{clazz.descricao}</p>
                  </div>
                  <span className="badge-neutral">{clazz.medicamentos.length} opções</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {showMedicationPicker && selectedClass && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Medicamentos de {selectedClass.label}</h3>
              <p className="text-gray-400 text-sm">Clique em adicionar para incluir o medicamento na prescrição. Os campos podem ser ajustados posteriormente.</p>
            </div>
            <button type="button" className="btn" onClick={() => setShowMedicationPicker(false)}>Fechar</button>
          </div>
          <div className="grid gap-3 mt-4">
            {selectedClass.medicamentos.map((med) => (
              <div key={med.id} className="prescription-med-card">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-semibold text-base">{med.nome}</h4>
                    <p className="text-gray-400 text-sm mt-1">{med.orientacoes}</p>
                  </div>
                  <button type="button" className="btn btn-primary sm:w-auto" onClick={() => handleAddMedication(med)}>
                    Adicionar à prescrição
                  </button>
                </div>
                <dl className="grid gap-2 sm:grid-cols-3 text-sm text-gray-300 mt-3">
                  <div>
                    <dt className="text-gray-400">Dose sugerida</dt>
                    <dd>{med.dose}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400">Frequência</dt>
                    <dd>{med.frequencia}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400">Duração</dt>
                    <dd>{med.duracao}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Prescrição atual</h3>
            {items.length > 0 && (
              <span className="badge-neutral">{items.length} medicamento(s)</span>
            )}
          </div>
          {items.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhum medicamento selecionado. Utilize os botões acima para montar a prescrição do paciente.</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.uid} className="prescription-entry">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="text-white font-semibold text-base">{item.nome}</h4>
                      <p className="text-sm text-gray-400">Classe: {item.classeNome}</p>
                    </div>
                    <button type="button" className="btn" onClick={() => handleRemove(item.uid)}>Remover</button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3 mt-3">
                    <label className="prescription-field">
                      <span>Dose</span>
                      <input
                        className="input"
                        value={item.dose}
                        onChange={(e) => handleItemChange(item.uid, 'dose', e.target.value)}
                      />
                    </label>
                    <label className="prescription-field">
                      <span>Frequência</span>
                      <input
                        className="input"
                        value={item.frequencia}
                        onChange={(e) => handleItemChange(item.uid, 'frequencia', e.target.value)}
                      />
                    </label>
                    <label className="prescription-field">
                      <span>Duração</span>
                      <input
                        className="input"
                        value={item.duracao}
                        onChange={(e) => handleItemChange(item.uid, 'duracao', e.target.value)}
                      />
                    </label>
                  </div>
                  <label className="prescription-field mt-3">
                    <span>Orientações ao paciente</span>
                    <textarea
                      className="input min-h-[90px]"
                      value={item.orientacoes}
                      onChange={(e) => handleItemChange(item.uid, 'orientacoes', e.target.value)}
                    />
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold text-white">Finalização</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="prescription-field">
              <span>Profissional responsável</span>
              <input className="input" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} />
            </label>
            <label className="prescription-field">
              <span>CRO</span>
              <input className="input" value={cro} onChange={(e) => setCro(e.target.value)} />
            </label>
          </div>
          <label className="prescription-field">
            <span>Observações adicionais</span>
            <textarea
              className="input min-h-[110px]"
              placeholder="Instruções complementares, orientações personalizadas ou recomendações pós-procedimento."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>
      </div>

      {(items.length > 0 || editingId) && (
        <div className="card prescription-preview">
          <h3 className="text-lg font-semibold text-white mb-3">Pré-visualização rápida</h3>
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
            {[
              `Clínica Odontológica\nData: ${today}`,
              `Paciente: ${pacienteNome}${idade ? ` — ${idade} anos` : ''}`,
              '',
              ...items.map((item, index) => `${index + 1}. ${item.nome}\n   Dose: ${item.dose}\n   Frequência: ${item.frequencia}\n   Duração: ${item.duracao}${item.orientacoes ? `\n   Orientações: ${item.orientacoes}` : ''}`),
              notes ? `\nObservações: ${notes}` : '',
              `\nProfissional: ${responsavel || '____________________'} — CRO ${cro || '__________'}`,
            ].filter(Boolean).join('\n')}
          </p>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Histórico de prescrições</h3>
            <p className="text-sm text-gray-400">Selecione uma prescrição anterior para reutilizar ou exportar novamente.</p>
          </div>
          <button type="button" className="btn" onClick={loadHistorico} disabled={loadingHistorico}>
            {loadingHistorico ? 'Atualizando…' : 'Atualizar lista'}
          </button>
        </div>
        {loadingHistorico ? (
          <div className="text-sm text-gray-400">Carregando prescrições salvas…</div>
        ) : historico.length === 0 ? (
          <div className="text-sm text-gray-400">Nenhuma prescrição salva ainda para este paciente.</div>
        ) : (
          <div className="space-y-3">
            {historico.map((prescricao) => (
              <div key={prescricao.id} className="prescription-entry">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="text-white font-semibold">Prescrição #{prescricao.id}</h4>
                    <p className="text-sm text-gray-400">
                      {new Date(prescricao.criado_em).toLocaleString('pt-BR')}
                      {prescricao.profissional ? ` • ${prescricao.profissional}` : ''}
                    </p>
                    <p className="text-xs text-gray-500">{prescricao.itens?.length || 0} medicamento(s)</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="btn btn-secondary" onClick={() => handleLoadFromHistory(prescricao)}>
                      Carregar
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => handleExportFromHistory(prescricao.id)}
                      disabled={historyExportingId === prescricao.id}
                    >
                      {historyExportingId === prescricao.id ? 'Exportando…' : 'Exportar PDF'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

