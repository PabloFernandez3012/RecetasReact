import { Link, useParams, useNavigate } from 'react-router-dom'
import { useRecipe, useDeleteRecipe } from '../hooks/useRecipes'
import { useFavorites, useLikeRecipe, useUnlikeRecipe } from '../hooks/useFavorites'
import { useMe } from '../hooks/useAuth'
import { useRecipeComments, useAddComment, useDeleteComment, useUpdateComment, useReactToComment } from '../hooks/useComments'
import { useState } from 'react'

export default function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: recipe, isLoading, isError, error } = useRecipe(id)
  const deleteMutation = useDeleteRecipe()
  const { data: me } = useMe(Boolean(localStorage.getItem('auth_token')))
  const { data: comments } = useRecipeComments(id, true)
  const addComment = useAddComment()
  const deleteComment = useDeleteComment()
  const [commentText, setCommentText] = useState('')
  const updateComment = useUpdateComment()
  const reactToComment = useReactToComment()
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')
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

      {/* Sección de comentarios */}
      <section style={{ marginTop: '2rem' }}>
        <h3>Comentarios</h3>
        {Array.isArray(comments) && comments.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem 0' }}>
            {comments.map(c => (
              <li key={c.id} style={{ borderTop: '1px solid var(--border)', padding: '0.75rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <strong>{c.userName?.trim() || c.userEmail}</strong>
                    <span style={{ marginLeft: 8, color: 'var(--muted)' }}>
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(me?.role === 'admin' || me?.id === c.userId) && (
                      <>
                        {editingId === c.id ? (
                          <>
                            <button
                              className="btn"
                              onClick={async () => {
                                const text = editingText.trim()
                                if (!text) return
                                try {
                                  await updateComment.mutateAsync({ id: c.id, recipeId: id, text })
                                  setEditingId(null)
                                  setEditingText('')
                                } catch (err) {
                                  alert(err.message)
                                }
                              }}
                              disabled={updateComment.isPending}
                            >
                              Guardar
                            </button>
                            <button className="btn" onClick={() => { setEditingId(null); setEditingText('') }}>Cancelar</button>
                          </>
                        ) : (
                          <button className="btn" onClick={() => { setEditingId(c.id); setEditingText(c.text) }}>Editar</button>
                        )}
                        <button
                          className="btn danger"
                          onClick={() => deleteComment.mutate({ id: c.id, recipeId: id })}
                          disabled={deleteComment.isPending}
                          title="Eliminar comentario"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {editingId === c.id ? (
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    rows={3}
                    style={{ width: '100%', marginTop: 8 }}
                  />
                ) : (
                  <p style={{ margin: '0.5rem 0 0 0' }}>{c.text}</p>
                )}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
                  <button
                    className="btn"
                    onClick={() => {
                      if (!me) return alert('Inicia sesión para reaccionar')
                      const next = c.myVote === 1 ? 0 : 1
                      reactToComment.mutate({ id: c.id, recipeId: id, value: next })
                    }}
                    disabled={reactToComment.isPending}
                    title="Me gusta"
                    style={c.myVote === 1 ? { background: 'var(--primary)', color: 'white' } : undefined}
                  >
                    👍 {c.likes ?? 0}
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      if (!me) return alert('Inicia sesión para reaccionar')
                      const next = c.myVote === -1 ? 0 : -1
                      reactToComment.mutate({ id: c.id, recipeId: id, value: next })
                    }}
                    disabled={reactToComment.isPending}
                    title="No me gusta"
                    style={c.myVote === -1 ? { background: 'var(--danger)', color: 'white' } : undefined}
                  >
                    👎 {c.dislikes ?? 0}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: 'var(--muted)' }}>Aún no hay comentarios. ¡Sé el primero!</p>
        )}

        {me ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const text = commentText.trim()
              if (!text) return
              try {
                await addComment.mutateAsync({ recipeId: id, text })
                setCommentText('')
              } catch (err) {
                alert(err.message)
              }
            }}
            style={{ display: 'grid', gap: 8 }}
          >
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escribe un comentario..."
              rows={3}
              style={{ width: '100%', padding: 8 }}
            />
            <button className="btn" type="submit" disabled={addComment.isPending}>
              {addComment.isPending ? 'Enviando...' : 'Publicar'}
            </button>
          </form>
        ) : (
          <p style={{ marginTop: '0.5rem' }}>
            <Link to="/login">Inicia sesión</Link> para comentar.
          </p>
        )}
      </section>
    </article>
  )
}
