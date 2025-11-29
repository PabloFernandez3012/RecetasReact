import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Card from '../components/ui/Card'
import { useRecipes } from '../hooks/useRecipes'
import { useFavorites, useLikeRecipe, useUnlikeRecipe } from '../hooks/useFavorites'
import { useMe } from '../hooks/useAuth'

export default function RecipeList() {
  const { data: recipes = [], isLoading, isError, error } = useRecipes()
  const hasToken = Boolean(localStorage.getItem('auth_token'))
  const { data: me } = useMe(hasToken)
  const { data: favorites } = useFavorites(hasToken)
  const likeMutation = useLikeRecipe()
  const unlikeMutation = useUnlikeRecipe()
  const favIds = Array.isArray(favorites) ? favorites.map(r => r.id) : []
  
  const [sp] = useSearchParams()
  const catRaw = sp.get('cat') || 'todas'
  const catList = catRaw === 'todas' ? [] : catRaw.split(',').filter(Boolean)
  const q = (sp.get('q') || '').toLowerCase()

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

  // Estado de Loading
  if (isLoading) {
    return (
      <div className="loading-state" style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ fontSize: '1.2rem' }}>⏳ Cargando recetas...</p>
      </div>
    )
  }

  // Estado de Error
  if (isError) {
    return (
      <div className="error-state" style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
        <h2>❌ Error al cargar las recetas</h2>
        <p>{error?.message || 'Ocurrió un error desconocido'}</p>
      </div>
    )
  }

  // Estado Empty (sin resultados)
  if (filtered.length === 0) {
    return (
      <div className="empty-state" style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>🍽️ No hay recetas disponibles</h2>
        <p>
          {recipes.length === 0 
            ? 'Aún no has creado ninguna receta.' 
            : 'No hay recetas que coincidan con tu búsqueda o filtro.'}
        </p>
        {recipes.length === 0 && (
          <Link to="/new" className="btn" style={{ marginTop: '1rem' }}>
            ➕ Crear primera receta
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="list">
      {filtered.map(r => {
        const isFav = favIds.includes(r.id)
        return (
          <Card key={r.id} as="article">
            {r.image ? <img src={r.image} alt={r.title} loading="lazy" /> : null}
            <h3><Link to={`/recipe/${r.id}`}>{r.title}</Link></h3>
            <p>{r.description}</p>
            <div>
              {(Array.isArray(r.category) ? r.category : [r.category]).map((cat, i) => (
                <span key={cat} className="badge" style={{marginRight:4}}>{cat}</span>
              ))}
            </div>
            <div className="actions">
              {me?.role === 'admin' ? (
                <Link className="btn" to={`/edit/${r.id}`}>Editar</Link>
              ) : me ? (
                <button
                  className="btn"
                  onClick={() => {
                    if (isFav) {
                      unlikeMutation.mutate(r.id)
                    } else {
                      likeMutation.mutate(r.id)
                    }
                  }}
                  disabled={likeMutation.isPending || unlikeMutation.isPending}
                  title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  {isFav ? '★ Favorito' : '☆ Favorito'}
                </button>
              ) : null}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
