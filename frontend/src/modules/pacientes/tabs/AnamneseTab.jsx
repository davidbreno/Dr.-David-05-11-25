import React, { useEffect, useState } from 'react'
import { api } from '../../api/client.js'

export default function AnamneseTab({ pacienteId, pacienteNome }){
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [erro, setErro] = useState('')
  const [recId, setRecId] = useState(null)
  const [f, setF] = useState({
    paciente: pacienteId,
    queixa_principal: '',
    antecedentes_medicos: '',
    alergias: '',
    medicamentos: '',
    possui_diabetes: false,
    possui_hipertensao: false,
    cardiopatia: false,
    asma: false,
    hemorragias: false,
    anestesia_reacao: false,
    fuma: false,
    gravida: false,
    pressao_sistolica: '',
    pressao_diastolica: '',
    batimentos: '',
    outros: '',
  })

  useEffect(()=>{ load() }, [pacienteId])

  async function load(){
    setLoading(true); setErro(''); setMsg('')
    try{
      const { data } = await api.get(`/pacientes/anamneses/?paciente=${pacienteId}`)
      const item = data.results ? data.results[0] : data[0]
      if(item){ setRecId(item.id); setF({ ...f, ...item }) }
    }catch(e){ setErro('Não foi possível carregar a anamnese.') }
    finally{ setLoading(false) }
  }

  async function save(){
    setSaving(true); setErro(''); setMsg('')
    try{
      const body = sanitize(f)
      if(recId){
        const { data } = await api.patch(`/pacientes/anamneses/${recId}/`, body)
        setMsg('Anamnese atualizada com sucesso.')
        setRecId(data.id)
      }else{
        const { data } = await api.post(`/pacientes/anamneses/`, body)
        setRecId(data.id)
        setMsg('Anamnese salva com sucesso.')
      }
      // Notifica outras telas (ex.: resumo na aba "sobre")
      window.dispatchEvent(new CustomEvent('anamnese:saved', { detail: { pacienteId } }))
    }catch(e){
      const msg = e?.response?.data ? formatErrors(e.response.data) : 'Falha ao salvar. Verifique os campos e tente novamente.'
      setErro(msg)
    }finally{ setSaving(false) }
  }

  function sanitize(x){
    const s = { ...x }
    ;['pressao_sistolica','pressao_diastolica','batimentos'].forEach(k=>{
      s[k] = s[k] === '' || s[k] === null ? null : Number(s[k])
    })
    return s
  }

  function formatErrors(data){
    if(typeof data === 'string') return data
    if(Array.isArray(data)) return data.join(', ')
    const msgs = []
    for(const k in data){
      const v = data[k]
      if(Array.isArray(v)) msgs.push(`${k}: ${v.join(' ')}`)
      else if(typeof v === 'string') msgs.push(`${k}: ${v}`)
    }
    return msgs.join(' | ') || 'Falha ao salvar.'
  }

  function setField(k, v){ setF(s=>({ ...s, [k]: v })) }

  if(loading) return <div className="card"><div className="flex justify-center py-8"><div className="spinner"/></div></div>

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-4">Anamnese de {pacienteNome}</h2>

        <Section title="Queixa principal">
          <textarea className="input min-h-[90px]" value={f.queixa_principal} onChange={e=>setField('queixa_principal', e.target.value)} />
        </Section>

        <Section title="Antecedentes médicos">
          <textarea className="input min-h-[90px]" value={f.antecedentes_medicos} onChange={e=>setField('antecedentes_medicos', e.target.value)} />
        </Section>

        <div className="grid gap-4 md:grid-cols-2">
          <Section title="Alergias">
            <textarea className="input min-h-[90px]" value={f.alergias} onChange={e=>setField('alergias', e.target.value)} />
          </Section>
          <Section title="Medicações em uso">
            <textarea className="input min-h-[90px]" value={f.medicamentos} onChange={e=>setField('medicamentos', e.target.value)} />
          </Section>
        </div>

        <Section title="Condições">
          <div className="grid grid-cols-2 gap-3">
            {[
              ['possui_diabetes','Diabetes'],
              ['possui_hipertensao','Hipertensão'],
              ['cardiopatia','Cardiopatia'],
              ['asma','Asma'],
              ['hemorragias','Tendência a hemorragias'],
              ['anestesia_reacao','Reação à anestesia'],
              ['fuma','Fuma'],
              ['gravida','Grávida'],
            ].map(([k,label])=> (
              <label key={k} className="flex items-center gap-2 text-gray-200">
                <input type="checkbox" className="checkbox" checked={!!f[k]} onChange={e=>setField(k, e.target.checked)} />
                {label}
              </label>
            ))}
          </div>
        </Section>

        <Section title="Sinais vitais">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">PA Sistólica</div>
              <input className="input" type="number" value={f.pressao_sistolica ?? ''} onChange={e=>setField('pressao_sistolica', e.target.value)} />
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">PA Diastólica</div>
              <input className="input" type="number" value={f.pressao_diastolica ?? ''} onChange={e=>setField('pressao_diastolica', e.target.value)} />
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Batimentos</div>
              <input className="input" type="number" value={f.batimentos ?? ''} onChange={e=>setField('batimentos', e.target.value)} />
            </div>
          </div>
        </Section>

        <Section title="Outros">
          <textarea className="input min-h-[90px]" value={f.outros} onChange={e=>setField('outros', e.target.value)} />
        </Section>

        <div className="flex items-center gap-3">
          <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>{saving? 'Salvando...' : 'Salvar anamnese'}</button>
          {msg && <span className="text-green-400">{msg}</span>}
          {erro && <span className="text-red-400">{erro}</span>}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-2">Dicas rápidas</h3>
        <ul className="list-disc list-inside text-gray-300 space-y-2 text-sm">
          <li>Marque condições relevantes e descreva detalhes em "Antecedentes".</li>
          <li>Preencha PA e batimentos sempre que possível.</li>
          <li>Use "Outros" para observações adicionais.</li>
        </ul>
      </div>
    </div>
  )
}

function Section({ title, children }){
  return (
    <div className="mb-5">
      <div className="text-sm text-gray-400 mb-2">{title}</div>
      {children}
    </div>
  )
}
