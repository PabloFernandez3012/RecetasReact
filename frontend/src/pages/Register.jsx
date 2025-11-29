import { useState } from 'react'
import { useRegister } from '../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const registerMutation = useRegister()
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      await registerMutation.mutateAsync({ email, password })
      navigate('/')
    } catch (err) {
      // handled in UI
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <h2>Crear cuenta</h2>
      {registerMutation.isError && (
        <p style={{ color: 'red' }}>Error: {registerMutation.error.message}</p>
      )}
      <label>Email
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </label>
      <label>Password
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </label>
      <div className="actions">
        <button className="btn" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? 'Creando...' : 'Registrarse'}
        </button>
      </div>
      <p style={{marginTop:'1rem'}}>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
    </form>
  )
}
