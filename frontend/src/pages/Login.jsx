import { useState } from 'react'
import { useLogin } from '../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const loginMutation = useLogin()
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      await loginMutation.mutateAsync({ email, password })
      navigate('/')
    } catch (err) {
      // handled in UI
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <h2>Iniciar sesión</h2>
      {loginMutation.isError && (
        <p style={{ color: 'red' }}>Error: {loginMutation.error.message}</p>
      )}
      <label>Email
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </label>
      <label>Password
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </label>
      <div className="actions">
        <button className="btn" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? 'Ingresando...' : 'Entrar'}
        </button>
      </div>
      <p style={{marginTop:'1rem'}}>¿No tienes cuenta? <Link to="/register">Registrarte</Link></p>
    </form>
  )
}
