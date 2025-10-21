import { Link } from 'react-router-dom'

// Categorías alineadas con RecipeForm y MegaMenu
const CATEGORIES = [
  // Comidas saladas
  { key: 'saladas', label: 'Comidas saladas' },
  { key: 'ensaladas', label: 'Ensaladas' },
  { key: 'pastas', label: 'Pastas' },
  { key: 'tortillas', label: 'Tortillas' },
  { key: 'sopas', label: 'Sopas' },
  { key: 'arroces', label: 'Arroces' },
  { key: 'carnes', label: 'Carnes' },
  { key: 'pescados', label: 'Pescados' },
  { key: 'vegetarianas', label: 'Vegetarianas' },
  { key: 'veganas', label: 'Veganas' },

  // Momentos del día
  { key: 'desayuno', label: 'Desayuno' },
  { key: 'almuerzo', label: 'Almuerzo' },
  { key: 'merienda', label: 'Merienda' },
  { key: 'cena', label: 'Cena' },

  // Postres
  { key: 'postres', label: 'Postres' },
  { key: 'tortas', label: 'Tortas' },
  { key: 'galletas', label: 'Galletas' },
  { key: 'helados', label: 'Helados' },

  // Bebidas
  { key: 'bebidas-sin', label: 'Bebidas sin alcohol' },
  { key: 'bebidas-con', label: 'Bebidas con alcohol' },

  // Celebraciones
  { key: 'cumpleanos', label: 'Cumpleaños' },
  { key: 'navidad', label: 'Navidad' },
  { key: 'ano-nuevo', label: 'Año nuevo' },
  { key: 'dia-independencia', label: 'Día de la independencia' },
]

export default function Footer() {
  return (
    <footer className="footer-new">
      <div className="footer-content">
        <section className="footer-left">
          <h3 className="footer-title">Categorías de Recetas</h3>
          <div className="footer-grid">
            {CATEGORIES.map((c) => (
              <Link key={c.key} to={`/?cat=${c.key}`} className="footer-link">
                {c.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="footer-right">
          <a
            href="https://github.com/PabloFernandez3012"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
            aria-label="GitHub de Pablo"
          >
            <svg width="22" height="22" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            <span>GitHub</span>
          </a>
        </section>
      </div>
    </footer>
  )
}
