import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'

const MENU = [
  {
    key: 'saladas',
    label: 'Comidas saladas',
    icon: '🍲',
    subs: [
      { key: 'ensaladas', label: 'Ensaladas' },
      { key: 'pastas', label: 'Pastas' },
      { key: 'tortillas', label: 'Tortillas' },
      { key: 'sopas', label: 'Sopas' },
      { key: 'arroces', label: 'Arroces' }
    ]
  },
  {
    key: 'momentos',
    label: 'Momentos del día',
    icon: '🕒',
    subs: [
      { key: 'desayuno', label: 'Desayuno' },
      { key: 'almuerzo', label: 'Almuerzo' },
      { key: 'merienda', label: 'Merienda' },
      { key: 'cena', label: 'Cena' }
    ]
  },
  {
    key: 'postres',
    label: 'Postres',
    icon: '🍰',
    subs: [
      { key: 'tortas', label: 'Tortas' },
      { key: 'galletas', label: 'Galletas' },
      { key: 'helados', label: 'Helados' }
    ]
  },
  {
    key: 'bebidas',
    label: 'Bebidas',
    icon: '🥤',
    subs: [
      { key: 'bebidas-sin', label: 'Sin alcohol' },
      { key: 'bebidas-con', label: 'Con alcohol' }
    ]
  },
  {
    key: 'celebraciones',
    label: 'Celebraciones',
    icon: '🎉',
    subs: [
      { key: 'cumpleanos', label: 'Cumpleaños' },
      { key: 'navidad', label: 'Navidad' },
      { key: 'ano-nuevo', label: 'Año nuevo' },
      { key: 'dia-independencia', label: 'Día de la independencia' }
    ]
  }
]

export default function MegaMenu() {
  const [sp, setSp] = useSearchParams()
  const [open, setOpen] = useState(false)
  const cat = sp.get('cat') || ''

  const handleSelect = (key) => {
    setSp({ cat: key })
    setOpen(false)
  }

  useEffect(() => {
    const close = () => setOpen(false)
    if (open) document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [open])

  return (
    <div className="megamenu">
      <button className="megamenu-trigger" onClick={e => { e.stopPropagation(); setOpen(v => !v) }}>
        <span>Recetas</span> <span style={{fontSize:'1.2em'}}>▼</span>
      </button>
      {open && (
        <div className="megamenu-dropdown" onClick={e => e.stopPropagation()}>
          <div className="megamenu-cols">
            {MENU.map(col => (
              <div key={col.key} className="megamenu-col">
                <div className="megamenu-col-title">
                  <span className="megamenu-icon">{col.icon}</span> {col.label}
                </div>
                <ul>
                  {col.subs.map(sub => (
                    <li key={sub.key}>
                      <button
                        className={`megamenu-link${cat === sub.key ? ' active' : ''}`}
                        onClick={() => handleSelect(sub.key)}
                      >{sub.label}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
