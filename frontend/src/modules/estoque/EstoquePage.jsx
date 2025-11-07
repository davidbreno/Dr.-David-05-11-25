import React, { useEffect, useMemo, useState } from 'react'

const CATEGORY_CONFIG = {
  implante: {
    label: 'Implante',
    headline: 'Estoque de implante',
    helper: 'Cadastre medidas, quantidades e marcas para acompanhar o estoque cirúrgico.',
    empty: 'Nenhum implante cadastrado ainda.',
    fields: [
      {
        name: 'tipo',
        label: 'Tipo',
        type: 'select',
        options: ['CMI', 'HE', 'HI', 'Tapa implante'],
        placeholder: 'Selecione o tipo',
      },
      {
        name: 'comprimento',
        label: 'Comprimento (mm)',
        type: 'text',
        placeholder: 'Ex: 11',
      },
      {
        name: 'diametro',
        label: 'Diâmetro (mm)',
        type: 'text',
        placeholder: 'Ex: 3.75',
      },
      {
        name: 'quantidade',
        label: 'Quantidade',
        type: 'number',
        placeholder: '0',
      },
      {
        name: 'marca',
        label: 'Marca',
        type: 'text',
        placeholder: 'Ex: Neodent',
      },
    ],
    summary: (item) => {
      const medidas = [item.comprimento ? `${item.comprimento} mm` : null, item.diametro ? `x ${item.diametro} mm` : null]
        .filter(Boolean)
        .join(' ')
        .trim()
      return `${item.tipo || 'Implante'}${medidas ? ` · ${medidas}` : ''}`
    },
    details: (item) => [
      { label: 'Quantidade', value: item.quantidade || '—' },
      { label: 'Marca', value: item.marca || '—' },
    ],
    badge: 'Implante',
  },
  cirurgia: {
    label: 'Cirurgia',
    headline: 'Materiais de cirurgia',
    helper: 'Cadastre fios, instrumentais e demais itens cirúrgicos com observações importantes.',
    empty: 'Nenhum material cirúrgico registrado ainda.',
    fields: [
      {
        name: 'nome',
        label: 'Nome do material',
        type: 'text',
        placeholder: 'Ex: Sutura nylon 4-0',
      },
      {
        name: 'quantidade',
        label: 'Quantidade',
        type: 'number',
        placeholder: '0',
      },
      {
        name: 'observacoes',
        label: 'Observações',
        type: 'textarea',
        placeholder: 'Validade, fornecedor, lote, etc. (opcional)',
      },
    ],
    summary: (item) => item.nome || 'Item de cirurgia',
    details: (item) => [
      { label: 'Quantidade', value: item.quantidade || '—' },
      { label: 'Observações', value: item.observacoes || '—' },
    ],
    badge: 'Cirurgia',
  },
  dentistica: {
    label: 'Dentística',
    headline: 'Materiais de dentística',
    helper: 'Controle resinas, adesivos e demais materiais restauradores.',
    empty: 'Nenhum material registrado no momento.',
    fields: [
      {
        name: 'nome',
        label: 'Nome do material',
        type: 'text',
        placeholder: 'Ex: Resina A2',
      },
      {
        name: 'quantidade',
        label: 'Quantidade',
        type: 'number',
        placeholder: '0',
      },
      {
        name: 'lote',
        label: 'Cor / Lote',
        type: 'text',
        placeholder: 'Ex: A2, B1, 3M',
      },
      {
        name: 'observacoes',
        label: 'Observações',
        type: 'textarea',
        placeholder: 'Validade, uso clínico, reposição prevista, etc.',
      },
    ],
    summary: (item) => item.nome || 'Material odontológico',
    details: (item) => [
      { label: 'Quantidade', value: item.quantidade || '—' },
      { label: 'Cor / Lote', value: item.lote || '—' },
      { label: 'Observações', value: item.observacoes || '—' },
    ],
    badge: 'Dentística',
  },
}

const INITIAL_ITEMS = {
  implante: [
    {
      id: 'impl-1',
      tipo: 'HI',
      comprimento: '11',
      diametro: '3',
      quantidade: '25',
      marca: 'Neodent',
    },
    {
      id: 'impl-2',
      tipo: 'HE',
      comprimento: '10',
      diametro: '3.5',
      quantidade: '41',
      marca: 'Straumann',
    },
  ],
  cirurgia: [],
  dentistica: [],
}

const createInitialForm = (category) => {
  const config = CATEGORY_CONFIG[category]
  return config.fields.reduce((acc, field) => {
    acc[field.name] = ''
    return acc
  }, {})
}

const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export default function EstoquePage() {
  const [activeTab, setActiveTab] = useState('implante')
  const [items, setItems] = useState(INITIAL_ITEMS)
  const [formState, setFormState] = useState(createInitialForm('implante'))
  const [editingId, setEditingId] = useState(null)
  const [feedback, setFeedback] = useState('')

  const config = useMemo(() => CATEGORY_CONFIG[activeTab], [activeTab])

  useEffect(() => {
    setFormState(createInitialForm(activeTab))
    setEditingId(null)
    setFeedback('')
  }, [activeTab])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextItems = { ...items }
    const entry = { ...formState }

    if (editingId) {
      entry.id = editingId
      nextItems[activeTab] = nextItems[activeTab].map((item) => (item.id === editingId ? entry : item))
      setFeedback('Item atualizado com sucesso.')
    } else {
      entry.id = generateId()
      nextItems[activeTab] = [...nextItems[activeTab], entry]
      setFeedback('Item adicionado ao estoque.')
    }

    setItems(nextItems)
    setFormState(createInitialForm(activeTab))
    setEditingId(null)
  }

  const handleEdit = (item) => {
    setFormState(config.fields.reduce((acc, field) => ({ ...acc, [field.name]: item[field.name] || '' }), {}))
    setEditingId(item.id)
    setFeedback('')
  }

  const handleDelete = (id) => {
    setItems((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].filter((item) => item.id !== id),
    }))
    setEditingId((current) => (current === id ? null : current))
    setFeedback('Item removido do estoque.')
  }

  return (
    <div className="estoque-page">
      <div className="estoque-shell">
        <section className="estoque-hero">
          <div>
            <h1>Controle de Estoque</h1>
            <p>Organize materiais por especialidade, acompanhe quantidades e mantenha o estoque sempre atualizado.</p>
          </div>
          <div className="estoque-tabs" role="tablist">
            {Object.entries(CATEGORY_CONFIG).map(([key, value]) => (
              <button
                key={key}
                type="button"
                className={`estoque-tab ${activeTab === key ? 'active' : ''}`}
                onClick={() => setActiveTab(key)}
                role="tab"
                aria-selected={activeTab === key}
              >
                {value.label}
              </button>
            ))}
          </div>
        </section>

        <section className="estoque-content">
          <div className="estoque-form-card">
            <header className="estoque-form-header">
              <div>
                <span className="estoque-badge">{config.badge}</span>
                <h2>{config.headline}</h2>
              </div>
              <p>{config.helper}</p>
            </header>
            <form className="estoque-form" onSubmit={handleSubmit}>
              {config.fields.map((field) => {
                const commonProps = {
                  id: `${activeTab}-${field.name}`,
                  name: field.name,
                  value: formState[field.name] ?? '',
                  onChange: handleChange,
                  placeholder: field.placeholder,
                  className: 'estoque-input',
                }

                return (
                  <label key={field.name} className="estoque-field">
                    <span>{field.label}</span>
                    {field.type === 'textarea' ? (
                      <textarea {...commonProps} rows={3} />
                    ) : field.type === 'select' ? (
                      <select {...commonProps}>
                        <option value="">Selecione</option>
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input {...commonProps} type={field.type} />
                    )}
                  </label>
                )
              })}
              <button type="submit" className="estoque-primary-button">
                {editingId ? 'Salvar alterações' : 'Adicionar ao estoque'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="estoque-secondary-button"
                  onClick={() => {
                    setFormState(createInitialForm(activeTab))
                    setEditingId(null)
                    setFeedback('')
                  }}
                >
                  Cancelar edição
                </button>
              )}
              {feedback && <p className="estoque-feedback">{feedback}</p>}
            </form>
          </div>

          <div className="estoque-items">
            <header className="estoque-items-header">
              <h3>Itens cadastrados</h3>
              <p>Atualize, edite ou remova itens conforme o consumo da clínica.</p>
            </header>
            {items[activeTab].length === 0 ? (
              <div className="estoque-empty">{config.empty}</div>
            ) : (
              <div className="estoque-items-grid">
                {items[activeTab].map((item) => (
                  <article key={item.id} className="estoque-item-card">
                    <div className="estoque-item-header">
                      <div>
                        <span className="estoque-item-title">{config.summary(item)}</span>
                      </div>
                      <div className="estoque-item-icon" aria-hidden="true">
                        🦷
                      </div>
                    </div>
                    <ul className="estoque-item-details">
                      {config.details(item).map((detail) => (
                        <li key={detail.label}>
                          <span>{detail.label}</span>
                          <strong>{detail.value}</strong>
                        </li>
                      ))}
                    </ul>
                    <div className="estoque-item-actions">
                      <button type="button" className="estoque-chip" onClick={() => handleEdit(item)}>
                        Editar
                      </button>
                      <button type="button" className="estoque-inline" onClick={() => handleDelete(item.id)}>
                        Excluir
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
