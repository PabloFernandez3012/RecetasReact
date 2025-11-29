import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import MegaMenu from './components/MegaMenu'
import ThemeToggle from './components/ThemeToggle'
import Footer from './components/Footer'
import Container from './components/ui/Container'
import RecipeList from './pages/RecipeList'
import RecipeDetail from './pages/RecipeDetail'
import RecipeForm from './pages/RecipeForm'
import Profile from './pages/Profile'
import Favorites from './pages/Favorites'
import AdminSuggestions from './pages/AdminSuggestions'
import Login from './pages/Login'
import Register from './pages/Register'
import { useMe, logout } from './hooks/useAuth'
import { queryClient } from './lib/queryClient'
import { apiUrl } from './lib/api'
import SuggestionFab from './components/SuggestionFab'

export default function App() {
  const hasToken = Boolean(localStorage.getItem('auth_token'))
  const { data: me, isSuccess } = useMe(hasToken)
  const navigate = useNavigate()
  const onLogout = () => {
    logout()
    navigate('/login')
  }
  
  // Prefetch de recetas al cargar la app para cache instantáneo
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['recipes'],
      queryFn: async () => {
        try {
          const res = await fetch(apiUrl('/api/recipes-summary'))
          if (res.ok) return res.json()
        } catch {}
        const res2 = await fetch(apiUrl('/api/recipes'))
        if (!res2.ok) throw new Error('Error cargando recetas')
        return res2.json()
      }
    })
  }, [])
  return (
    <Container>
      <header>
        <h1><Link to="/">Recetas de Pablo</Link></h1>
        <ThemeToggle />
        <nav style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap', width:'100%'}}>
          {hasToken && isSuccess && me?.role === 'admin' && (
            <Link to="/new" className="btn icon" title="Nueva receta" aria-label="Nueva receta" style={{marginLeft:4}}>+</Link>
          )}
          {hasToken && isSuccess && me?.role === 'admin' && (
            <Link to="/admin/suggestions" className="btn" style={{background:'#555'}}>Sugerencias</Link>
          )}
          <div style={{flexGrow:1}} />
          {hasToken && isSuccess ? (
            <>
              <span style={{fontSize:'0.9rem'}}>Hola, {me.name || me.email}</span>
              <Link to="/favorites" className="btn" style={{background:'#555'}}>Favoritos</Link>
              <Link to="/profile" className="btn" style={{background:'#333'}}>Editar perfil</Link>
              <button onClick={onLogout} className="btn" style={{background:'#444'}}>Salir</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn">Login</Link>
              <Link to="/register" className="btn" style={{background:'#444'}}>Registro</Link>
            </>
          )}
        </nav>
        <MegaMenu />
      </header>
      <main>
        <Routes>
          <Route path="/" element={<RecipeList />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/new" element={hasToken && isSuccess && me?.role === 'admin' ? <RecipeForm /> : <Login />} />
          <Route path="/edit/:id" element={hasToken && isSuccess && me?.role === 'admin' ? <RecipeForm /> : <Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={hasToken && isSuccess ? <Profile /> : <Login />} />
          <Route path="/favorites" element={hasToken && isSuccess ? <Favorites /> : <Login />} />
          <Route path="/admin/suggestions" element={isSuccess && me?.role === 'admin' ? <AdminSuggestions /> : <Login />} />
        </Routes>
      </main>
      <Footer />
      <SuggestionFab />
    </Container>
  )
}
