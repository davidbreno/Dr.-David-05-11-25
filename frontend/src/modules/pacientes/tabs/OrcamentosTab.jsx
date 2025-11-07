import React, { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../../api/client'
import { proceduresCatalog, filterProcedures } from '../../orcamentos/proceduresCatalog.js'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

// deslocamento vertical aplicado aos números (em px)
const NUMBERS_OFFSET_Y = -48 // deslocamento apenas VISUAL

// Imagem base do odontograma (somente visual)
function OdontogramaSvg(){
  return (
    <img src="/odontograma.svg" alt="Odontograma" className="w-full h-auto pointer-events-none select-none block relative z-10" />
  )
}

// Camada opcional apenas visual dos números (não intercepta clique)
function NumbersVisual(){
  const [markup, setMarkup] = useState('')
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch('/numeros_dentes.svg', { cache: 'no-store' })
        if (!active) return
        if (res.ok) setMarkup(await res.text())
      } catch {/* ignore */}
    })()
    return () => { active = false }
  }, [])
  if (!markup) return null
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-visible" style={{ zIndex: 20 }}>
      <style>{`
        /* números mais destacados na cor da borda lateral (#C0C0C0) */
        .og-numbers text{ fill: #C0C0C0 !important; stroke: rgba(0,0,0,.35); stroke-width: 1; paint-order: stroke fill; }
        .og-numbers rect{ fill: transparent !important; stroke: transparent !important; }
      `}</style>
      <div className="absolute inset-0 og-numbers" style={{ transform: `translateY(${NUMBERS_OFFSET_Y}px)` }}
           dangerouslySetInnerHTML={{ __html: markup }} />
    </div>
  )
}

// Hitboxes baseados nos números (garante clique mesmo que o overlay não tenha ids)
function NumbersHitboxes({ selected, onToggle }){
  const wrapperRef = useRef(null)
  const svgRef = useRef(null)
  const [markup, setMarkup] = useState('')
  const [boxes, setBoxes] = useState([])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch('/numeros_dentes.svg', { cache: 'no-store' })
        if (!active) return
        if (res.ok) setMarkup(await res.text())
      } catch {/* ignore */}
    })()
    return () => { active = false }
  }, [])

  const recalc = () => {
    if (!wrapperRef.current || !svgRef.current) return
    const wrapperRect = wrapperRef.current.getBoundingClientRect()
    const texts = svgRef.current.querySelectorAll('text')
    const next = []
    texts.forEach((el) => {
      const t = (el.textContent || '').trim()
      const n = Number(t)
      if (!Number.isFinite(n)) return
      const r = el.getBoundingClientRect()
      const padX = 16
      const padY = 18
      next.push({
        n,
        left: r.left - wrapperRect.left - padX,
        top: r.top - wrapperRect.top - padY,
        width: r.width + padX * 2,
        height: r.height + padY * 2,
      })
    })
    setBoxes(next)
  }

  useEffect(() => {
    if (!markup) return
    const id = requestAnimationFrame(recalc)
    const ro = new ResizeObserver(() => recalc())
    if (wrapperRef.current) ro.observe(wrapperRef.current)
    window.addEventListener('resize', recalc)
    return () => { cancelAnimationFrame(id); ro.disconnect(); window.removeEventListener('resize', recalc) }
  }, [markup])

  if (!markup) return null
  return (
    <div ref={wrapperRef} className="absolute inset-0" style={{ zIndex: 60 }}>
      {/* SVG invisível apenas para medir posições (mesmo offset dos números visíveis) */}
      <div
        ref={svgRef}
        className="absolute inset-0 opacity-0 pointer-events-none og-numbers"
        style={{ transform: `translateY(${NUMBERS_OFFSET_Y}px)` }}
        dangerouslySetInnerHTML={{ __html: markup }}
      />
      {/* Botões de clique */}
      {boxes.map((b) => (
        <button
          key={b.n}
          type="button"
          title={`Dente ${b.n}`}
          onClick={() => onToggle(b.n)}
          className="absolute rounded-md outline-none"
          style={{ left: b.left, top: b.top, width: b.width, height: b.height }}
        />
      ))}
    </div>
  )
}

function OdontogramaOverlay({ selected, onToggle }){
  const containerRef = useRef(null)
  const mappingRef = useRef({}) // number -> HTMLElement
  const [svgMarkup, setSvgMarkup] = useState('')
  const [autoMapped, setAutoMapped] = useState(false)

  // tenta carregar o overlay pronto (contornos por dente)
  useEffect(() => {
    let active = true
    async function load() {
      try {
        // 1) overlay com contornos reais (preferido)
        const try1 = await fetch('/odontogramaopacidade.svg', { cache: 'no-store' })
        if (!active) return
        if (try1.ok) {
          setSvgMarkup(await try1.text())
          return
        }
        // 2) overlay normalizado por dente (fallback)
        const try0 = await fetch('/odontograma-overlay-grouped.svg', { cache: 'no-store' })
        if (!active) return
        if (try0.ok) {
          setSvgMarkup(await try0.text())
          return
        }
        // 3) overlay legado
        const try2 = await fetch('/odontograma-overlay.svg', { cache: 'no-store' })
        if (!active) return
        if (try2.ok) setSvgMarkup(await try2.text())
        else setSvgMarkup('')
      } catch {
        setSvgMarkup('')
      }
    }
    load()
    return () => { active = false }
  }, [])

  // depois que o SVG é inserido no DOM, mapeia cada dente pelo id
  useEffect(() => {
    if (!containerRef.current) return
  const root = containerRef.current
    // garantir que o <svg> do overlay ocupe exatamente o mesmo box da base (100% x 100%)
    const svgEl = root.querySelector('svg')
    if (svgEl) {
      svgEl.style.width = '100%'
      svgEl.style.height = '100%'
      svgEl.style.display = 'block'
      svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet')
      // marca o svg raiz para escopar estilos
      try { svgEl.classList.add('og-overlay-root') } catch { /* ignore */ }
      try {
        if (!svgEl.getAttribute('viewBox')) {
          const bb = svgEl.getBBox()
          if (bb && bb.width && bb.height) {
            svgEl.setAttribute('viewBox', `${bb.x} ${bb.y} ${bb.width} ${bb.height}`)
          }
        }
      } catch { /* alguns navegadores podem não permitir getBBox aqui */ }

      // Remover/neutralizar opacidade embutida no SVG (ex.: style="opacity: .02;")
      // Isso evita que o contorno vermelho fique quase invisível por herdar a opacidade do ancestral.
      try {
        // 1) Atributo de estilo inline contendo 'opacity'
        const styled = root.querySelectorAll('[style]')
        styled.forEach((el) => {
          const st = el.style
          if (!st) return
          // Se houver opacity definida, força para 1
          if (st.opacity && st.opacity !== '') {
            st.opacity = '1'
          }
          // Alguns editores podem definir 'fill-opacity' ou 'stroke-opacity'
          if (st.fillOpacity && st.fillOpacity !== '') st.fillOpacity = '1'
          if (st.strokeOpacity && st.strokeOpacity !== '') st.strokeOpacity = '1'
        })
        // 2) Atributo 'opacity' direto
        const attrOpacity = root.querySelectorAll('[opacity]')
        attrOpacity.forEach((el) => {
          el.setAttribute('opacity', '1')
        })
      } catch { /* ignore */ }
    }
  const map = {}
  const all = root.querySelectorAll('[id]')
    // aceita padrões comuns e também ids que contenham um número FDI (11..48)
    const rxCommon = /(tooth-|dente-|t)(\d{1,2})$/i
    all.forEach((el) => {
      let nFound = null
      const id = el.id || ''
      const m1 = rxCommon.exec(id)
      if (m1) nFound = Number(m1[2])
      if (nFound == null) {
        const anyNums = id.match(/\d{2}/g)
        if (anyNums) {
          for (const s of anyNums) {
            const v = Number(s)
            if (v >= 11 && v <= 48) { nFound = v; break }
          }
        }
      }
      if (nFound != null) {
        map[nFound] = el
        // apenas visual: não tornamos clicável para não capturar eventos incorretos
        el.classList.add('og-tooth')
      }
    })
    mappingRef.current = map

    // Função auxiliar: agrega elementos vizinhos (mesmo dente) ao número detectado
    function clusterTooth(num, baseEl) {
      if (!baseEl || !root) return
      let baseRect
      try { baseRect = baseEl.getBoundingClientRect() } catch { return }
      if (!baseRect || !baseRect.width || !baseRect.height) return
      const candidates = Array.from(root.querySelectorAll('path,polygon,polyline,rect,circle,ellipse,line'))
      candidates.forEach((cand) => {
        if (cand === baseEl) return
        // já marcado? pula
        if (cand.dataset && cand.dataset.tooth) return
        let r
        try { r = cand.getBoundingClientRect() } catch { return }
        if (!r || !r.width || !r.height) return
        // heurística de interseção/overlap
        const interLeft = Math.max(baseRect.left, r.left)
        const interTop = Math.max(baseRect.top, r.top)
        const interRight = Math.min(baseRect.right, r.right)
        const interBottom = Math.min(baseRect.bottom, r.bottom)
        const interW = Math.max(0, interRight - interLeft)
        const interH = Math.max(0, interBottom - interTop)
        const interArea = interW * interH
        const baseArea = baseRect.width * baseRect.height
        const candArea = r.width * r.height
        // regra: se houver sobreposição relevante (>20% de qualquer um) OU forem muito próximos (<= 18px de distância entre centros), agrega
        const cx1 = baseRect.left + baseRect.width/2
        const cy1 = baseRect.top + baseRect.height/2
        const cx2 = r.left + r.width/2
        const cy2 = r.top + r.height/2
        const dx = cx2 - cx1
        const dy = cy2 - cy1
        const d = Math.hypot(dx, dy)
        const overlapEnough = interArea / Math.min(baseArea, candArea) > 0.2
        const nearEnough = d <= 18
        if (overlapEnough || nearEnough) {
          // apenas visual: não tornar clicável
          cand.classList.add('og-tooth')
        }
      })
    }

    // Se o mapeamento por id não encontrou muitos dentes, tentar auto-mapear por proximidade aos números do SVG
  async function tryAutoMap() {
      try {
        const res = await fetch('/numeros_dentes.svg', { cache: 'no-store' })
        if (!res.ok) return
        const markup = await res.text()
        // inserir svg dos números oculto mas com mesmo offset
        const hidden = document.createElement('div')
        hidden.style.position = 'absolute'
        hidden.style.inset = '0'
        hidden.style.opacity = '0'
        hidden.style.pointerEvents = 'none'
  // medição SEM offset visual
  hidden.style.transform = 'none'
        hidden.innerHTML = markup
        root.appendChild(hidden)

        // alinhar o SVG dos números ao mesmo box do overlay
        try {
          const nSvg = hidden.querySelector('svg')
          if (nSvg) {
            nSvg.style.width = '100%'
            nSvg.style.height = '100%'
            nSvg.style.display = 'block'
            nSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
            if (!nSvg.getAttribute('viewBox')) {
              const bbN = nSvg.getBBox()
              if (bbN && bbN.width && bbN.height) {
                nSvg.setAttribute('viewBox', `${bbN.x} ${bbN.y} ${bbN.width} ${bbN.height}`)
              }
            }
          }
        } catch { /* ignore */ }

        // pega os centros dos textos (números)
        const texts = Array.from(hidden.querySelectorAll('text'))
        const targets = texts.reduce((acc, el) => {
          const t = (el.textContent || '').trim()
          const num = Number(t)
          if (!Number.isFinite(num)) return acc
          const r = el.getBoundingClientRect()
          acc.push({ num, cx: r.left + r.width/2, cy: r.top + r.height/2 })
          return acc
        }, [])

        if (targets.length === 0) { root.removeChild(hidden); return }

        // candidatos: paths/polygons/grupos com bbox
        const candidates = Array.from(root.querySelectorAll('g,path,polygon,polyline,rect,circle,ellipse'))
          .filter(el => el !== hidden && el !== root)

        const taken = new Set()
        const byNum = {}
        targets.forEach((t) => {
          // 1) preferir elementos cujo bbox contenha o centro do número e que tenham maior área (dente inteiro)
          let containing = []
          candidates.forEach((el, idx) => {
            const r = el.getBoundingClientRect()
            const contains = (t.cx >= r.left && t.cx <= r.right && t.cy >= r.top && t.cy <= r.bottom)
            if (contains) containing.push({ el, idx, area: r.width * r.height })
          })
          if (containing.length > 0) {
            containing.sort((a,b) => b.area - a.area)
            const pick = containing.find(c => !taken.has(c.idx)) || containing[0]
            taken.add(pick.idx)
            byNum[t.num] = pick.el
            return
          }

          // 2) fallback: mais próximo por centroide
          let best = null
          let bestD = Infinity
          candidates.forEach((el, idx) => {
            if (taken.has(idx)) return
            const r = el.getBoundingClientRect()
            const cx = r.left + r.width/2
            const cy = r.top + r.height/2
            const dx = cx - t.cx
            const dy = cy - t.cy
            const d2 = dx*dx + dy*dy
            if (d2 < bestD) { bestD = d2; best = { el, idx } }
          })
          if (best && best.el) {
            taken.add(best.idx)
            byNum[t.num] = best.el
          }
        })

        Object.entries(byNum).forEach(([num, el]) => {
          const n = Number(num)
          if (!mappingRef.current[n]) {
            mappingRef.current[n] = el
            el.dataset.tooth = String(n)
            el.classList.add('og-tooth')
            el.style.cursor = 'pointer'
          }
          // agrega vizinhos que façam parte do mesmo dente
          clusterTooth(n, el)
        })

        root.removeChild(hidden)
        setAutoMapped(true)
      } catch {
        /* ignore */
      }
    }

    const mappedCount = Object.keys(map).length
    if (mappedCount < 16) { // poucos ids encontrados, tentar automapear
      tryAutoMap()
    }

    // sem delegação de clique no overlay: cliques são tratados pelos hitboxes dos números
    return () => {}
  }, [svgMarkup, onToggle])

  // sincroniza a classe selected no overlay conforme estado
  useEffect(() => {
    const map = mappingRef.current
    Object.keys(map).forEach((k) => {
      const n = Number(k)
      const el = map[n]
      if (!el) return
      if (selected.includes(n)) el.classList.add('selected')
      else el.classList.remove('selected')
    })
  }, [selected])

  if (!svgMarkup) return null
  return (
    <>
      {/* estilo de destaque controlado por classe */}
      <style>{`
        /* por padrão, NADA do overlay é visível */
        .og-overlay-root, .og-overlay-root * { pointer-events: none !important; }
        .og-overlay-root * { stroke: transparent !important; fill: transparent !important; }
        /* elementos de dente ganham interação e contorno ao selecionar */
        .og-tooth, .og-tooth * { vector-effect: non-scaling-stroke; }
        .og-tooth { color: transparent; }
        /* contorno em vermelho vivo quando selecionado */
        .og-tooth.selected { color: #ef4444; filter: drop-shadow(0 0 6px rgba(239,68,68,.6)); stroke: currentColor !important; stroke-width: 2.5 !important; }
        .og-tooth.selected path, .og-tooth.selected circle, .og-tooth.selected polyline, .og-tooth.selected polygon, .og-tooth.selected line { stroke: currentColor !important; stroke-width: 2.5 !important; }
      `}</style>
      <div ref={containerRef} className="absolute inset-0 pointer-events-auto" style={{ zIndex: 50 }} dangerouslySetInnerHTML={{ __html: svgMarkup }} />
    </>
  )
}

// Camada de fallback visual: desenha anéis vermelhos ao redor dos números selecionados
function SelectionRings({ selected }){
  const wrapperRef = useRef(null)
  const svgRef = useRef(null)
  const [markup, setMarkup] = useState('')
  const [centers, setCenters] = useState({}) // num -> {cx, cy, w, h}

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch('/numeros_dentes.svg', { cache: 'no-store' })
        if (!active) return
        if (res.ok) setMarkup(await res.text())
      } catch {/* ignore */}
    })()
    return () => { active = false }
  }, [])

  const recalc = () => {
    if (!wrapperRef.current || !svgRef.current) return
    try {
      const map = {}
      const texts = svgRef.current.querySelectorAll('text')
      texts.forEach((el) => {
        const t = (el.textContent || '').trim()
        const n = Number(t)
        if (!Number.isFinite(n)) return
        const r = el.getBoundingClientRect()
        const wr = wrapperRef.current.getBoundingClientRect()
        const cx = r.left - wr.left + r.width/2
        const cy = r.top - wr.top + r.height/2
        const w = r.width
        const h = r.height
        map[n] = { cx, cy, w, h }
      })
      setCenters(map)
    } catch {/* ignore */}
  }

  useEffect(() => {
    if (!markup) return
    // injeta o SVG oculto alinhado ao container, com o MESMO offset visual dos números
    // para o anel aparecer no mesmo lugar dos números visíveis
    const id = requestAnimationFrame(recalc)
    const ro = new ResizeObserver(() => recalc())
    if (wrapperRef.current) ro.observe(wrapperRef.current)
    window.addEventListener('resize', recalc)
    return () => { cancelAnimationFrame(id); ro.disconnect(); window.removeEventListener('resize', recalc) }
  }, [markup])

  if (!markup) return null
  return (
    <div ref={wrapperRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 45 }}>
      <div
        ref={svgRef}
        className="absolute inset-0 opacity-0 pointer-events-none og-numbers"
        style={{ transform: `translateY(${NUMBERS_OFFSET_Y}px)` }}
        dangerouslySetInnerHTML={{ __html: markup }}
      />
      {/* destaque sutil: sublinhado vermelho arredondado sob o número selecionado */}
      <svg className="absolute inset-0 w-full h-full block" viewBox="0 0 100 100" preserveAspectRatio="none">
        {selected.map((n) => {
          const c = centers[n]
          if (!c) return null
          const wr = wrapperRef.current?.getBoundingClientRect()
          if (!wr || !wr.width || !wr.height) return null
          const numW = Math.max(10, Math.min(40, c.w * 1.1))
          const numH = Math.max(2, Math.min(6, c.h * 0.18))
          const xPx = (c.cx - numW/2)
          const yPx = (c.cy + c.h/2 - numH * 0.5)
          const rx = 4
          const ry = 4
          const x = (xPx / wr.width) * 100
          const y = (yPx / wr.height) * 100
          const w = (numW / wr.width) * 100
          const h = (numH / wr.height) * 100
          return (
            <rect key={n} x={x} y={y} width={w} height={h} rx={(rx / wr.width) * 100} ry={(ry / wr.height) * 100} fill="#ef4444" opacity="0.85" />
          )
        })}
      </svg>
    </div>
  )
}

// Fallback: usa numeros_dentes.svg para posicionar os hitboxes automaticamente
// Removido NumbersOverlay: agora usamos apenas o overlay de contornos (odontogramaopacidade.svg)

export default function OrcamentosTab({ pacienteId, pacienteNome }){
  const [selected, setSelected] = useState([]) // array of tooth numbers
  const [treatment, setTreatment] = useState('')
  const [value, setValue] = useState('')
  const [items, setItems] = useState([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [orcamentos, setOrcamentos] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [procSearch, setProcSearch] = useState('')
  const chipsRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const filteredProcedures = useMemo(() => filterProcedures(procSearch), [procSearch])

  const total = useMemo(() => items.reduce((s,it)=> s + (Number(it.value)||0), 0), [items])

  function toggleTooth(n){
    setSelected(sel => sel.includes(n) ? sel.filter(x=>x!==n) : [...sel, n])
  }

  useEffect(() => {
    const node = chipsRef.current
    if (!node) {
      setCanScrollLeft(false)
      setCanScrollRight(false)
      return
    }

    const updateStatus = () => {
      const { scrollLeft, scrollWidth, clientWidth } = node
      setCanScrollLeft(scrollLeft > 4)
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4)
    }

    updateStatus()
    node.addEventListener('scroll', updateStatus, { passive: true })
    window.addEventListener('resize', updateStatus)
    return () => {
      node.removeEventListener('scroll', updateStatus)
      window.removeEventListener('resize', updateStatus)
    }
  }, [filteredProcedures])

  useEffect(() => {
    if (chipsRef.current) chipsRef.current.scrollLeft = 0
  }, [filteredProcedures])

  function addItems(){
    if(!treatment || !selected.length) return
    const val = Number(String(value).replace(',', '.')) || 0
    const newItems = selected.map(n => ({ tooth: n, treatment, value: val }))
    setItems(prev => [...prev, ...newItems])
    setSelected([]); setTreatment(''); setValue('')
  }

  function removeItem(idx){ setItems(prev => prev.filter((_,i)=>i!==idx)) }

  function scrollChips(direction){
    const node = chipsRef.current
    if (!node) return
    const delta = direction === 'left' ? -240 : 240
    node.scrollBy({ left: delta, behavior: 'smooth' })
  }

  // Carrega últimos orçamentos deste paciente
  useEffect(() => {
    let ignore = false
    async function loadOrcamentos() {
      try {
        setError('')
        // usa search por nome para reduzir resultados, depois filtra por id
        const params = pacienteNome ? { params: { search: pacienteNome, ordering: '-criado_em' } } : { params: { ordering: '-criado_em' } }
        let { data } = await api.get('/orcamentos/', params)
        let list = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : [])
        let onlyMine = list.filter(o => o.paciente === pacienteId)
        // Fallback: se a busca por nome não retornou, tenta sem search
        if (onlyMine.length === 0 && pacienteNome) {
          const res2 = await api.get('/orcamentos/', { params: { ordering: '-criado_em' } })
          const data2 = res2.data
          const list2 = Array.isArray(data2) ? data2 : (Array.isArray(data2?.results) ? data2.results : [])
          onlyMine = list2.filter(o => o.paciente === pacienteId)
        }
        if (!ignore) setOrcamentos(onlyMine.slice(0, 5))
      } catch (e) {
        // mantém silencioso, mas registra erro para debug opcional
        if (!ignore) setError('Não foi possível carregar os últimos orçamentos.')
      }
    }
    if (pacienteId) loadOrcamentos()
    return () => { ignore = true }
  }, [pacienteId, pacienteNome])

  async function saveOrcamento(){
    setMessage('')
    setError('')
  if (!pacienteId) { setError('Paciente inválido.'); return }
  if (items.length === 0) { setError('Adicione pelo menos um procedimento.'); return }
    try {
      setSaving(true)
      // Monta descrição amigável (texto) com os itens
      const resumo = items.map(it => `${it.tooth} - ${it.treatment} (R$ ${Number(it.value).toFixed(2)})`).join('; ')
      const payload = {
        paciente: pacienteId,
        descricao: `Itens: ${resumo}`,
        status: 'rascunho',
        itens: items.map(it => ({ dente: it.tooth, procedimento: it.treatment, valor: Number(it.value) || 0 })),
      }
      let data
      try {
        if (editingId) {
          const res = await api.put(`/orcamentos/${editingId}/`, payload)
          data = res.data
          setMessage(`Orçamento #${data?.id ?? editingId} atualizado.`)
          setEditingId(null)
        } else {
          const res = await api.post('/orcamentos/', payload)
          data = res.data
          setMessage(`Orçamento #${data?.id ?? ''} salvo com sucesso.`)
        }
      } catch (errFirst) {
        // Fallback: se o backend ainda não suportar itens aninhados (ou não migrou), tenta o payload antigo
        const legacy = {
          paciente: pacienteId,
          descricao: `Itens: ${resumo}`,
          valor_total: total.toFixed(2),
          status: 'rascunho',
        }
        if (editingId) {
          const res2 = await api.put(`/orcamentos/${editingId}/`, legacy)
          data = res2.data
          setMessage(`Orçamento #${data?.id ?? editingId} atualizado (modo legado).`)
          setEditingId(null)
        } else {
          const res2 = await api.post('/orcamentos/', legacy)
          data = res2.data
          setMessage(`Orçamento #${data?.id ?? ''} salvo (modo legado).`)
        }
      }
      // Limpa estado do formulário
      setItems([]); setSelected([]); setTreatment(''); setValue('')
      // Atualiza a listagem
      setOrcamentos(prev => {
        const copy = [...prev]
        const idx = copy.findIndex(o => o.id === data.id)
        if (idx >= 0) copy[idx] = { ...copy[idx], ...data }
        else copy.unshift({ ...data })
        return copy.slice(0, 5)
      })
    } catch (e) {
      const detail = e?.response?.data ? JSON.stringify(e.response.data) : ''
      setError(`Erro ao salvar orçamento. ${detail}`)
    } finally {
      setSaving(false)
    }
  }

  function loadForEdit(o){
    setError(''); setMessage('')
    setEditingId(o.id)
    // Reidrata itens se existirem, senão tenta inferir do texto
    if (Array.isArray(o.itens) && o.itens.length) {
      setItems(o.itens.map(it => ({ tooth: it.dente, treatment: it.procedimento, value: Number(it.valor) || 0 })))
    } else {
      setItems([])
    }
    setSelected([]); setTreatment(''); setValue('')
  }

  async function handleApprove(id){
    try {
      const { data } = await api.post(`/orcamentos/${id}/aprovar/`)
      setOrcamentos(prev => prev.map(o => o.id===id? { ...o, ...data } : o))
      setMessage(`Orçamento #${id} aprovado.`)
    } catch(e){ setError('Falha ao aprovar orçamento.') }
  }

  async function handleReject(id){
    try {
      const { data } = await api.post(`/orcamentos/${id}/reprovar/`)
      setOrcamentos(prev => prev.map(o => o.id===id? { ...o, ...data } : o))
      setMessage(`Orçamento #${id} reprovado.`)
    } catch(e){ setError('Falha ao reprovar orçamento.') }
  }

  async function handleDelete(id){
    try {
      await api.delete(`/orcamentos/${id}/`)
      setOrcamentos(prev => prev.filter(o => o.id!==id))
      if (editingId === id) setEditingId(null)
      setMessage(`Orçamento #${id} removido.`)
    } catch(e){ setError('Falha ao remover orçamento.') }
  }

  function handlePdf(id){
    const url = `${API_BASE}/api/orcamentos/${id}/pdf/`
    window.open(url, '_blank', 'noopener')
  }

  return (
    <div className="space-y-6">
      {/* Barra de procedimentos (chips) */}
      <div className="card">
        <div className="flex items-center gap-2 mb-2">
          <label className="text-sm text-gray-300">Procedimentos</label>
          <input className="input flex-1" placeholder="Buscar procedimento..." value={procSearch} onChange={(e)=>setProcSearch(e.target.value)} />
          <button className="btn" onClick={()=>setProcSearch('')}>Limpar</button>
        </div>
        {filteredProcedures.length > 0 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-secondary btn-xs"
              onClick={()=>scrollChips('left')}
              disabled={!canScrollLeft}
              aria-label="Voltar procedimentos"
            >
              {'<'}
            </button>
            <div ref={chipsRef} className="flex-1 min-w-0 overflow-x-auto scroll-smooth">
              <div className="flex gap-2 py-1 pr-2">
                {filteredProcedures.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    className="px-3 py-1.5 rounded-full bg-gray-800/60 hover:bg-gray-700/60 text-xs sm:text-sm border border-gray-700/50 flex-shrink-0 whitespace-nowrap"
                    title={`Adicionar: ${p.name}`}
                    onClick={() => {
                      // Se houver dentes selecionados, adiciona os itens para cada dente
                      if (selected.length > 0) {
                        const val = Number(p.defaultValue) || 0
                        const newItems = selected.map(n => ({ tooth: n, treatment: p.name, value: val }))
                        setItems(prev => [...prev, ...newItems])
                        setSelected([])
                        setMessage(`${newItems.length} item(ns) adicionados: ${p.name}.`)
                      } else {
                        // Senão, apenas preenche os campos para o usuário confirmar
                        setTreatment(p.name)
                        if (!value) setValue(String(Number(p.defaultValue) || 0))
                      }
                    }}
                  >
                    {p.name}
                    <span className="ml-2 text-[10px] text-gray-400">R$ {p.defaultValue}</span>
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-xs"
              onClick={()=>scrollChips('right')}
              disabled={!canScrollRight}
              aria-label="Avançar procedimentos"
            >
              {'>'}
            </button>
          </div>
        ) : (
          <div className="text-xs text-gray-400">Nenhum procedimento encontrado.</div>
        )}
        <div className="mt-2 text-xs text-gray-400">Dica: selecione os dentes no odontograma e clique em um chip para adicionar rapidamente.</div>
      </div>

      {/* Formulário superior (manual) */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <label className="block text-sm mb-2 text-gray-300">Procedimento</label>
          <input className="input" placeholder="Ex.: Restauração em resina"
            value={treatment} onChange={e=>setTreatment(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-2 text-gray-300">Valor (R$)</label>
          <input className="input" placeholder="0,00" value={value} onChange={e=>setValue(e.target.value)} />
        </div>
        <div className="flex items-end">
          <button className="btn btn-primary w-full" onClick={addItems}>Adicionar procedimento</button>
        </div>
      </div>

      {/* Odontograma adulto (background + overlay) */}
      <div className="card">
        <h3 className="text-white font-semibold mb-4">Odontograma (adulto)</h3>
        <div className="relative pb-24">
          {/* Base visual */}
          <OdontogramaSvg />
          {/* Números (somente visual, não clicável) */}
          <NumbersVisual />
          {/* Hitboxes de clique baseados nos números (garante clique) */}
          <NumbersHitboxes selected={selected} onToggle={toggleTooth} />
          {/* Marca sutil sob o número selecionado (feedback imediato, sem círculos) */}
          <SelectionRings selected={selected} />
          {/* Overlay de contornos (clicável e com destaque em vermelho) */}
          <OdontogramaOverlay selected={selected} onToggle={toggleTooth} />
        </div>
        {selected.length > 0 && (
          <div className="text-sm text-gray-300 mt-3">Selecionados: {selected.slice().sort((a,b)=>a-b).join(', ')}</div>
        )}
      </div>

      {/* Lista de procedimentos */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Procedimentos</h3>
          <div className="text-gray-300">Total: <span className="text-white font-bold">R$ {total.toFixed(2)}</span></div>
        </div>
        {error && (
          <div className="mb-3 text-sm text-red-300 bg-red-900/20 border border-red-700/40 rounded px-3 py-2">{error}</div>
        )}
        {message && (
          <div className="mb-3 text-sm text-emerald-300 bg-emerald-900/20 border border-emerald-700/40 rounded px-3 py-2">{message}</div>
        )}
        {items.length === 0 ? (
          <div className="text-gray-400">Nenhum procedimento adicionado ainda.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-400">
                <tr>
                  <th className="text-left py-2">Dente</th>
                  <th className="text-left py-2">Procedimento</th>
                  <th className="text-left py-2">Valor</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx} className="border-t border-gray-700/60">
                    <td className="py-2 text-white">{it.tooth}</td>
                    <td className="py-2 text-gray-300">{it.treatment}</td>
                    <td className="py-2 text-gray-300">R$ {Number(it.value).toFixed(2)}</td>
                    <td className="py-2 text-right">
                      <button className="btn btn-danger text-xs" onClick={()=>removeItem(idx)}>Remover</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 flex gap-2 justify-end">
          <button className="btn" onClick={()=>{ setItems([]); setSelected([]); setTreatment(''); setValue(''); setEditingId(null); setMessage('') }}>Limpar</button>
          <button className="btn btn-primary disabled:opacity-60" disabled={saving} onClick={saveOrcamento}>{saving ? 'Salvando...' : (editingId ? 'Atualizar orçamento' : 'Salvar orçamento')}</button>
        </div>
      </div>

      {/* Últimos orçamentos do paciente */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Últimos orçamentos</h3>
          <div className="text-sm text-gray-400">mostrando até 5</div>
        </div>
        {orcamentos.length === 0 ? (
          <div className="text-gray-400">Nenhum orçamento cadastrado para este paciente.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-400">
                <tr>
                  <th className="text-left py-2">#</th>
                  <th className="text-left py-2">Descrição</th>
                  <th className="text-left py-2">Itens</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Valor total</th>
                  <th className="text-left py-2">Criado em</th>
                </tr>
              </thead>
              <tbody>
                {orcamentos.map((o) => (
                  <tr key={o.id} className="border-t border-gray-700/60">
                    <td className="py-2 text-white">{o.id}</td>
                    <td className="py-2 text-gray-300 max-w-xl truncate" title={o.descricao}>{o.descricao || '—'}</td>
                    <td className="py-2 text-gray-300">
                      {Array.isArray(o.itens) && o.itens.length > 0 ? (
                        <div className="max-w-xl truncate" title={o.itens.map(i=>`${i.dente}-${i.procedimento} (R$ ${Number(i.valor).toFixed(2)})`).join('; ')}>
                          {o.itens.slice(0,3).map(i=>`${i.dente}-${i.procedimento}`).join(', ')}{o.itens.length>3?'…':''}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="py-2 text-gray-300 capitalize">{o.status}</td>
                    <td className="py-2 text-gray-300">R$ {Number(o.valor_total ?? o.total ?? 0).toFixed(2)}</td>
                    <td className="py-2 text-gray-400">
                      <div>{new Date(o.criado_em).toLocaleString()}</div>
                      <div className="flex gap-2 mt-1">
                        <button className="btn btn-xs" onClick={()=>loadForEdit(o)}>Editar</button>
                        <button className="btn btn-xs" onClick={()=>handlePdf(o.id)}>PDF</button>
                        <button className="btn btn-xs" onClick={()=>handleApprove(o.id)}>Aprovar</button>
                        <button className="btn btn-xs" onClick={()=>handleReject(o.id)}>Reprovar</button>
                        <button className="btn btn-danger btn-xs" onClick={()=>handleDelete(o.id)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
