import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import MegaMenu from './components/MegaMenu'
import ThemeToggle from './components/ThemeToggle'
import Footer from './components/Footer'
import Container from './components/ui/Container'
import RecipeList from './pages/RecipeList'
import RecipeDetail from './pages/RecipeDetail'
import RecipeForm from './pages/RecipeForm'
import Login from './pages/Login'
import Register from './pages/Register'
import { useMe, logout } from './hooks/useAuth'

export default function App() {
  const { data: me, isSuccess } = useMe(Boolean(localStorage.getItem('auth_token')))
  const navigate = useNavigate()
  const onLogout = () => {
    logout()
    navigate('/')
  }
  return (
    <Container>
      <header>
        <h1><Link to="/">Recetas de Pablo</Link></h1>
        <ThemeToggle />
        <nav style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap', width:'100%'}}>
          <MegaMenu />
          <div style={{flexGrow:1}} />
          {isSuccess ? (
            <>
              <span style={{fontSize:'0.9rem'}}>Hola, {me.name || me.email}</span>
              <Link to="/new" className="btn icon" title="Nueva receta" aria-label="Nueva receta">+</Link>
              <button onClick={onLogout} className="btn" style={{background:'#444'}}>Salir</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn">Login</Link>
              <Link to="/register" className="btn" style={{background:'#444'}}>Registro</Link>
            </>
          )}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<RecipeList />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/new" element={isSuccess ? <RecipeForm /> : <Login />} />
          <Route path="/edit/:id" element={isSuccess ? <RecipeForm /> : <Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <Footer />
    </Container>
  )
}
