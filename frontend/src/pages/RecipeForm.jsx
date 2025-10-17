import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const empty = { title: '', description: '', ingredients: [''], steps: [''], image: '', category: [] }

const categoryGroups = [
  {
    label: 'Comidas saladas',
    options: [
      { value: 'saladas', label: 'Comidas saladas (general)' },
      { value: 'ensaladas', label: 'Ensaladas' },
      { value: 'pastas', label: 'Pastas' },
      { value: 'tortillas', label: 'Tortillas' },
      { value: 'sopas', label: 'Sopas' },
      { value: 'arroces', label: 'Arroces' }
    ]
  },
  {
    label: 'Momentos del día',
    options: [
      { value: 'desayuno', label: 'Desayuno' },
      { value: 'almuerzo', label: 'Almuerzo' },
      { value: 'merienda', label: 'Merienda' },
      { value: 'cena', label: 'Cena' }
    ]
  },
  {
    label: 'Postres',
    options: [
      { value: 'postres', label: 'Postres (general)' },
      { value: 'tortas', label: 'Tortas' },
      { value: 'galletas', label: 'Galletas' },
      { value: 'helados', label: 'Helados' }
    ]
  },
  {
    label: 'Bebidas',
    options: [
      { value: 'bebidas-sin', label: 'Bebidas sin alcohol' },
      { value: 'bebidas-con', label: 'Bebidas con alcohol' }
    ]
  },
  {
    label: 'Celebraciones',
    options: [
      { value: 'cumpleanos', label: 'Cumpleaños' },
      { value: 'navidad', label: 'Navidad' },
      { value: 'ano-nuevo', label: 'Año nuevo' },
      { value: 'dia-independencia', label: 'Día de la independencia' }
    ]
  }
]

export default function RecipeForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [data, setData] = useState(empty)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit) {
      setLoading(true)
      fetch(`/api/recipes/${id}`).then(r => r.json()).then(r => {
        const cats = Array.isArray(r.category) ? r.category : (r.category ? [r.category] : [])
        setData({
          title: r.title || '',
          description: r.description || '',
          ingredients: r.ingredients?.length ? r.ingredients : [''],
          steps: r.steps?.length ? r.steps : [''],
          image: r.image || '',
          category: cats
        })
      }).finally(() => setLoading(false))
    }
  }, [id, isEdit])

  const toggleCategory = (cat) => {
    setData(d => {
      const cats = Array.isArray(d.category) ? d.category : []
      if (cats.includes(cat)) {
        return { ...d, category: cats.filter(c => c !== cat) }
      } else {
        return { ...d, category: [...cats, cat] }
      }
    })
  }

  const updateField = (field, value) => setData(d => ({ ...d, [field]: value }))

  const updateArray = (field, i, value) => setData(d => {
    const arr = [...d[field]]
    arr[i] = value
    return { ...d, [field]: arr }
  })

  const addArrayItem = (field) => setData(d => ({ ...d, [field]: [...d[field], ''] }))
  const removeArrayItem = (field, i) => setData(d => ({ ...d, [field]: d[field].filter((_, idx) => idx !== i) }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const method = isEdit ? 'PUT' : 'POST'
    const url = isEdit ? `/api/recipes/${id}` : '/api/recipes'
    const r = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        ingredients: data.ingredients.filter(Boolean),
        steps: data.steps.filter(Boolean),
        image: data.image,
        category: data.category
      })
    })
    setLoading(false)
    if (r.ok) navigate('/')
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <h2>{isEdit ? 'Editar Receta' : 'Nueva Receta'}</h2>
      <label>
        Título
        <input value={data.title} onChange={e => updateField('title', e.target.value)} required />
      </label>
      <label>
        Descripción
        <textarea value={data.description} onChange={e => updateField('description', e.target.value)} required />
      </label>
      <label>
        URL de imagen (opcional)
        <input value={data.image} onChange={e => updateField('image', e.target.value)} placeholder="https://..." />
      </label>
      <fieldset>
        <legend>Categorías (selecciona todas las que apliquen)</legend>
        <div className="category-checkboxes">
          {categoryGroups.map(group => (
            <div key={group.label} className="category-group">
              <h4>{group.label}</h4>
              {group.options.map(opt => {
                const cats = Array.isArray(data.category) ? data.category : []
                const isChecked = cats.includes(opt.value)
                return (
                  <label key={opt.value} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCategory(opt.value)}
                    />
                    <span>{opt.label}</span>
                  </label>
                )
              })}
            </div>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Ingredientes</legend>
        {data.ingredients.map((ing, i) => (
          <div key={i} className="row">
            <input value={ing} onChange={e => updateArray('ingredients', i, e.target.value)} placeholder={`Ingrediente ${i+1}`} />
            <button type="button" onClick={() => removeArrayItem('ingredients', i)} className="icon">✕</button>
          </div>
        ))}
        <button type="button" onClick={() => addArrayItem('ingredients')} className="btn">Añadir ingrediente</button>
      </fieldset>
      <fieldset>
        <legend>Pasos</legend>
        {data.steps.map((s, i) => (
          <div key={i} className="row">
            <input value={s} onChange={e => updateArray('steps', i, e.target.value)} placeholder={`Paso ${i+1}`} />
            <button type="button" onClick={() => removeArrayItem('steps', i)} className="icon">✕</button>
          </div>
        ))}
        <button type="button" onClick={() => addArrayItem('steps')} className="btn">Añadir paso</button>
      </fieldset>
      <div className="actions">
        <button className="btn" disabled={loading} type="submit">{loading ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </form>
  )
}
