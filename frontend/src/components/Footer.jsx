import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-links">
        <Link to="/?cat=saladas" className="footer-link">
          🍕 Comida Salada
        </Link>
        <Link to="/?cat=postres" className="footer-link">
          🍰 Postres
        </Link>
        <Link to="/?cat=bebidas" className="footer-link">
          🥤 Bebidas
        </Link>
      </div>
      <div className="footer-credits">
        <small>Hecho con React + Vite</small>
      </div>
    </footer>
  )
}
