import { useFavorites } from '../hooks/useFavorites'
import { useMe } from '../hooks/useAuth'
import { Link } from 'react-router-dom'

export default function Favorites() {
  const hasToken = Boolean(localStorage.getItem('auth_token'))
  const { data: me } = useMe(hasToken)
  const { data: favorites, isLoading, isError, error } = useFavorites(hasToken)

  if (!hasToken) return <p style={{padding:'2rem'}}>Debes iniciar sesión para ver favoritos.</p>
  if (isLoading) return <p style={{padding:'2rem'}}>Cargando favoritos...</p>
  if (isError) return <p style={{padding:'2rem',color:'red'}}>Error: {error.message}</p>
  if (!favorites || favorites.length === 0) return <p style={{padding:'2rem'}}>Aún no tienes recetas favoritas.</p>

  return (
    <div>
      <h2>Favoritos de {me?.name || me?.email}</h2>
      <div className="cards" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:16}}>
        {favorites.map(r => (
          <Link key={r.id} to={`/recipe/${r.id}`} className="card" style={{textDecoration:'none'}}>
            {r.image && <img src={r.image} alt={r.title} style={{width:'100%',height:140,objectFit:'cover',borderRadius:4}} />}
            <h3 style={{margin:'8px 0'}}>{r.title}</h3>
            <div style={{fontSize:'0.75rem',opacity:0.7}}>{Array.isArray(r.category)? r.category.join(', ') : ''}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
