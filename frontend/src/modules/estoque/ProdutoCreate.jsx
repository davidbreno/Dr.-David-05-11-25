import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import ProdutoForm from './ProdutoForm.jsx'

export default function ProdutoCreate(){
  const nav = useNavigate()
  async function onSubmit(form){ await api.post('/produtos/', form); nav('/produtos') }
  return (<div className="mx-auto max-w-2xl"><div className="card"><h1 className="mb-4 text-2xl font-semibold">Novo Produto</h1><ProdutoForm onSubmit={onSubmit} submitLabel="Criar" /></div></div>)
}
