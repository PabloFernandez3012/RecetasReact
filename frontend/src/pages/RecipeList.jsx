import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

export default function RecipeList() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [sp] = useSearchParams()
  const catRaw = sp.get('cat') || 'todas'
  const catList = catRaw === 'todas' ? [] : catRaw.split(',').filter(Boolean)
  const q = (sp.get('q') || '').toLowerCase()

  useEffect(() => {
    fetch('/api/recipes')
      .then(r => r.json())
      .then(setRecipes)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let out = recipes
    if (catList.length > 0) {
      out = out.filter(r => {
        const cats = Array.isArray(r.category) ? r.category : [r.category]
        return catList.some(sel => cats.includes(sel))
      })
    }
    if (q) {
      out = out.filter(r => {
        const haystack = [
          r.title,
          r.description,
          ...(Array.isArray(r.ingredients) ? r.ingredients : []),
          ...(Array.isArray(r.steps) ? r.steps : [])
        ].join(' ').toLowerCase()
        return haystack.includes(q)
      })
    }
    return out
  }, [recipes, catList, q])

  if (loading) return <p>Cargando...</p>

  return (
    <div className="list">
      {filtered.map(r => (
        <article key={r.id} className="card">
          {r.image ? <img src={r.image} alt={r.title} /> : null}
          <h3><Link to={`/recipe/${r.id}`}>{r.title}</Link></h3>
          <p>{r.description}</p>
          <div>
            {(Array.isArray(r.category) ? r.category : [r.category]).map((cat, i) => (
              <span key={cat} className="badge" style={{marginRight:4}}>{cat}</span>
            ))}
          </div>
          <div className="actions">
            <Link className="btn" to={`/edit/${r.id}`}>Editar</Link>
          </div>
        </article>
      ))}
      {filtered.length === 0 && <p>No hay recetas que coincidan con el filtro.</p>}
    </div>
  )
}
