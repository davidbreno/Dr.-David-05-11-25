import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import OdontogramaForm from './OdontogramaForm.jsx'

export default function OdontogramaEdit(){
  const nav = useNavigate(); const { id } = useParams()
  const [loading, setLoading] = useState(true); const [data, setData] = useState(null)
  useEffect(()=>{(async()=>{ const { data } = await api.get('/odontogramas/'+id+'/'); setData(data); setLoading(false) })()}, [id])
  async function onSubmit(form){ await api.patch('/odontogramas/'+id+'/', form); nav('/odontogramas') }
  if(loading) return <div>Carregando...</div>
  return (<div className="mx-auto max-w-2xl"><div className="card"><h1 className="mb-4 text-2xl font-semibold">Editar Odontograma</h1><OdontogramaForm initial={data} onSubmit={onSubmit} submitLabel="Salvar" /></div></div>)
}
