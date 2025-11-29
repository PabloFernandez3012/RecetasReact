import { Link, useParams, useNavigate } from 'react-router-dom'
import { useRecipe, useDeleteRecipe } from '../hooks/useRecipes'
import { useFavorites, useLikeRecipe, useUnlikeRecipe } from '../hooks/useFavorites'
import { useMe } from '../hooks/useAuth'

export default function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: recipe, isLoading, isError, error } = useRecipe(id)
  const deleteMutation = useDeleteRecipe()
  const { data: me } = useMe(Boolean(localStorage.getItem('auth_token')))
  const { data: favorites } = useFavorites(Boolean(localStorage.getItem('auth_token')))
  const likeMutation = useLikeRecipe()
  const unlikeMutation = useUnlikeRecipe()
  const favIds = Array.isArray(favorites) ? favorites.map(r => r.id) : []
  const isFav = favIds.includes(id)

  const onDelete = async () => {
    if (!confirm('¿Eliminar receta?')) return
    
    try {
      await deleteMutation.mutateAsync(id)
      navigate('/')
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
    }
  }

  // Estado de Loading
  if (isLoading) {
    return (
      <div className="loading-state" style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ fontSize: '1.2rem' }}>⏳ Cargando receta...</p>
      </div>
    )
  }

  // Estado de Error
  if (isError) {
    return (
      <div className="error-state" style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
        <h2>❌ Error al cargar la receta</h2>
        <p>{error?.message || 'Ocurrió un error desconocido'}</p>
        <Link to="/" className="btn" style={{ marginTop: '1rem' }}>
          ← Volver al inicio
        </Link>
      </div>
    )
  }

  // Estado Empty (no encontrada)
  if (!recipe) {
    return (
      <div className="empty-state" style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>🔍 Receta no encontrada</h2>
        <p>La receta que buscas no existe.</p>
        <Link to="/" className="btn" style={{ marginTop: '1rem' }}>
          ← Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <article>
      {recipe.image && <img src={recipe.image} alt={recipe.title} className="cover" />}
      <h2>{recipe.title}</h2>
      <div style={{margin:'6px 0'}}>
        {(Array.isArray(recipe.category) ? recipe.category : [recipe.category]).map((cat, i) => (
          <span key={cat} className="badge" style={{marginRight:4}}>{cat}</span>
        ))}
      </div>
      <p>{recipe.description}</p>
      <h3>Ingredientes</h3>
      <ul>
        {recipe.ingredients?.map((ing, i) => <li key={i}>{ing}</li>)}
      </ul>
      <h3>Pasos</h3>
      <ol>
        {recipe.steps?.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
      <div className="actions" style={{display:'flex',flexWrap:'wrap',gap:8}}>
        {me && (
          <button
            className="btn"
            onClick={() => {
              if (isFav) {
                unlikeMutation.mutate(id)
              } else {
                likeMutation.mutate(id)
              }
            }}
            disabled={likeMutation.isPending || unlikeMutation.isPending}
            title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            {isFav ? '★ Favorito' : '☆ Favorito'}
          </button>
        )}
        {me?.role === 'admin' && (
          <>
            <Link className="btn" to={`/edit/${recipe.id}`}>Editar</Link>
            <button
              className="btn danger"
              onClick={onDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? '⏳ Eliminando...' : 'Eliminar'}
            </button>
          </>
        )}
      </div>
    </article>
  )
}
