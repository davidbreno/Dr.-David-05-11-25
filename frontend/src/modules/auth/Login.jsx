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
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card w-full max-w-md">
        <div className="flex flex-col items-center gap-3 mb-6">
          <img src="/logo com nome.png" alt="Logo" className="w-28 h-28 object-contain" />
          <h1 className="text-2xl font-semibold text-white">Bem-vindo</h1>
          <p className="text-gray-300">Faça login para continuar</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Usuário</label>
            <input
              className="input"
              placeholder="Digite seu usuário"
              value={form.username}
              onChange={(e)=>setForm(f=>({...f, username:e.target.value}))}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-2">Senha</label>
            <input
              type="password"
              className="input"
              placeholder="Digite sua senha"
              value={form.password}
              onChange={(e)=>setForm(f=>({...f, password:e.target.value}))}
            />
          </div>

          {err && (
            <div className="bg-red-900/20 border border-red-700/50 text-red-300 text-sm rounded px-3 py-2">{err}</div>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
