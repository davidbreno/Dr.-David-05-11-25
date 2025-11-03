import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import ProdutoForm from './ProdutoForm.jsx'

export default function ProdutoEdit(){
  const nav = useNavigate(); const { id } = useParams()
  const [loading, setLoading] = useState(true); const [data, setData] = useState(null)
  useEffect(()=>{(async()=>{ const { data } = await api.get('/produtos/'+id+'/'); setData(data); setLoading(false) })()}, [id])
  async function onSubmit(form){ await api.patch('/produtos/'+id+'/', form); nav('/produtos') }
  if(loading) return <div>Carregando...</div>
  return (<div className="mx-auto max-w-2xl"><div className="card"><h1 className="mb-4 text-2xl font-semibold">Editar Produto</h1><ProdutoForm initial={data} onSubmit={onSubmit} submitLabel="Salvar" /></div></div>)
}
