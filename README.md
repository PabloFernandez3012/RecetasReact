# Recetas de Pablo

Aplicación de recetas con frontend en React y backend en Node.js/Express. Permite crear, listar, editar y eliminar recetas con categorías, imágenes por URL, búsqueda por texto y selección por categorías. Incluye cambio de tema claro/oscuro y un pie de página con acceso rápido a categorías.

---

## Demo

**Sitio en producción:** https://recetas-react-weld.vercel.app

---

## Etiquetas

`react` `vite` `node` `express` `sqlite` `recetas` `crud` `react-query` `tanstack-query` `custom-hooks` `vercel` `render` `railway`

---

## Tabla de contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Gestión de datos con React Query](#gestión-de-datos-con-react-query)
- [Requisitos](#requisitos)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Desarrollo local](#desarrollo-local)
- [Variables de entorno](#variables-de-entorno-del-frontend)
- [Despliegue](#despliegue)
- [Importación de recetas](#importación-de-recetas-a-la-base-de-datos)
- [Scripts útiles](#scripts-útiles)
- [Notas](#notas)

---

## Características

- **CRUD completo** de recetas (título, descripción, ingredientes, pasos, imagen, categorías)
- **React Router** para navegación entre vistas
- **Rutas públicas y privadas** (protección por sesión y por rol `admin`)
- **React Query** para gestión de estado del servidor con caché, sincronización automática y estados de UI
- **Filtro por categorías** y búsqueda por texto en títulos, descripciones, ingredientes y pasos
- **Estados de UI profesionales**: Loading, Error y Empty states en todas las vistas
- **Menú MegaMenu** con categorías y pie de página con enlaces rápidos
- **Tema claro/oscuro** con selector y persistencia en localStorage
- **Frontend desacoplado** del backend mediante `VITE_API_BASE`
- **Persistencia con SQLite** mediante `better-sqlite3`, migración inicial desde JSON y script de importación
- **Custom hooks** para reutilización de lógica de fetching y mutations
- **Autenticación JWT** (registro, login, sesión y protección de rutas de escritura)
- **Favoritos**: marcar recetas como favoritas (like) y verlas en una sección dedicada

---

## Temas aplicados

- **React Router**: Navegación y rutas en `frontend/src/App.jsx` y envoltura en `frontend/src/main.jsx`.
- **Rutas públicas y privadas**: Condicionales de acceso por sesión y rol:
  - Rutas solo autenticado: `/profile`, `/favorites`.
  - Rutas solo administrador: `/new`, `/edit/:id`.
- **Context / useReducer / useRef / createPortal**: No se utilizan actualmente porque no son necesarios para el alcance del proyecto; se dejan como opcionales y pueden añadirse si el requerimiento lo demanda.

---

## Tecnologías

### Frontend
- React 18
- Vite
- React Router
- **TanStack Query** (React Query) - Gestión de estado del servidor
- SCSS

### Backend
- Node.js
- Express
- better-sqlite3
- nanoid
- CORS

### Herramientas
- concurrently
- nodemon

---

## Autenticación (JWT)

El proyecto incluye autenticación basada en **JSON Web Tokens (JWT)** para proteger las operaciones de creación, edición y eliminación de recetas.

### 🔐 Flujo
1. El usuario se registra (`/api/register`) o inicia sesión (`/api/login`).
2. El backend devuelve un `token` JWT.
3. El frontend guarda el token en `localStorage` (`auth_token`).
4. Las rutas protegidas envían `Authorization: Bearer <token>`.
5. Mutaciones (POST/PUT/DELETE) requieren token válido.

### 🧩 Endpoints de autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/register` | Registra un nuevo usuario y devuelve token |
| `POST` | `/api/login` | Inicia sesión y devuelve token |
| `GET` | `/api/me` | Devuelve datos del usuario autenticado |
| `POST` | `/api/users/:id/promote` | Promueve un usuario a admin (solo admin) |

### 🛠 Estructura del usuario (no se exponen `passwordHash`):
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "admin | user",
  "createdAt": "ISO-8601"
}
```

### ✅ Seguridad básica incluida
- Hash de contraseñas con `bcrypt`.
- Tokens firmados con `HS256` (`JWT_SECRET`).
- Rutas de mutación protegidas con middleware.
- Roles: solo `admin` puede crear, editar y eliminar recetas. `user` puede leer y marcar favoritos.

### ⚠️ Mejoras futuras recomendadas
- Rate limiting.
- Refresh tokens / expiración más corta.
- Cookies httpOnly para evitar XSS.
- Validaciones adicionales de password (longitud, complejidad).

---

## Gestión de datos con React Query

El proyecto utiliza **TanStack Query (React Query)** para la gestión profesional de datos del servidor, eliminando la necesidad de gestionar manualmente estados de loading, errores y caché.

### 🎯 Ventajas implementadas

- ✅ **Caché automático**: Los datos se cachean y reutilizan entre componentes
- ✅ **Sincronización**: Actualización automática tras mutaciones (crear, editar, eliminar)
- ✅ **Estados de UI**: Loading, error y empty states en todas las vistas
- ✅ **Optimización**: Reducción de peticiones innecesarias al servidor
- ✅ **Devtools**: Herramientas de desarrollo para inspeccionar queries

### � Estructura de hooks personalizados

**`frontend/src/hooks/useRecipes.js`** - Custom hooks con React Query:

```javascript
// Queries (Lecturas)
useRecipes()          // Obtiene todas las recetas
useRecipe(id)         // Obtiene una receta específica

// Mutations (Escrituras)
useCreateRecipe()     // Crea una nueva receta
useUpdateRecipe()     // Actualiza una receta existente
useDeleteRecipe()     // Elimina una receta
```

### 🔄 Ejemplo de uso

**RecipeList.jsx** - Lista con estados de UI:
```javascript
const { data: recipes, isLoading, isError, error } = useRecipes()

if (isLoading) return <LoadingState />
if (isError) return <ErrorState message={error.message} />
if (recipes.length === 0) return <EmptyState />

return <RecipeCards recipes={recipes} />
```

**RecipeForm.jsx** - Crear/editar con mutations:
```javascript
const createMutation = useCreateRecipe()
const updateMutation = useUpdateRecipe()

const onSubmit = async (data) => {
  await createMutation.mutateAsync(data)
  // La lista se actualiza automáticamente gracias a invalidateQueries
}
```

### 🎨 Estados de UI implementados

| Estado | Cuándo se muestra | Componentes |
|--------|------------------|-------------|
| **Loading** | Mientras carga datos del servidor | RecipeList, RecipeDetail, RecipeForm (edit) |
| **Error** | Si falla la petición HTTP | Todos los componentes con queries |
| **Empty** | Cuando no hay datos que mostrar | RecipeList (sin recetas o filtro vacío) |
| **Saving** | Durante mutations (crear/editar/eliminar) | RecipeForm, RecipeDetail |

### ⚙️ Configuración

**`frontend/src/lib/queryClient.js`**:
## Roles y Superusuario

El sistema soporta roles:

### Asignación de roles

Asignación inicial de admin:
Define `ADMIN_EMAILS` (separado por comas) en las variables de entorno del backend. Cualquier email que se registre coincidiendo con esa lista obtiene rol `admin`.

Promoción manual:
Endpoint protegido: `POST /api/users/:id/promote` (solo un admin existente). Actualiza el rol del usuario a `admin`.

Ejemplo (PowerShell):
```powershell
$token = "<TOKEN_ADMIN>"
Invoke-RestMethod -Method POST -Uri "http://localhost:3001/api/users/USER_ID/promote" -Headers @{Authorization="Bearer $token"}
```

Verificación de rol en frontend: la UI muestra botones de edición / creación sólo si el usuario autenticado tiene `role === 'admin'`.
```javascript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
```

---

### Crear un superusuario

Tienes dos formas de crear el primer usuario administrador:

- **Opción A — Por variable de entorno (automático al registrarse):**
  Define `ADMIN_EMAILS` con una lista de correos (separados por comas). Cualquier usuario que se registre con uno de esos correos será admin.

  ```powershell
  # En desarrollo local
  $env:ADMIN_EMAILS = "admin@ejemplo.com,otro@ejemplo.com"; npm run dev -w backend
  ```

- **Opción B — Promoción manual (post-registro):**
  Promueve una cuenta existente a admin.

  1) Vía API (requiere estar autenticado como admin existente):
  ```powershell
  $token = "<TOKEN_ADMIN>"
  Invoke-RestMethod -Method POST -Uri "http://localhost:3001/api/users/<USER_ID>/promote" -Headers @{Authorization="Bearer $token"}
  ```

  2) Vía consola (actualizando la base de datos SQLite directamente):
  ```powershell
  cd backend
  node -e "const Database = require('better-sqlite3'); const db = new Database('./src/data/recipes.db'); db.prepare('UPDATE users SET role=? WHERE email=?').run('admin','tu-email@ejemplo.com'); console.log('Usuario promovido a admin'); db.close();"
  ```

Nota: En producción (Railway/Render) asegúrate de configurar `JWT_SECRET` y, si usas la opción A, `ADMIN_EMAILS` en el servicio del backend.

---

## Requisitos

- **Node.js** 18 o superior

---

## Estructura del proyecto

```
recetas/
  backend/
    src/
      db.js
      server.js
      data/
        recipes.json   # Fuente opcional para migración/importación
      scripts/
        import-recipes.js
    package.json
  frontend/
    src/
      components/
      pages/
      styles.scss
      App.jsx
      main.jsx
    index.html
    package.json
  package.json
  README.md
```

---

## Desarrollo local

Instalación de dependencias en monorepo y ejecución en paralelo de frontend y backend.

```powershell
# En la raíz del repositorio
npm install

# Levanta backend (http://localhost:3001) y frontend (http://localhost:5173)
npm run dev
```

**Nota:** Durante el desarrollo, el frontend consume la API en la misma máquina usando rutas relativas a `/api` a través de la configuración de desarrollo.

---

## Variables de entorno del frontend

Para producción, el frontend necesita la URL base del backend mediante `VITE_API_BASE`.

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_BASE` | URL base del backend | `https://tu-backend.onrender.com` |

**Configuración en Vercel:**
## Variables de entorno del backend

Agregar la variable `JWT_SECRET` en el servicio donde desplegues el backend para asegurar la firma de los tokens.

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `JWT_SECRET` | Clave secreta para firmar JWT | `b1f6e0f9a4c24f5f9d0a3d...` |

Generar una secreta rápida:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Si no se define, se usa un valor de desarrollo (`dev-secret`). No usar en producción.

---
1. Ve a Project Settings → Environment Variables
2. Agrega la variable `VITE_API_BASE`
3. Realiza un redeploy

---

## Despliegue

### Frontend (Vercel)
- **URL de producción:** https://recetas-react-weld.vercel.app
- Este repositorio ya está configurado para deploy automático
- **Importante:** Configurar `VITE_API_BASE` apuntando al backend público

### Backend (Render / Railway)

**Servicios recomendados:** Render o Railway

| Configuración | Valor |
|---------------|-------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |

---

### Endpoints del backend

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/health` | Estado de la API | Público |
| `GET` | `/api/recipes` | Lista de recetas | Público |
| `GET` | `/api/recipes/:id` | Detalle de receta | Público |
| `POST` | `/api/recipes` | Crea una receta | Bearer JWT |
| `PUT` | `/api/recipes/:id` | Actualiza una receta | Bearer JWT |
| `DELETE` | `/api/recipes/:id` | Elimina una receta | Bearer JWT |
| `POST` | `/api/register` | Registro de usuario | Público |
| `POST` | `/api/login` | Login de usuario | Público |
| `GET` | `/api/me` | Perfil autenticado | Bearer JWT |
| `GET` | `/api/favorites` | Listar recetas favoritas del usuario | Bearer JWT |
| `POST` | `/api/recipes/:id/like` | Marcar receta como favorita | Bearer JWT |
| `DELETE` | `/api/recipes/:id/like` | Quitar receta de favoritos | Bearer JWT |

**Estructura de receta:**

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "ingredients": ["string"],
  "steps": ["string"],
  "image": "string",
  "category": ["string"],
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

**Favoritos (relación):**
La tabla `favorites` almacena pares `userId` y `recipeId`. Un usuario solo puede marcar una vez cada receta.

```json
{
  "userId": "string",
  "recipeId": "string",
  "createdAt": "ISO-8601"
}
```

### Uso en frontend

- Hook `useFavorites()` obtiene el array de recetas favoritas.
- Mutaciones `useLikeRecipe()` y `useUnlikeRecipe()` para marcar / desmarcar.
- Botón togglable en `RecipeDetail`: muestra `★ Favorito` o `☆ Favorito`.
- Página `Favorites.jsx` lista todas las recetas favoritas del usuario autenticado.

---

## Importación de recetas a la base de datos

El backend incluye un script para importar recetas desde un archivo JSON o módulo JS (ESM) que exporte un array de recetas.

### Uso

```powershell
# Desde la carpeta backend (o usando -w backend desde la raíz)
npm run import:recipes -- ./src/data/recipes.json

# También puedes pasar un archivo externo
node src/scripts/import-recipes.js C:\\ruta\\a\\mis-recetas.json
```

**Nota:** La primera ejecución de la API migrará automáticamente desde `backend/src/data/recipes.json` a SQLite si la tabla está vacía.

---

## Scripts útiles

| Script | Comando | Descripción |
|--------|---------|-------------|
| Desarrollo | `npm run dev` | Backend y frontend en paralelo |
| Backend solo | `npm start` | Inicia solo el backend |
| Build frontend | `npm run build` | Compila el frontend |
| Importar recetas | `npm run import:recipes -w backend` | Ejecuta el importador en el backend |

---

## Notas

- **Seguridad:** Incluye autenticación JWT básica. Para producción agrega rate limiting, cookies httpOnly y rotación de tokens.
- **Persistencia:** SQLite en archivo con WAL habilitado. El archivo se ubica en `backend/src/data/recipes.db`.

---

## Licencia

Este proyecto es de c�digo abierto bajo licencia MIT.
