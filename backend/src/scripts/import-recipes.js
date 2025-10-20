#!/usr/bin/env node
// Importa recetas desde un archivo JSON o módulo JS y las guarda en SQLite
// Uso:
//   node src/scripts/import-recipes.js ./ruta/al/archivo.json
//   node src/scripts/import-recipes.js ./ruta/al/modulo.js

import { resolve, extname } from 'path'
import { pathToFileURL } from 'url'
import fs from 'fs/promises'
import { createRecipe, getRecipe, paths } from '../db.js'
import { nanoid } from 'nanoid'

function printUsage() {
  console.log('Uso:')
  console.log('  node src/scripts/import-recipes.js <ruta-archivo>')
  console.log('    - Acepta JSON (array) o JS ESM que exporte default o named "recipes" (array).')
}

async function loadItems(filePath) {
  const abs = resolve(process.cwd(), filePath)
  const ext = extname(abs).toLowerCase()
  if (ext === '.json') {
    const txt = await fs.readFile(abs, 'utf-8')
    return JSON.parse(txt)
  }
  // Para .js/.mjs u otros, intentar import dinámico
  const mod = await import(pathToFileURL(abs).href)
  const items = mod?.default ?? mod?.recipes
  if (!items) throw new Error('El módulo no exporta default ni "recipes"')
  return items
}

function normalizeRecipe(it) {
  if (!it || typeof it !== 'object') return null
  const title = (it.title ?? '').toString().trim()
  const description = (it.description ?? '').toString().trim()
  if (!title || !description) return null
  let category = []
  if (Array.isArray(it.category)) {
    category = it.category.map(String).map(s => s.trim()).filter(Boolean)
  } else if (typeof it.category === 'string') {
    const s = it.category.trim()
    if (s) category = [s]
  } else {
    category = ['saladas']
  }
  return {
    id: it.id ? String(it.id) : nanoid(10),
    title,
    description,
    ingredients: Array.isArray(it.ingredients) ? it.ingredients : [],
    steps: Array.isArray(it.steps) ? it.steps : [],
    image: typeof it.image === 'string' ? it.image : '',
    category,
    createdAt: it.createdAt,
    updatedAt: it.updatedAt,
  }
}

async function main() {
  const fileArg = process.argv[2]
  if (!fileArg) {
    printUsage()
    process.exitCode = 1
    return
  }
  try {
    const raw = await loadItems(fileArg)
    if (!Array.isArray(raw)) throw new Error('El archivo no contiene un array de recetas')
    let ok = 0, skipped = 0, failed = 0
    for (const r of raw) {
      const rec = normalizeRecipe(r)
      if (!rec) { failed++; continue }
      try {
        // Evitar duplicados por id si ya existe
        const exists = getRecipe(rec.id)
        if (exists) { skipped++; continue }
        createRecipe(rec)
        ok++
      } catch {
        failed++
      }
    }
    console.log(`Importación completa -> insertadas: ${ok}, omitidas: ${skipped}, fallidas: ${failed}`)
    console.log(`Base de datos: ${paths.dbPath}`)
  } catch (err) {
    console.error('Error en importación:', err?.message || String(err))
    process.exitCode = 1
  }
}

main()
