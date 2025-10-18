import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { promises as fs } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dataDir = join(__dirname, 'data')
const dbPath = join(dataDir, 'recipes.db')

await fs.mkdir(dataDir, { recursive: true })

// Abrir DB y asegurar esquema
const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS recipes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    steps TEXT NOT NULL,
    image TEXT NOT NULL,
    category TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );
`)

function mapRow(row) {
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    ingredients: JSON.parse(row.ingredients || '[]'),
    steps: JSON.parse(row.steps || '[]'),
    image: row.image,
    category: JSON.parse(row.category || '[]'),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function getAllRecipes() {
  const stmt = db.prepare('SELECT * FROM recipes ORDER BY datetime(createdAt) DESC')
  const rows = stmt.all()
  return rows.map(mapRow)
}

export function getRecipe(id) {
  const stmt = db.prepare('SELECT * FROM recipes WHERE id = ?')
  const row = stmt.get(id)
  return mapRow(row)
}

export function createRecipe(recipe) {
  const now = new Date().toISOString()
  const r = {
    ...recipe,
    createdAt: now,
    updatedAt: now,
  }
  const stmt = db.prepare(`
    INSERT INTO recipes (id, title, description, ingredients, steps, image, category, createdAt, updatedAt)
    VALUES (@id, @title, @description, @ingredients, @steps, @image, @category, @createdAt, @updatedAt)
  `)
  stmt.run({
    id: r.id,
    title: r.title,
    description: r.description,
    ingredients: JSON.stringify(r.ingredients ?? []),
    steps: JSON.stringify(r.steps ?? []),
    image: r.image ?? '',
    category: JSON.stringify(r.category ?? []),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  })
  return getRecipe(r.id)
}

export function updateRecipe(id, fields) {
  const allowed = ['title', 'description', 'ingredients', 'steps', 'image', 'category']
  const setParts = []
  const params = { id }
  for (const key of allowed) {
    if (key in fields) {
      const col = key
      const val = (key === 'ingredients' || key === 'steps' || key === 'category')
        ? JSON.stringify(fields[key] ?? [])
        : fields[key]
      setParts.push(`${col} = @${col}`)
      params[col] = val
    }
  }
  setParts.push('updatedAt = @updatedAt')
  params.updatedAt = new Date().toISOString()
  if (setParts.length === 1) return getRecipe(id)
  const sql = `UPDATE recipes SET ${setParts.join(', ')} WHERE id = @id`
  const stmt = db.prepare(sql)
  stmt.run(params)
  return getRecipe(id)
}

export function deleteRecipe(id) {
  const stmt = db.prepare('DELETE FROM recipes WHERE id = ?')
  const info = stmt.run(id)
  return info.changes > 0
}

export async function migrateFromJsonIfEmpty(jsonPath) {
  // Solo migrar si la tabla está vacía y existe el archivo JSON
  const count = db.prepare('SELECT COUNT(*) as c FROM recipes').get().c
  if (count > 0) return 0
  try {
    const text = await fs.readFile(jsonPath, 'utf-8')
    const arr = JSON.parse(text)
    if (!Array.isArray(arr) || arr.length === 0) return 0
    const insert = db.prepare(`
      INSERT INTO recipes (id, title, description, ingredients, steps, image, category, createdAt, updatedAt)
      VALUES (@id, @title, @description, @ingredients, @steps, @image, @category, @createdAt, @updatedAt)
    `)
    const now = new Date().toISOString()
    const tx = db.transaction((items) => {
      for (const it of items) {
        insert.run({
          id: it.id,
          title: it.title,
          description: it.description,
          ingredients: JSON.stringify(it.ingredients ?? []),
          steps: JSON.stringify(it.steps ?? []),
          image: it.image ?? '',
          category: JSON.stringify(Array.isArray(it.category) ? it.category : (it.category ? [it.category] : [])),
          createdAt: it.createdAt ?? now,
          updatedAt: it.updatedAt ?? now,
        })
      }
    })
    tx(arr)
    return arr.length
  } catch {
    return 0
  }
}

export const paths = { dbPath, dataDir }
