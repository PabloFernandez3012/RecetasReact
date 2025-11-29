import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
import { promises as fsp } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
// Permitir configurar la ruta de datos vía variables de entorno para despliegues (Railway/Render)
const envDataDir = process.env.DATA_DIR && process.env.DATA_DIR.trim()
const envDbPath = process.env.DB_PATH && process.env.DB_PATH.trim()
const defaultDataDir = join(__dirname, 'data')
const dataDir = envDbPath ? dirname(envDbPath) : (envDataDir || defaultDataDir)
const dbPath = envDbPath || join(dataDir, 'recipes.db')

// Asegurar carpeta de datos (sin top-level await)
try { fs.mkdirSync(dataDir, { recursive: true }) } catch {}

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
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    createdAt TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS favorites (
    userId TEXT NOT NULL,
    recipeId TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    PRIMARY KEY (userId, recipeId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE
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
    category: JSON.stringify(Array.isArray(r.category) ? r.category : (r.category ? [r.category] : [])),
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
    const text = await fsp.readFile(jsonPath, 'utf-8')
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

// ==== Users helpers ====
export function createUser({ id, email, passwordHash, name, role = 'user' }) {
  const now = new Date().toISOString()
  const stmt = db.prepare('INSERT INTO users (id, email, passwordHash, name, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)')
  stmt.run(id, email, passwordHash, name || null, role, now)
  return getUserByEmail(email)
}

export function getUserByEmail(email) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
  const row = stmt.get(email)
  if (!row) return null
  return { id: row.id, email: row.email, passwordHash: row.passwordHash, name: row.name, role: row.role, createdAt: row.createdAt }
}

export function getUserById(id) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
  const row = stmt.get(id)
  if (!row) return null
  return { id: row.id, email: row.email, passwordHash: row.passwordHash, name: row.name, role: row.role, createdAt: row.createdAt }
}

// ==== Favorites helpers ====
export function addFavorite(userId, recipeId) {
  const now = new Date().toISOString()
  try {
    db.prepare('INSERT INTO favorites (userId, recipeId, createdAt) VALUES (?, ?, ?)').run(userId, recipeId, now)
  } catch {}
  return true
}

export function removeFavorite(userId, recipeId) {
  const info = db.prepare('DELETE FROM favorites WHERE userId = ? AND recipeId = ?').run(userId, recipeId)
  return info.changes > 0
}

export function getFavoriteIds(userId) {
  const rows = db.prepare('SELECT recipeId FROM favorites WHERE userId = ?').all(userId)
  return rows.map(r => r.recipeId)
}

export function getFavorites(userId) {
  const stmt = db.prepare(`SELECT r.* FROM favorites f JOIN recipes r ON r.id = f.recipeId WHERE f.userId = ? ORDER BY datetime(f.createdAt) DESC`)
  return stmt.all(userId).map(mapRow)
}

export function updateUser(id, fields) {
  const allowed = ['name', 'passwordHash']
  const setParts = []
  const params = { id }
  for (const key of allowed) {
    if (key in fields && fields[key] !== undefined) {
      setParts.push(`${key} = @${key}`)
      params[key] = fields[key] === '' ? null : fields[key]
    }
  }
  if (!setParts.length) return getUserById(id)
  const sql = `UPDATE users SET ${setParts.join(', ')} WHERE id = @id`
  db.prepare(sql).run(params)
  return getUserById(id)
}

// Ensure name column exists if table was created before
try {
  const cols = db.prepare('PRAGMA table_info(users)').all()
  if (!cols.find(c => c.name === 'name')) {
    db.prepare('ALTER TABLE users ADD COLUMN name TEXT').run()
  }
  if (!cols.find(c => c.name === 'role')) {
    db.prepare("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'").run()
    // Backfill nulls if any (older rows)
    db.prepare("UPDATE users SET role='user' WHERE role IS NULL").run()
  }
} catch {}
