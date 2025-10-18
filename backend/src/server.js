import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';
import { nanoid } from 'nanoid';
import { getAllRecipes, getRecipe, createRecipe, updateRecipe, deleteRecipe, migrateFromJsonIfEmpty, paths } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataPath = join(__dirname, 'data', 'recipes.json');

const app = express();
app.use(cors());
app.use(express.json());

async function ensureDataFile() {
  try {
    await fs.access(dataPath);
  } catch {
    await fs.mkdir(join(__dirname, 'data'), { recursive: true });
    await fs.writeFile(dataPath, JSON.stringify([], null, 2), 'utf-8');
  }
}

// Ruta raíz para evitar "Cannot GET /" y dar una pista de uso
app.get('/', (_req, res) => {
  res.type('text/plain').send('API de recetas activa. Endpoints: /api/health, /api/recipes');
});

async function readRecipes() {
  return getAllRecipes();
}

async function writeRecipes(recipes) {
  // Ya no se usa con DB; se mantiene por compatibilidad en algunos flujos
  await fs.writeFile(dataPath, JSON.stringify(recipes, null, 2), 'utf-8');
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/recipes', async (_req, res) => {
  try {
    const recipes = await readRecipes();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: 'Error leyendo recetas', details: String(err) });
  }
});

app.get('/api/recipes/:id', async (req, res) => {
  try {
    const recipe = getRecipe(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Receta no encontrada' });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: 'Error leyendo receta', details: String(err) });
  }
});

app.post('/api/recipes', async (req, res) => {
  try {
    const { title, description, ingredients, steps, image, category } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'title y description son requeridos' });
    let catArr = [];
    if (Array.isArray(category)) {
      catArr = category.filter(c => typeof c === 'string' && c.trim()).map(c => c.trim());
    } else if (typeof category === 'string' && category.trim()) {
      catArr = [category.trim()];
    } else {
      catArr = ['saladas'];
    }
    const created = createRecipe({
      id: nanoid(10),
      title,
      description,
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      steps: Array.isArray(steps) ? steps : [],
      image: image || '',
      category: catArr
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Error creando receta', details: String(err) });
  }
});

app.put('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, ingredients, steps, image, category } = req.body;
    const existing = getRecipe(id);
    if (!existing) return res.status(404).json({ error: 'Receta no encontrada' });
    let catArr = existing.category || [];
    if (category !== undefined) {
      if (Array.isArray(category)) {
        catArr = category.filter(c => typeof c === 'string' && c.trim()).map(c => c.trim());
      } else if (typeof category === 'string' && category.trim()) {
        catArr = [category.trim()];
      }
    }
    const updated = updateRecipe(id, {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(ingredients !== undefined ? { ingredients } : {}),
      ...(steps !== undefined ? { steps } : {}),
      ...(image !== undefined ? { image } : {}),
      category: catArr
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando receta', details: String(err) });
  }
});

app.delete('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ok = deleteRecipe(id);
    if (!ok) return res.status(404).json({ error: 'Receta no encontrada' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Error eliminando receta', details: String(err) });
  }
});

const PORT = process.env.PORT || 3001;
// Intentar migrar datos existentes desde recipes.json a SQLite la primera vez
migrateFromJsonIfEmpty(dataPath).then((migrated) => {
  if (migrated > 0) {
    console.log(`Migradas ${migrated} recetas desde JSON a SQLite. DB: ${paths.dbPath}`);
  }
  app.listen(PORT, () => {
    console.log(`API de recetas escuchando en http://localhost:${PORT}`);
  });
}).catch(() => {
  app.listen(PORT, () => {
    console.log(`API de recetas escuchando en http://localhost:${PORT}`);
  });
});
