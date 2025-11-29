import { useMe, useUpdateProfile } from '../hooks/useAuth'
import { useState, useEffect } from 'react'

export default function Profile() {
  const { data: me, isLoading, isError } = useMe(Boolean(localStorage.getItem('auth_token')))
  const updateMutation = useUpdateProfile()
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    if (me) setName(me.name || '')
  }, [me])

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateMutation.mutateAsync({ name, currentPassword: currentPassword || undefined, newPassword: newPassword || undefined })
      setCurrentPassword('')
      setNewPassword('')
      alert('Perfil actualizado')
    } catch (err) {
      alert(err.message)
    }
  }

  if (isLoading) return <p style={{padding:'2rem'}}>Cargando perfil...</p>
  if (isError) return <p style={{padding:'2rem', color:'red'}}>Error cargando perfil</p>

  return (
    <form className="form" onSubmit={onSubmit} style={{maxWidth:480}}>
      <h2>Editar Perfil</h2>
      <label>Email (no editable)
        <input value={me.email} disabled />
      </label>
      <label>Nombre
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" />
      </label>
      <fieldset>
        <legend>Cambiar contraseña (opcional)</legend>
        <label>Contraseña actual
          <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Actual" />
        </label>
        <label>Nueva contraseña
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nueva" />
        </label>
        <small style={{display:'block', marginBottom:'1rem'}}>Rellena ambos campos para cambiarla (mínimo 6 caracteres).</small>
      </fieldset>
      <button className="btn" disabled={updateMutation.isPending} type="submit">
        {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
      </button>
      {updateMutation.isError && (
        <div style={{color:'red', marginTop:'1rem'}}>Error: {updateMutation.error.message}</div>
      )}
    </form>
  )
}
