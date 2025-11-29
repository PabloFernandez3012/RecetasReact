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
      { key: 'arroces', label: 'Arroces' },
      { key: 'carnes', label: 'Carnes' },
      { key: 'pescados', label: 'Pescados' },
      { key: 'vegetarianas', label: 'Vegetarianas' },
      { key: 'veganas', label: 'Veganas' }
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
  const [activeTab, setActiveTab] = useState(null)
  const cat = sp.get('cat') || ''

  const handleSelect = (key) => {
    setSp({ cat: key })
  }

  const handleTabClick = (key) => {
    setActiveTab(activeTab === key ? null : key)
  }

  useEffect(() => {
    const close = () => setActiveTab(null)
    if (activeTab) document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [activeTab])

  return (
    <div className="tab-menu">
      <div className="tab-menu-tabs">
        {MENU.map(tab => (
          <button
            key={tab.key}
            className={`tab-menu-tab${activeTab === tab.key ? ' active' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleTabClick(tab.key) }}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
      {activeTab && (
        <div className="tab-menu-content" onClick={e => e.stopPropagation()}>
          <div className="tab-menu-items">
            {MENU.find(m => m.key === activeTab)?.subs.map(sub => (
              <button
                key={sub.key}
                className={`tab-menu-item${cat === sub.key ? ' active' : ''}`}
                onClick={() => handleSelect(sub.key)}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
