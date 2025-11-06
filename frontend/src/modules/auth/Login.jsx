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
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a4d68 0%, #1a5f7a 30%, #2d7fa0 60%, #88c9d4 100%)'
      }}
    >
      {/* Radial glow overlays */}
      <div 
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 20% 20%, rgba(100, 200, 255, 0.15) 0%, transparent 50%)'
        }}
      />
      <div 
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 80% 80%, rgba(100, 150, 255, 0.1) 0%, transparent 50%)'
        }}
      />

      <div className="mx-auto max-w-md w-full animate-fadeIn z-10 px-6">
        {/* Glass card with glow border */}
        <div className="relative">
          {/* Glow effect behind card */}
          <div 
            className="absolute -inset-1 rounded-[32px] opacity-60 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(100, 200, 255, 0.5), rgba(100, 150, 255, 0.3))',
              filter: 'blur(8px)'
            }}
          />
          
          {/* Main glass card */}
          <div 
            className="relative p-12 rounded-[32px]"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Logo circle */}
            <div className="flex justify-center mb-8">
              <div 
                className="flex items-center justify-center rounded-full overflow-hidden"
                style={{
                  width: '120px',
                  height: '120px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(100, 200, 255, 0.4)',
                  boxShadow: '0 0 20px rgba(100, 200, 255, 0.3), inset 0 0 20px rgba(100, 200, 255, 0.1)'
                }}
              >
                <img 
                  src="/logo com nome.png" 
                  alt="Logo" 
                  className="w-full h-full object-contain p-2"
                  style={{ filter: 'brightness(1.2)' }}
                />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Bem-vindo
            </h1>
            <p className="text-center mb-8" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Faça login para continuar
            </p>
          
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Username input */}
              <div>
                <div 
                  className="flex items-center gap-3 rounded-xl overflow-hidden transition-all"
                  style={{
                    background: 'rgba(20, 80, 120, 0.4)',
                    border: '1px solid rgba(100, 200, 255, 0.2)',
                    padding: '14px 16px'
                  }}
                >
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'rgba(100, 200, 255, 0.8)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input 
                    type="text"
                    placeholder="Digite seu usuário"
                    value={form.username} 
                    onChange={(e)=>setForm(f=>({...f, username:e.target.value}))} 
                    autoFocus
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400"
                  />
                </div>
              </div>
            
              {/* Password input */}
              <div>
                <div 
                  className="flex items-center gap-3 rounded-xl overflow-hidden transition-all"
                  style={{
                    background: 'rgba(20, 80, 120, 0.4)',
                    border: '1px solid rgba(100, 200, 255, 0.2)',
                    padding: '14px 16px'
                  }}
                >
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'rgba(100, 200, 255, 0.8)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input 
                    type="password"
                    placeholder="Digite sua senha"
                    value={form.password} 
                    onChange={(e)=>setForm(f=>({...f, password:e.target.value}))}
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400"
                  />
                </div>
              </div>
            
              {/* Remember me and Forgot password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded"
                    style={{
                      accentColor: '#7DEDDE'
                    }}
                  />
                  Lembrar-me
                </label>
                <a 
                  href="#" 
                  className="italic hover:underline"
                  style={{ color: '#7DEDDE' }}
                >
                  Esqueceu a senha?
                </a>
              </div>

              {err && (
                <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-sm text-red-300 flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {err}
                </div>
              )}
            
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 text-lg tracking-wide"
                style={{
                  background: 'rgba(20, 80, 120, 0.6)',
                  boxShadow: '0 0 20px rgba(125, 237, 222, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(125, 237, 222, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(30, 100, 140, 0.7)'
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(125, 237, 222, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(20, 80, 120, 0.6)'
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(125, 237, 222, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
                }}
              >
                {loading ? (
                  <>
                    <div className="spinner inline-block mr-2" style={{width: '20px', height: '20px', borderWidth: '2px'}}></div>
                    Entrando...
                  </>
                ) : (
                  'LOGIN'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
