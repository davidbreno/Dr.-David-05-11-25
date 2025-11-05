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
  const [loading, setLoading] = useState(false)

  async function handle(e){
    e.preventDefault()
    setErr('')
    if(!form.nome || !form.cpf){ setErr('Nome e CPF são obrigatórios'); return }
    setLoading(true)
    try {
      await onSubmit(form)
    } catch (e) {
      setErr('Erro ao salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handle} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            <span className="text-red-400">*</span> Nome Completo
          </label>
          <input 
            className="input" 
            placeholder="Digite o nome completo"
            value={form.nome} 
            onChange={(e)=>setForm(f=>({...f, nome:e.target.value}))}
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">
            <span className="text-red-400">*</span> CPF
          </label>
          <input 
            className="input" 
            placeholder="000.000.000-00"
            value={form.cpf} 
            onChange={(e)=>setForm(f=>({...f, cpf:e.target.value}))}
            required
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
            E-mail
          </label>
          <input 
            className="input" 
            type="email"
            placeholder="exemplo@email.com"
            value={form.email} 
            onChange={(e)=>setForm(f=>({...f, email:e.target.value}))}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Telefone
          </label>
          <input 
            className="input" 
            placeholder="(00) 00000-0000"
            value={form.telefone} 
            onChange={(e)=>setForm(f=>({...f, telefone:e.target.value}))}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Endereço
        </label>
        <textarea 
          className="input" 
          rows="2" 
          placeholder="Rua, número, bairro, cidade..."
          value={form.endereco} 
          onChange={(e)=>setForm(f=>({...f, endereco:e.target.value}))}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Observações
        </label>
        <textarea 
          className="input" 
          rows="4" 
          placeholder="Informações adicionais sobre o paciente..."
          value={form.observacoes} 
          onChange={(e)=>setForm(f=>({...f, observacoes:e.target.value}))}
        />
      </div>

      {err && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-sm text-red-300 flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {err}
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t border-gray-700">
        <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
          {loading ? (
            <>
              <div className="spinner inline-block mr-2" style={{width: '20px', height: '20px', borderWidth: '2px'}}></div>
              Salvando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
