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
    <div className="mx-auto max-w-md">
      <div className="card">
        <h1 className="mb-4 text-2xl font-semibold">Entrar</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm">Usuário</label>
            <input className="input" value={form.username} onChange={(e)=>setForm(f=>({...f, username:e.target.value}))} autoFocus />
          </div>
          <div>
            <label className="mb-1 block text-sm">Senha</label>
            <input className="input" type="password" value={form.password} onChange={(e)=>setForm(f=>({...f, password:e.target.value}))} />
          </div>
          {err && <div className="text-sm text-red-600">{err}</div>}
          <button className="btn btn-primary w-full" disabled={loading}>{loading? 'Entrando...' : 'Entrar'}</button>
        </form>
      </div>
    </div>
  )
}
