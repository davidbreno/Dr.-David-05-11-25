import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import PacienteForm from './PacienteForm.jsx'

export default function PacienteEdit(){
  const nav = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(()=>{
    async function load(){
      const { data } = await api.get(`/pacientes/${id}/`)
      setData(data); setLoading(false)
    }
    load()
  }, [id])

  async function onSubmit(form){
    await api.patch(`/pacientes/${id}/`, form)
    nav('/pacientes')
  }

  if(loading) return <div>Carregando...</div>
  return (
    <div className="mx-auto max-w-2xl">
      <div className="card">
        <h1 className="mb-4 text-2xl font-semibold">Editar Paciente</h1>
        <PacienteForm initial={data} onSubmit={onSubmit} submitLabel="Salvar" />
      </div>
    </div>
  )
}
