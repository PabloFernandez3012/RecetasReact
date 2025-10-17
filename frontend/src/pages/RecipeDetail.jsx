import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

export default function RecipeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/recipes/${id}`)
      .then(async r => {
        if (!r.ok) throw new Error('No encontrado')
        return r.json()
      })
      .then(setRecipe)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [id])

  const onDelete = async () => {
    if (!confirm('¿Eliminar receta?')) return
    const r = await fetch(`/api/recipes/${id}`, { method: 'DELETE' })
    if (r.status === 204) {
      navigate('/')
    }
  }

  if (loading) return <p>Cargando...</p>
  if (error) return <p>Error: {error}</p>
  if (!recipe) return <p>No encontrada</p>

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
      <div className="actions">
        <Link className="btn" to={`/edit/${recipe.id}`}>Editar</Link>
        <button className="btn danger" onClick={onDelete}>Eliminar</button>
      </div>
    </article>
  )
}
