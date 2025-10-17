import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

const DEFAULT_CATEGORIES = [
  { key: 'todas', label: 'Todas las recetas' },
  { key: 'saladas', label: 'Comidas saladas' },
  { key: 'postres', label: 'Postres' },
  { key: 'bebidas-sin', label: 'Bebidas sin alcohol' },
  { key: 'bebidas-con', label: 'Bebidas con alcohol' },
  { key: 'desayuno', label: 'Desayuno' },
  { key: 'almuerzo', label: 'Almuerzo' },
  { key: 'cena', label: 'Cena' },
  { key: 'cumpleanos', label: 'Cumpleaños' },
  { key: 'navidad', label: 'Navidad' },
  { key: 'ano-nuevo', label: 'Año nuevo' },
  { key: 'dia-independencia', label: 'Día de la independencia' }
]

export default function Filters() {
  const [sp, setSp] = useSearchParams()
  const catRaw = sp.get('cat') || 'todas'
  const catList = catRaw === 'todas' ? [] : catRaw.split(',').filter(Boolean)
  const q = sp.get('q') || ''

  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [openSug, setOpenSug] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch('/api/recipes')
      .then(r => r.json())
      .then(setRecipes)
      .finally(() => setLoading(false))
  }, [])

  const counts = useMemo(() => {
    const map = new Map()
    for (const r of recipes) {
      const key = r.category || 'saladas'
      map.set(key, (map.get(key) || 0) + 1)
    }
    return map
  }, [recipes])

  const categories = useMemo(() => {
    // Unir default con las que existan en datos
    const present = Array.from(new Set(recipes.map(r => r.category || 'saladas')))
    const merged = [...DEFAULT_CATEGORIES]
    present.forEach(k => {
      if (!merged.some(c => c.key === k)) merged.push({ key: k, label: k })
    })
    return merged
  }, [recipes])

  const updateParams = useCallback((next) => {
    const merged = new URLSearchParams(sp)
    Object.entries(next).forEach(([k, v]) => {
      if (v && String(v).length > 0 && (k !== 'cat' || v !== 'todas')) merged.set(k, v)
      else merged.delete(k)
    })
    setSp(merged)
  }, [sp, setSp])

  const suggestions = useMemo(() => {
    const text = q.trim().toLowerCase()
    if (text.length < 2) return []
    const set = new Set()
    const out = []
    for (const r of recipes) {
      if (r.title && r.title.toLowerCase().includes(text)) {
        const v = r.title
        if (!set.has(v)) { set.add(v); out.push({ type: 'receta', value: v }) }
      }
      for (const ing of (r.ingredients || [])) {
        if (typeof ing === 'string' && ing.toLowerCase().includes(text)) {
          const v = ing
          if (!set.has(v)) { set.add(v); out.push({ type: 'ingrediente', value: v }) }
        }
      }
      if (out.length >= 10) break
    }
    return out
  }, [q, recipes])

  const onPickSuggestion = (v) => {
    updateParams({ q: v })
    setOpenSug(false)
  }

  const onClear = () => {
    updateParams({ q: '', cat: 'todas' })
  }

  return (
    <div className="filters">
      <label style={{display:'flex',alignItems:'center',gap:8}}>
        <span style={{color:'#94a3b8'}}>Categoría:</span>
        <select multiple value={catList} onChange={e => {
          const opts = Array.from(e.target.selectedOptions).map(o => o.value)
          updateParams({ cat: opts.length ? opts.join(',') : 'todas' })
        }} style={{height:'120px'}}>
          <option value="todas">Todas las recetas</option>
          {categories.filter(c => c.key !== 'todas').map(c => {
            const count = counts.get(c.key) || 0
            const label = `${c.label}${count ? ` (${count})` : ''}`
            return <option key={c.key} value={c.key}>{label}</option>
          })}
        </select>
      </label>
      <div style={{position:'relative', display:'flex', alignItems:'center', gap:8, flexGrow:1}}>
        <label style={{display:'flex',alignItems:'center',gap:8, flexGrow:1}}>
          <span style={{color:'#94a3b8'}}>Buscar:</span>
          <input
            type="search"
            placeholder="Buscar receta o ingrediente..."
            value={q}
            onChange={e => { updateParams({ q: e.target.value }); setOpenSug(true) }}
            onFocus={() => setOpenSug(true)}
            onBlur={() => setTimeout(() => setOpenSug(false), 120)}
            style={{flexGrow:1}}
          />
        </label>
        {(q || (cat && cat !== 'todas')) && (
          <button className="btn" type="button" onClick={onClear}>Limpiar</button>
        )}
        {openSug && suggestions.length > 0 && (
          <div className="suggestions">
            {suggestions.map((s, i) => (
              <div key={i} className="suggestion-item" onMouseDown={() => onPickSuggestion(s.value)}>
                <small style={{opacity:.7, marginRight:6}}>{s.type}:</small> {s.value}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
