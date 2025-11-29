import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';
import { nanoid } from 'nanoid';
import { getAllRecipes, getRecipe, createRecipe, updateRecipe, deleteRecipe, migrateFromJsonIfEmpty, paths } from './db.js';
import { registerUser, loginUser, authMiddleware, getMe, updateProfile } from './auth.js';
import net from 'net';

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
  // No-op con DB, mantenemos por compatibilidad mínima
  await fs.writeFile(dataPath, JSON.stringify(recipes, null, 2), 'utf-8');
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// === Auth endpoints ===
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body
    const { token } = await registerUser(email, password, name)
    res.status(201).json({ token })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const { token } = await loginUser(email, password)
    res.json({ token })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.get('/api/me', authMiddleware, (req, res) => {
  const user = getMe(req.userId)
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })
  res.json(user)
})

app.put('/api/profile', authMiddleware, async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body
    const updated = await updateProfile(req.userId, { name, currentPassword, newPassword })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

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

app.post('/api/recipes', authMiddleware, async (req, res) => {
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

app.put('/api/recipes/:id', authMiddleware, async (req, res) => {
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

app.delete('/api/recipes/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const ok = deleteRecipe(id);
    if (!ok) return res.status(404).json({ error: 'Receta no encontrada' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Error eliminando receta', details: String(err) });
  }
});

const BASE_PORT = Number(process.env.PORT) || 3001;
let server;

function findAvailablePort(startPort) {
  return new Promise((resolve) => {
    const tryPort = (p) => {
      const tester = net.createServer()
        .once('error', (err) => {
          if ((err.code === 'EADDRINUSE' || err.code === 'EACCES') && p < startPort + 10) {
            // probar siguiente puerto hasta +10 para entorno dev
            tryPort(p + 1);
          } else {
            resolve(startPort); // si falla distinto, usar el base y dejar que falle expresamente
          }
        })
        .once('listening', () => {
          tester.close(() => resolve(p));
        })
        .listen(p, '0.0.0.0');
    };
    tryPort(startPort);
  });
}

function start(port) {
  // Migración inicial y luego levantar servidor
  migrateFromJsonIfEmpty(dataPath).then((migrated) => {
    if (migrated > 0) {
      console.log(`Migradas ${migrated} recetas desde JSON a SQLite. DB: ${paths.dbPath}`);
    }
    server = app.listen(port, () => {
      console.log(`API de recetas escuchando en http://localhost:${port}`);
    });
    // Manejo cierre limpio para nodemon (SIGUSR2) y otros
    process.once('SIGUSR2', () => {
      console.log('Recibido SIGUSR2: cerrando servidor antes de reinicio nodemon...');
      server.close(() => {
        process.kill(process.pid, 'SIGUSR2');
      });
    });
    process.once('SIGINT', () => {
      console.log('SIGINT recibido, cerrando servidor...');
      server.close(() => process.exit(0));
    });
    process.once('SIGTERM', () => {
      console.log('SIGTERM recibido, cerrando servidor...');
      server.close(() => process.exit(0));
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Puerto ${port} en uso. Inicie solo una instancia de backend o cambie PORT.`);
      } else {
        console.error('Error del servidor:', err);
      }
    });
  }).catch((e) => {
    console.error('Error durante migración inicial:', e);
    server = app.listen(port, () => {
      console.log(`API de recetas escuchando en http://localhost:${port}`);
    });
  });
}

findAvailablePort(BASE_PORT).then((port) => {
  if (port !== BASE_PORT) {
    console.warn(`Puerto ${BASE_PORT} ocupado. Usando puerto alternativo ${port}.`);
  }
  start(port);
});
