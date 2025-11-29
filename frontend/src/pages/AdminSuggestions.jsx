import { useAdminSuggestions, useDeleteSuggestion } from '../hooks/useAdminSuggestions'
import { useMe } from '../hooks/useAuth'

export default function AdminSuggestions() {
  const hasToken = Boolean(localStorage.getItem('auth_token'))
  const { data: me, isSuccess } = useMe(hasToken)
  const { data, isLoading, isError, error, refetch } = useAdminSuggestions(isSuccess && me?.role==='admin')
  const del = useDeleteSuggestion()

  if (!hasToken || !isSuccess || me?.role !== 'admin') {
    return <div style={{padding:'2rem'}}><h2>Acceso restringido</h2><p>Solo administradores.</p></div>
  }
  if (isLoading) return <div style={{padding:'2rem'}}>Cargando sugerencias…</div>
  if (isError) return <div style={{padding:'2rem', color:'red'}}>Error: {error.message}</div>

  return (
    <section style={{padding:'1rem'}}>
      <h2>Sugerencias</h2>
      {(!data || data.length===0) ? (
        <p>No hay sugerencias por ahora.</p>
      ) : (
        <ul style={{listStyle:'none', padding:0, display:'grid', gap:12}}>
          {data.map(item => (
            <li key={item.id} style={{border:'1px solid #333', borderRadius:8, padding:12}}>
              <div style={{display:'flex', justifyContent:'space-between', gap:12, alignItems:'center'}}>
                <div>
                  <strong>{item.userName || item.userEmail || 'Usuario'}</strong>
                  <div style={{opacity:0.8, fontSize:12}}>{new Date(item.createdAt).toLocaleString()}</div>
                </div>
                <button className='btn danger' onClick={async () => { await del.mutateAsync(item.id); await refetch() }}>Eliminar</button>
              </div>
              <p style={{marginTop:8, whiteSpace:'pre-wrap'}}>{item.text}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
