import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'

export default function Login() {
  const nav = useNavigate()
  const loc = useLocation()
  const { login, loading } = useAuth()
  const [form, setForm] = useState({ username: '', password: '' })
  const [err, setErr] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    try {
      const ok = await login(form.username, form.password)
      if (ok) {
        const dest = loc.state?.from?.pathname || '/'
        nav(dest, { replace: true })
      }
    } catch (e) {
      setErr('Credenciais inválidas')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="mx-auto max-w-md w-full animate-fadeIn">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
            Clínica Digital
          </h1>
          <p className="text-gray-400">Gestão odontológica profissional</p>
        </div>
        
        <div className="card">
          <h2 className="mb-6 text-2xl font-bold text-white text-center">Bem-vindo de volta</h2>
          
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Usuário
              </label>
              <input 
                className="input" 
                placeholder="Digite seu usuário"
                value={form.username} 
                onChange={(e)=>setForm(f=>({...f, username:e.target.value}))} 
                autoFocus 
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Senha
              </label>
              <input 
                className="input" 
                type="password"
                placeholder="Digite sua senha"
                value={form.password} 
                onChange={(e)=>setForm(f=>({...f, password:e.target.value}))} 
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
            
            <button className="btn btn-primary w-full text-lg py-3" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner inline-block mr-2" style={{width: '20px', height: '20px', borderWidth: '2px'}}></div>
                  Entrando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Entrar
                </>
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center text-gray-500 text-sm mt-6">
          Sistema de gestão odontológica v1.0
        </p>
      </div>
    </div>
  )
}
