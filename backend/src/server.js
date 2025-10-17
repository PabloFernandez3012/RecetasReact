import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';
import { nanoid } from 'nanoid';

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
  await ensureDataFile();
  const text = await fs.readFile(dataPath, 'utf-8');
  return JSON.parse(text);
}

async function writeRecipes(recipes) {
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
    const recipes = await readRecipes();
    const recipe = recipes.find(r => r.id === req.params.id);
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
    const newRecipe = {
      id: nanoid(10),
      title,
      description,
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      steps: Array.isArray(steps) ? steps : [],
      image: image || '',
      category: catArr
    };
    const recipes = await readRecipes();
    recipes.push(newRecipe);
    await writeRecipes(recipes);
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(500).json({ error: 'Error creando receta', details: String(err) });
  }
});

app.put('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, ingredients, steps, image, category } = req.body;
    const recipes = await readRecipes();
    const idx = recipes.findIndex(r => r.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Receta no encontrada' });
    let catArr = recipes[idx].category || [];
    if (category !== undefined) {
      if (Array.isArray(category)) {
        catArr = category.filter(c => typeof c === 'string' && c.trim()).map(c => c.trim());
      } else if (typeof category === 'string' && category.trim()) {
        catArr = [category.trim()];
      }
    }
    const updated = {
      ...recipes[idx],
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(ingredients !== undefined ? { ingredients } : {}),
      ...(steps !== undefined ? { steps } : {}),
      ...(image !== undefined ? { image } : {}),
      category: catArr
    };
    recipes[idx] = updated;
    await writeRecipes(recipes);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando receta', details: String(err) });
  }
});

app.delete('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const recipes = await readRecipes();
    const exists = recipes.some(r => r.id === id);
    if (!exists) return res.status(404).json({ error: 'Receta no encontrada' });
    const filtered = recipes.filter(r => r.id !== id);
    await writeRecipes(filtered);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Error eliminando receta', details: String(err) });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API de recetas escuchando en http://localhost:${PORT}`);
});
