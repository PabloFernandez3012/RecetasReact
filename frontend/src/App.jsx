import { Link, Route, Routes } from 'react-router-dom'
import MegaMenu from './components/MegaMenu'
import Footer from './components/Footer'
import RecipeList from './pages/RecipeList'
import RecipeDetail from './pages/RecipeDetail'
import RecipeForm from './pages/RecipeForm'

export default function App() {
  return (
    <>
      <div className="app-wrapper">
        <div className="container">
          <header>
            <h1><Link to="/">Recetas de Pablo</Link></h1>
            <nav style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap', width:'100%'}}>
              <MegaMenu />
              <div style={{flexGrow:1}} />
              <Link to="/new" className="btn icon" title="Nueva receta" aria-label="Nueva receta">+</Link>
            </nav>
          </header>
          <main>
            <Routes>
              <Route path="/" element={<RecipeList />} />
              <Route path="/recipe/:id" element={<RecipeDetail />} />
              <Route path="/new" element={<RecipeForm />} />
              <Route path="/edit/:id" element={<RecipeForm />} />
            </Routes>
          </main>
        </div>
      </div>
      <Footer />
    </>
  )
}
