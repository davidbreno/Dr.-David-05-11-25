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
    <div className="login-page texture-grid">
      <button
        type="button"
        onClick={() => nav(-1)}
        className="login-page__back"
        aria-label="Voltar"
      >
        ←
      </button>

      <div className="login-card">
        <div className="login-card__hero">
          <div className="login-card__hero-illustration" aria-hidden="true">
            <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" role="presentation">
              <defs>
                <linearGradient id="login-sky" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="color-mix(in srgb, var(--accent) 20%, #081019 80%)" />
                </linearGradient>
                <linearGradient id="login-hill" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="color-mix(in srgb, var(--accent) 70%, #081019 30%)" />
                  <stop offset="100%" stopColor="color-mix(in srgb, var(--accent) 30%, #081019 70%)" />
                </linearGradient>
              </defs>
              <rect width="400" height="200" fill="url(#login-sky)" />
              <circle cx="300" cy="50" r="30" fill="rgba(255,255,255,0.4)" />
              <path d="M0 120 C80 80 120 150 200 120 C260 100 300 150 400 120 V200 H0 Z" fill="url(#login-hill)" />
              <path d="M40 125 L55 95 L70 130 L85 90 L100 140" stroke="rgba(18,24,33,0.4)" strokeWidth="6" strokeLinecap="round" fill="none" />
              <path d="M260 130 L275 90 L290 135 L305 92 L320 140" stroke="rgba(18,24,33,0.4)" strokeWidth="6" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <div className="login-card__hero-text">
            <h1>Bem-vindo de volta</h1>
            <p>Entre com suas credenciais para continuar acessando a clínica.</p>
          </div>
        </div>

        <div className="login-card__form">
          <h2>Login do usuário</h2>
          <form onSubmit={onSubmit} className="login-form">
            <label className="login-field">
              <span className="login-field__icon" aria-hidden="true">👤</span>
              <input
                className="login-field__input"
                placeholder="Usuário"
                type="text"
                value={form.username}
                onChange={(e)=>setForm(f=>({...f, username:e.target.value}))}
                autoFocus
              />
            </label>

            <label className="login-field">
              <span className="login-field__icon" aria-hidden="true">🔒</span>
              <input
                className="login-field__input"
                placeholder="Senha"
                type="password"
                value={form.password}
                onChange={(e)=>setForm(f=>({...f, password:e.target.value}))}
              />
            </label>

            {err && (
              <div className="login-error" role="alert">{err}</div>
            )}

            <div className="login-meta">
              <label className="login-remember">
                <input type="checkbox" disabled />
                <span>Lembrar</span>
              </label>
              <button type="button" className="login-forgot" disabled>
                Esqueceu a senha?
              </button>
            </div>

            <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
