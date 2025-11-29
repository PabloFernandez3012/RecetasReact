export default function About() {
  return (
    <div className="card" style={{padding:16}}>
      <h2>Acerca de</h2>
      <p>
        Esta aplicación muestra y gestiona recetas con autenticación, favoritos y roles de administrador.
      </p>
      <h3>Tecnologías usadas</h3>
      <ul>
        <li>React 18 + Vite</li>
        <li>React Router</li>
        <li>TanStack Query (React Query)</li>
        <li>Node.js + Express</li>
        <li>SQLite (better-sqlite3)</li>
        <li>JWT para autenticación</li>
      </ul>
      <h3>Repositorio</h3>
      <p>
        Código fuente en GitHub:
        {' '}<a href="https://github.com/PabloFernandez3012/RecetasReact" target="_blank" rel="noreferrer">PabloFernandez3012/RecetasReact</a>
      </p>
    </div>
  )
}
