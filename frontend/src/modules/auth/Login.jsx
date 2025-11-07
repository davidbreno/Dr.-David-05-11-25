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
    <div className="relative min-h-screen flex items-center justify-center px-6 texture-grid overflow-hidden">
      {/* Barra superior com voltar */}
      <button
        type="button"
        onClick={() => nav(-1)}
        className="absolute left-4 top-4 text-gray-300 hover:text-white text-2xl"
        aria-label="Voltar"
      >
        ←
      </button>

      {/* Conteúdo central com borda glass/néon */}
      <div className="w-full max-w-md glass-outline px-8 py-8 min-h-[460px]">
        <div className="relative z-10">
          <h1 className="text-center text-white text-2xl font-semibold mb-6">Login</h1>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="bg-[#2A2B36]/80 rounded-2xl px-4 py-3.5 border border-white/10">
              <input
                className="w-full bg-transparent outline-none text-gray-100 placeholder-gray-400"
                placeholder="Email Address"
                type="text"
                value={form.username}
                onChange={(e)=>setForm(f=>({...f, username:e.target.value}))}
                autoFocus
              />
            </div>
            <div className="bg-[#2A2B36]/80 rounded-2xl px-4 py-3.5 border border-white/10">
              <input
                className="w-full bg-transparent outline-none text-gray-100 placeholder-gray-400"
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(e)=>setForm(f=>({...f, password:e.target.value}))}
              />
            </div>

            {err && (
              <div className="bg-red-900/20 border border-red-700/50 text-red-300 text-sm rounded px-3 py-2">{err}</div>
            )}

            <div className="flex items-center gap-3">
              <button type="submit" className="btn-cm flex-1" disabled={loading}>
                {loading ? 'Entrando...' : 'Login'}
              </button>
              <div
                className="w-11 h-11 rounded-full"
                style={{
                  backgroundImage: 'linear-gradient(180deg, #22D3EE 0%, #8B5CF6 50%, #EC4899 100%)',
                  display: 'grid', placeItems: 'center'
                }}
                title="Login com biometria (em breve)"
              >
                <span className="text-white/90">🔒</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
