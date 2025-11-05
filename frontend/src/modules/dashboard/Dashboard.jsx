import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPacientes: 0,
    pacientesHoje: 0,
    pacientesSemana: 0,
    pacientesMes: 0
  })
  const [recentPacientes, setRecentPacientes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    setLoading(true)
    try {
      const { data } = await api.get('/pacientes/')
      const pacientes = data.results ?? data
      
      // Calcular estatísticas
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      
      const umaSemanaAtras = new Date(hoje)
      umaSemanaAtras.setDate(hoje.getDate() - 7)
      
      const umMesAtras = new Date(hoje)
      umMesAtras.setMonth(hoje.getMonth() - 1)

      const pacientesHoje = pacientes.filter(p => {
        const dataCriacao = new Date(p.criado_em || p.created_at)
        return dataCriacao >= hoje
      }).length

      const pacientesSemana = pacientes.filter(p => {
        const dataCriacao = new Date(p.criado_em || p.created_at)
        return dataCriacao >= umaSemanaAtras
      }).length

      const pacientesMes = pacientes.filter(p => {
        const dataCriacao = new Date(p.criado_em || p.created_at)
        return dataCriacao >= umMesAtras
      }).length

      setStats({
        totalPacientes: pacientes.length,
        pacientesHoje,
        pacientesSemana,
        pacientesMes
      })

      // Últimos 5 pacientes
      setRecentPacientes(pacientes.slice(0, 5))
    } catch (e) {
      console.error('Erro ao carregar dashboard:', e)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className="card">
      <div className="flex items-center gap-4">
        <div style={{ 
          background: '#1a1b26', 
          padding: '32px', 
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '100px',
          minHeight: '100px'
        }}>
          <div style={{ transform: 'scale(1.8)' }}>
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <h3 className={`text-3xl font-bold ${color} mb-2`}>{value}</h3>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  )

  const MotivationalQuote = () => {
    const quotes = [
      "Um sorriso é a curva que endireita tudo.",
      "Cuide dos seus dentes, eles cuidarão do seu sorriso.",
      "A saúde bucal é parte fundamental da saúde geral.",
      "Sorria! É a segunda melhor coisa que você pode fazer com seus lábios.",
      "Dentes saudáveis, vida saudável.",
      "Prevenir é melhor que remediar.",
      "Seu sorriso é seu cartão de visitas.",
      "A higiene bucal começa em casa.",
      "Escove, use fio dental, sorria!",
      "Dentes fortes, confiança maior.",
      "A melhor maquiagem é um sorriso sincero.",
      "Cuide do seu sorriso hoje para sorrir amanhã.",
      "A saúde começa pela boca.",
      "Um sorriso vale mais que mil palavras.",
      "Dentes limpos, hálito fresco, vida melhor.",
      "Invista no seu sorriso, ele é único.",
      "A prevenção é o melhor tratamento.",
      "Sorrir faz bem para a alma e para a saúde.",
      "Dentes saudáveis refletem cuidado pessoal.",
      "Seu sorriso ilumina o mundo.",
      "Cuidar dos dentes é cuidar de si mesmo.",
      "A boca é o espelho da saúde.",
      "Sorria sempre, a vida é bela.",
      "Dentes bonitos, autoestima elevada.",
      "A saúde bucal não tem preço.",
      "Um sorriso confiante abre portas.",
      "Cuide bem dos seus dentes, eles são para a vida toda.",
      "A prevenção é o segredo do sorriso perfeito.",
      "Dentes cuidados, futuro garantido.",
      "Sorrir é contagiante, espalhe saúde.",
      "A odontologia transforma sorrisos e vidas.",
      "Seu sorriso merece atenção especial.",
      "Dentes fortes começam com bons hábitos.",
      "A saúde bucal é investimento, não gasto.",
      "Sorria mais, preocupe-se menos.",
      "Dentes limpos, coração feliz.",
      "A beleza de um sorriso está na saúde.",
      "Cuide dos seus dentes como cuida de si mesmo.",
      "Um sorriso saudável é um sorriso feliz.",
      "A prevenção salva sorrisos.",
      "Dentes bem cuidados duram para sempre.",
      "Sorrir é o melhor remédio.",
      "A saúde bucal é qualidade de vida.",
      "Seu sorriso é seu maior patrimônio.",
      "Dentes saudáveis, vida plena.",
      "A higiene bucal é um ato de amor próprio.",
      "Sorria! Você merece um sorriso perfeito.",
      "Dentes fortes, futuro brilhante.",
      "A saúde começa com um sorriso.",
      "Cuide do seu sorriso, ele é eterno."
    ]

    const [currentQuote, setCurrentQuote] = useState(0)

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentQuote(prev => (prev + 1) % quotes.length)
      }, 30000) // 30 segundos
      return () => clearInterval(timer)
    }, [])

    return (
      <div className="flex-1 flex items-center justify-center px-8">
        <p className="text-gray-400 text-sm italic text-center transition-opacity duration-1000" style={{ fontFamily: 'Georgia, serif' }}>
          "{quotes[currentQuote]}"
        </p>
      </div>
    )
  }

  const Clock = () => {
    const [time, setTime] = useState(new Date())

    useEffect(() => {
      const timer = setInterval(() => setTime(new Date()), 1000)
      return () => clearInterval(timer)
    }, [])

    const now = new Date()
    const nextYear = new Date(now.getFullYear() + 1, 0, 1)
    const diff = nextYear - now
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    const FlipCard = ({ value, label }) => (
      <div className="flex flex-col items-center">
        <div className="relative" style={{ 
          width: '50px', 
          height: '60px', 
          background: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 50%, #1a1a1a 100%)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '1px',
            background: 'rgba(0,0,0,0.5)'
          }}></div>
          <span style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: '#e0e0e0',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>
            {value.toString().padStart(2, '0')}
          </span>
        </div>
        <span className="mt-2 text-xs font-semibold" style={{ color: '#7DEDDE' }}>
          {label}
        </span>
      </div>
    )

    return (
      <div className="card flex items-center justify-center px-8">
        <div className="flex items-center justify-between w-full max-w-md">
          <FlipCard value={days} label="DIAS" />
          <FlipCard value={hours} label="HORAS" />
          <FlipCard value={minutes} label="MINUTOS" />
          <FlipCard value={seconds} label="SEGUNDOS" />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header com Frase Motivacional e Logo */}
      <div className="flex items-center justify-between mb-4">
        <MotivationalQuote />
        <img 
          src="/logo com nome.png" 
          alt="Logo" 
          className="h-16 object-contain flex-shrink-0 mr-8"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Pacientes"
          value={stats.totalPacientes}
          color="text-blue-400"
          subtitle="Cadastrados no sistema"
          icon={
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />

        {/* Novo Paciente Card */}
        <Link to="/pacientes/new" className="card transition-all cursor-pointer">
          <div className="flex items-center gap-4">
            <div style={{ 
              background: '#1a1b26', 
              padding: '32px', 
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '100px',
              minHeight: '100px'
            }}>
              <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">Novo Paciente</h3>
              <p className="text-sm text-gray-400">Cadastrar paciente</p>
            </div>
          </div>
        </Link>

        {/* Buscar Paciente Card */}
        <Link to="/pacientes" className="card transition-all cursor-pointer">
          <div className="flex items-center gap-4">
            <div style={{ 
              background: '#1a1b26', 
              padding: '32px', 
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '100px',
              minHeight: '100px'
            }}>
              <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">Buscar Paciente</h3>
              <p className="text-sm text-gray-400">Visualizar cadastros</p>
            </div>
          </div>
        </Link>

        {/* Card 4 - Relógio */}
        <Clock />
      </div>

      {/* Pacientes Recentes e Card D lado a lado */}
      <div className="flex gap-6 mt-6">
        {/* Recent Patients */}
        <div className="card w-1/2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pacientes Recentes
            </h2>
            <Link to="/pacientes" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
              Ver todos
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {recentPacientes.length > 0 ? (
            <div className="space-y-3">
              {recentPacientes.map((paciente) => (
                <Link 
                  key={paciente.id} 
                  to={`/pacientes/${paciente.id}/edit`}
                  className="flex items-center gap-4 p-4 rounded-lg bg-gray-800/30 border border-gray-700/50 hover:bg-gray-800/50 hover:border-blue-500/30 transition-all group"
                >
                  <div className="bg-blue-600/20 text-blue-400 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold flex-shrink-0">
                    {paciente.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                      {paciente.nome}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                      {paciente.email && (
                        <span className="flex items-center gap-1 truncate">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {paciente.email}
                        </span>
                      )}
                      {paciente.telefone && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {paciente.telefone}
                        </span>
                      )}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-lg">Nenhum paciente cadastrado ainda</p>
              <p className="text-sm mt-2">Comece adicionando seu primeiro paciente</p>
            </div>
          )}
        </div>

        {/* Card D - Gráfico */}
        <div className="card w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={[
                { month: 'Jan', value: 100 },
                { month: 'Feb', value: 120 },
                { month: 'Mar', value: 430 },
                { month: 'Apr', value: 250 },
                { month: 'May', value: 300 },
                { month: 'Jun', value: 520 },
                { month: 'Jul', value: 380 },
                { month: 'Aug', value: 430 },
                { month: 'Sep', value: 460 },
                { month: 'Oct', value: 200 },
                { month: 'Nov', value: 280 },
                { month: 'Dec', value: 320 }
              ]}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7DEDDE" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#7DEDDE" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                tickLine={false}
                axisLine={false}
                ticks={[0, 100, 200, 300, 400, 500]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Area 
                type="linear" 
                dataKey="value" 
                stroke="#7DEDDE" 
                strokeWidth={2}
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3 Cards embaixo - divididos conforme proporção do print */}
      <div className="flex gap-6 mt-6" style={{ height: 'calc(100vh - 650px)', minHeight: '250px' }}>
        {/* Card esquerdo - Gráfico de Área Comparativo */}
        <div className="card" style={{ flex: '0 0 20%' }}>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart
              data={[
                { name: 1, lastMonth: 30, thisMonth: 40 },
                { name: 2, lastMonth: 45, thisMonth: 55 },
                { name: 3, lastMonth: 35, thisMonth: 48 },
                { name: 4, lastMonth: 50, thisMonth: 60 },
                { name: 5, lastMonth: 42, thisMonth: 52 },
                { name: 6, lastMonth: 55, thisMonth: 65 },
                { name: 7, lastMonth: 48, thisMonth: 58 }
              ]}
              margin={{ top: 10, right: 5, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="lastMonth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF69B4" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#FF69B4" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="thisMonth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7DEDDE" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#7DEDDE" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <Area 
                type="linear" 
                dataKey="lastMonth" 
                stroke="#FF69B4" 
                strokeWidth={2}
                fill="url(#lastMonth)" 
              />
              <Area 
                type="linear" 
                dataKey="thisMonth" 
                stroke="#7DEDDE" 
                strokeWidth={2}
                fill="url(#thisMonth)" 
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-between px-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#FF69B4' }}></div>
              <span className="text-gray-400">Last Month</span>
              <span className="text-white font-semibold">$4,087</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#7DEDDE' }}></div>
              <span className="text-gray-400">This Month</span>
              <span className="text-white font-semibold">$5,506</span>
            </div>
          </div>
        </div>
        
        {/* Card central - Top Estoque */}
        <div className="card" style={{ flex: '1' }}>
          <h2 className="text-xl font-bold text-white mb-6">Top Estoque</h2>
          
          <div className="space-y-6">
            {/* Implantes */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-1 text-gray-400 font-semibold">01</div>
              <div className="col-span-4 text-white">Implantes</div>
              <div className="col-span-5">
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ 
                    width: '46%', 
                    background: 'linear-gradient(90deg, #ff75bfff 0%, #fca3cfff 100%)' 
                  }}></div>
                </div>
              </div>
              <div className="col-span-2 text-right">
                <span className="px-3 py-1 rounded-md text-sm font-semibold" style={{ 
                  border: '1px solid #f2c8ed',
                  color: '#f2c8ed'
                }}>46%</span>
              </div>
            </div>

            {/* Kit Cirúrgicos */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-1 text-gray-400 font-semibold">02</div>
              <div className="col-span-4 text-white">Kit Cirúrgicos</div>
              <div className="col-span-5">
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ 
                    width: '17%', 
                    background: 'linear-gradient(90deg, #4169E1 0%, #6495ED 100%)' 
                  }}></div>
                </div>
              </div>
              <div className="col-span-2 text-right">
                <span className="px-3 py-1 rounded-md text-sm font-semibold" style={{ 
                  border: '1px solid #4169E1',
                  color: '#6495ED'
                }}>17%</span>
              </div>
            </div>

            {/* Anestésicos */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-1 text-gray-400 font-semibold">03</div>
              <div className="col-span-4 text-white">Anestésicos</div>
              <div className="col-span-5">
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ 
                    width: '10%', 
                    background: 'linear-gradient(90deg, #00FFFF 0%, #7DEDDE 100%)' 
                  }}></div>
                </div>
              </div>
              <div className="col-span-2 text-right">
                <span className="px-3 py-1 rounded-md text-sm font-semibold" style={{ 
                  border: '1px solid #00FFFF',
                  color: '#7DEDDE'
                }}>10%</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Card direito - Gráfico de Barras */}
        <div className="card" style={{ flex: '0 0 20%' }}>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart
              data={[
                { name: 1, volume: 65, service: 45 },
                { name: 2, volume: 75, service: 35 },
                { name: 3, volume: 60, service: 50 },
                { name: 4, volume: 50, service: 40 },
                { name: 5, volume: 70, service: 48 },
                { name: 6, volume: 45, service: 55 },
                { name: 7, volume: 80, service: 60 }
              ]}
              margin={{ top: 10, right: 5, left: 0, bottom: 0 }}
              barGap={4}
            >
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7DEDDE" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#7DEDDE" stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id="serviceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4A5568" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#4A5568" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <Bar 
                dataKey="volume" 
                fill="url(#volumeGradient)" 
                radius={[4, 4, 0, 0]}
                maxBarSize={20}
              />
              <Bar 
                dataKey="service" 
                fill="url(#serviceGradient)" 
                radius={[4, 4, 0, 0]}
                maxBarSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-between px-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#7DEDDE' }}></div>
              <span className="text-gray-400">Volume</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#4A5568' }}></div>
              <span className="text-gray-400">Service</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
